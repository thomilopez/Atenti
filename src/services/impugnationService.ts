/**
 * Servicio de impugnaciones (RF-073 a RF-076).
 *
 * Presenta una impugnación, aplica take-down a la denuncia (EN_DISPUTA),
 * avisa al denunciante, gestiona el plazo de 72hs y la escalación.
 */
import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured, actualizarEstadoDenuncia, obtenerDenuncia } from './firebase';
import { crearNotificacion } from './notificationService';
import { IncidentReport } from '../types';

export const PLAZO_RESPUESTA_HORAS = 72;
export const PLAZO_RESPUESTA_MS = PLAZO_RESPUESTA_HORAS * 60 * 60 * 1000;

export type EstadoImpugnacion = 'PENDIENTE' | 'RESPONDIDA' | 'ESCALADA' | 'RESUELTA';

export interface Impugnacion {
  id: string;
  denunciaId: string;
  codigo: string;
  uidDenunciante: string;
  cuitODni: string;
  descargo: string;
  actorId: string;
  estado: EstadoImpugnacion;
  creadaEn: string;
  deadline: string;
  respuesta?: string;
  respondidaEn?: string;
  escalada: boolean;
  resultado?: 'PUBLICADA' | 'RETIRADA';
}

const memoria: Impugnacion[] = [];

/** RF-073: solo dígitos, longitud 7 a 11. */
export function validarDocumento(valor: string): boolean {
  const limpio = (valor ?? '').replace(/[.\s-]/g, '');
  return /^\d{7,11}$/.test(limpio);
}

export function validarDescargo(valor: string): boolean {
  return (valor ?? '').trim().length >= 20;
}

export function tiempoRestante(deadline: string, ahora: number = Date.now()): number {
  const fin = new Date(deadline).getTime();
  if (Number.isNaN(fin)) return 0;
  return Math.max(0, fin - ahora);
}

export function estaVencida(deadline: string, ahora: number = Date.now()): boolean {
  return tiempoRestante(deadline, ahora) <= 0;
}

export function formatearRestante(deadline: string, ahora: number = Date.now()): string {
  const restante = tiempoRestante(deadline, ahora);
  if (restante <= 0) return 'Plazo vencido';
  const horas = Math.floor(restante / (60 * 60 * 1000));
  const minutos = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
  return `${horas}h ${minutos}m restantes`;
}

