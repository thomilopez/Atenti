/**
 * Notificaciones in-app (RF-075, RF-079).
 *
 * Registra avisos para el denunciante. El envío push y el centro completo se
 * implementan en el cambio `notificaciones`; aquí solo se persisten y listan.
 */
import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export type TipoNotificacion =
  | 'IMPUGNACION'
  | 'DISPUTA_RESUELTA'
  | 'ESCALADA'
  | 'CORROBORACION'
  | 'CAMBIO_ESTADO';

export interface Notificacion {
  id: string;
  uid: string;
  tipo: TipoNotificacion;
  mensaje: string;
  denunciaId?: string;
  leida: boolean;
  fecha: string;
}

const memoria: Notificacion[] = [];

export async function crearNotificacion(params: {
  uid: string;
  tipo: TipoNotificacion;
  mensaje: string;
  denunciaId?: string;
}): Promise<Notificacion> {
  const notificacion: Notificacion = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    uid: params.uid || 'anonimo',
    tipo: params.tipo,
    mensaje: params.mensaje,
    denunciaId: params.denunciaId,
    leida: false,
    fecha: new Date().toISOString(),
  };

  memoria.unshift(notificacion);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'notificaciones', notificacion.id), {
        ...notificacion,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('crearNotificacion: Firestore no disponible:', e);
    }
  }

  return notificacion;
}

export async function listarNotificaciones(uid?: string): Promise<Notificacion[]> {
  if (isFirebaseConfigured) {
    try {
      const referencia = collection(db, 'notificaciones');
      const q = uid ? query(referencia, where('uid', '==', uid)) : query(referencia);
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Notificacion, 'id'>) }))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }
    } catch (e) {
      console.warn('listarNotificaciones: Firestore no disponible:', e);
    }
  }
  return uid ? memoria.filter((n) => n.uid === uid) : [...memoria];
}

export async function marcarNotificacionLeida(id: string): Promise<void> {
  const enMemoria = memoria.find((n) => n.id === id);
  if (enMemoria) enMemoria.leida = true;
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'notificaciones', id), { leida: true });
    } catch (e) {
      console.warn('marcarNotificacionLeida: Firestore no disponible:', e);
    }
  }
}
