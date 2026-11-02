/**
 * Preferencias de notificacion por tipo (RF-080).
 *
 * Se guardan en AsyncStorage y en Firestore (`notification_prefs`). La Cloud
 * Function de push las consulta antes de enviar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface PreferenciasNotificacion {
  estado: boolean;
  corroboracion: boolean;
  resolucion: boolean;
  relatos: boolean;
}

export const PREFERENCIAS_DEFAULT: PreferenciasNotificacion = {
  estado: true,
  corroboracion: true,
  resolucion: true,
  relatos: true,
};

function claveLocal(uid: string): string {
  return `@atenti_notif_prefs_${uid}`;
}

export async function cargarPreferencias(uid: string): Promise<PreferenciasNotificacion> {
  try {
    const local = await AsyncStorage.getItem(claveLocal(uid));
    if (local) {
      return { ...PREFERENCIAS_DEFAULT, ...(JSON.parse(local) as Partial<PreferenciasNotificacion>) };
    }
  } catch {
    // sigue con Firestore o defaults
  }

  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, 'notification_prefs', uid));
      if (snap.exists()) {
        return {
          ...PREFERENCIAS_DEFAULT,
          ...(snap.data() as Partial<PreferenciasNotificacion>),
        };
      }
    } catch (e) {
      console.warn('cargarPreferencias: Firestore no disponible:', e);
    }
  }

  return { ...PREFERENCIAS_DEFAULT };
}

export async function guardarPreferencias(
  uid: string,
  preferencias: PreferenciasNotificacion
): Promise<void> {
  try {
    await AsyncStorage.setItem(claveLocal(uid), JSON.stringify(preferencias));
  } catch (e) {
    console.warn('guardarPreferencias: no se pudo guardar local:', e);
  }

  if (isFirebaseConfigured) {
    try {
      await setDoc(
        doc(db, 'notification_prefs', uid),
        { ...preferencias, _serverTimestamp: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.warn('guardarPreferencias: Firestore no disponible:', e);
    }
  }
}

/** Indica si un tipo de notificacion esta habilitado segun las preferencias. */
export function preferenciaParaTipo(
  tipo: string,
  preferencias: PreferenciasNotificacion
): boolean {
  switch (tipo) {
    case 'CORROBORACION':
      return preferencias.corroboracion;
    case 'DISPUTA_RESUELTA':
      return preferencias.resolucion;
    case 'IMPUGNACION':
    case 'CAMBIO_ESTADO':
      return preferencias.estado;
    case 'RELATO_PUBLICADO':
    case 'RELATO_OCULTO':
      return preferencias.relatos;
    default:
      return true;
  }
}
