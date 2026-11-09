/**
 * Servicio de cuenta de usuario (RF-014, RF-086).
 *
 * Gestiona el cierre de sesión y la solicitud de baja definitiva de la cuenta
 * conforme a la Ley 25.326 de Protección de Datos Personales. Registra la
 * solicitud en Firestore; en modo demo queda en memoria.
 */
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { eliminarCuentaRemota } from './cloudFunctions';

export interface SolicitudBaja {
  uid: string;
  motivo: string;
  solicitadaEn: string;
  estado: 'PENDIENTE';
}

const solicitudesEnMemoria: SolicitudBaja[] = [];

/** RF-014/RF-086: registra una solicitud de eliminación de cuenta. */
export async function registrarSolicitudBaja(params: {
  uid: string;
  motivo: string;
}): Promise<SolicitudBaja> {
  const solicitud: SolicitudBaja = {
    uid: params.uid,
    motivo: params.motivo,
    solicitadaEn: new Date().toISOString(),
    estado: 'PENDIENTE',
  };

  solicitudesEnMemoria.push(solicitud);

  if (isFirebaseConfigured) {
    try {
      const batch = writeBatch(db);
      const ref = doc(collection(db, 'solicitudes_baja'));
      batch.set(ref, { ...solicitud, _serverTimestamp: serverTimestamp() });
      await batch.commit();
    } catch (e) {
      console.warn('registrarSolicitudBaja: Firestore no disponible, se guarda en memoria:', e);
    }
  }

  return solicitud;
}

/** RF-014/RF-086: borra la cuenta de verdad (Auth + Firestore) via Cloud Function. */
export async function eliminarCuenta(params: {
  uid: string;
  motivo: string;
}): Promise<void> {
  if (!isFirebaseConfigured) {
    solicitudesEnMemoria.push({
      uid: params.uid,
      motivo: params.motivo,
      solicitadaEn: new Date().toISOString(),
      estado: 'PENDIENTE',
    });
    return;
  }
  await eliminarCuentaRemota(params.motivo);
}