/** RF-073/RF-074: registra la impugnación y aplica take-down. */
export async function crearImpugnacion(params: {
  denunciaId: string;
  cuitODni: string;
  descargo: string;
  actorId: string;
}): Promise<Impugnacion> {
  if (!validarDocumento(params.cuitODni)) {
    throw new Error('Ingresá un CUIT/DNI válido (solo dígitos, 7 a 11).');
  }
  if (!validarDescargo(params.descargo)) {
    throw new Error('El descargo debe tener al menos 20 caracteres.');
  }

  const reporte: IncidentReport | null = obtenerDenuncia(params.denunciaId);
  if (!reporte) throw new Error('Denuncia no encontrada');

  // Take-down: PUBLICADA -> EN_DISPUTA (la denuncia sale del buscador).
  await actualizarEstadoDenuncia({
    denunciaId: params.denunciaId,
    destino: 'EN_DISPUTA',
    actorId: params.actorId,
    nota: `Impugnación: ${params.descargo.trim().slice(0, 80)}`,
  });

  const creadaEn = new Date();
  const impugnacion: Impugnacion = {
    id: `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    denunciaId: params.denunciaId,
    codigo: reporte.trackingCode,
    uidDenunciante: reporte.audit.uid,
    cuitODni: params.cuitODni.replace(/[.\s-]/g, ''),
    descargo: params.descargo.trim(),
    actorId: params.actorId,
    estado: 'PENDIENTE',
    creadaEn: creadaEn.toISOString(),
    deadline: new Date(creadaEn.getTime() + PLAZO_RESPUESTA_MS).toISOString(),
    escalada: false,
  };

  memoria.unshift(impugnacion);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'impugnaciones', impugnacion.id), {
        ...impugnacion,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('crearImpugnacion: Firestore no disponible:', e);
    }
  }

  // RF-075: avisar al denunciante original.
  await crearNotificacion({
    uid: reporte.audit.uid,
    tipo: 'IMPUGNACION',
    mensaje: `Tu denuncia ${reporte.trackingCode} recibió una impugnación. Tenés 72hs para responder.`,
    denunciaId: params.denunciaId,
  });

  return impugnacion;
}

export async function listarImpugnaciones(): Promise<Impugnacion[]> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'impugnaciones')));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Impugnacion, 'id'>) }));
      }
    } catch (e) {
      console.warn('listarImpugnaciones: Firestore no disponible:', e);
    }
  }
  return [...memoria];
}

export async function obtenerImpugnacionPorDenuncia(
  denunciaId: string
): Promise<Impugnacion | null> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'impugnaciones'), where('denunciaId', '==', denunciaId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...(d.data() as Omit<Impugnacion, 'id'>) };
      }
    } catch (e) {
      console.warn('obtenerImpugnacionPorDenuncia: Firestore no disponible:', e);
    }
  }
  return memoria.find((i) => i.denunciaId === denunciaId) ?? null;
}

async function actualizarImpugnacion(
  impugnacion: Impugnacion,
  cambios: Partial<Impugnacion>
): Promise<void> {
  Object.assign(impugnacion, cambios);
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'impugnaciones', impugnacion.id), {
        ...cambios,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('actualizarImpugnacion: Firestore no disponible:', e);
    }
  }
}

/** RF-076: el denunciante responde dentro del plazo. */
export async function responderImpugnacion(
  denunciaId: string,
  respuesta: string
): Promise<Impugnacion | null> {
  const impugnacion = await obtenerImpugnacionPorDenuncia(denunciaId);
  if (!impugnacion) return null;
  if (impugnacion.estado === 'RESUELTA') return impugnacion;
  if (!respuesta.trim()) throw new Error('La respuesta no puede estar vacía');

  await actualizarImpugnacion(impugnacion, {
    respuesta: respuesta.trim(),
    respondidaEn: new Date().toISOString(),
    estado: 'RESPONDIDA',
  });
  return impugnacion;
}

/** RF-076: escala a moderación las impugnaciones vencidas (idempotente). */
export async function escalarImpugnacionesVencidas(
  ahora: number = Date.now()
): Promise<number> {
  const todas = await listarImpugnaciones();
  let escaladas = 0;

  for (const impugnacion of todas) {
    if (impugnacion.estado === 'RESUELTA' || impugnacion.escalada) continue;
    if (!estaVencida(impugnacion.deadline, ahora)) continue;

    await actualizarImpugnacion(impugnacion, { escalada: true, estado: 'ESCALADA' });
    await crearNotificacion({
      uid: 'admin',
      tipo: 'ESCALADA',
      mensaje: `La impugnación de ${impugnacion.codigo} venció y escaló a moderación.`,
      denunciaId: impugnacion.denunciaId,
    });
    escaladas++;
  }

  return escaladas;
}

/** Cierra la impugnación cuando el admin resuelve la disputa. */
export async function cerrarImpugnacion(
  denunciaId: string,
  resultado: 'PUBLICADA' | 'RETIRADA'
): Promise<void> {
  const impugnacion = await obtenerImpugnacionPorDenuncia(denunciaId);
  if (!impugnacion) return;

  await actualizarImpugnacion(impugnacion, { estado: 'RESUELTA', resultado });

  await crearNotificacion({
    uid: impugnacion.uidDenunciante,
    tipo: 'DISPUTA_RESUELTA',
    mensaje: `La disputa de ${impugnacion.codigo} fue resuelta (${resultado}).`,
    denunciaId,
  });
}
