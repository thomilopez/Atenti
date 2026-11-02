/**
 * Borrado lógico de denuncias (RF-024).
 *
 * La eliminación exige un motivo justificativo y marca la denuncia como
 * eliminada sin borrar el registro, para que no aparezca en el listado público.
 */
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { IncidentReport } from '../types';

export interface EliminacionDenuncia {
  denunciaId: string;
  uid: string;
  motivo: string;
  solicitadaEn: string;
  estado: 'ELIMINADA';
}

/** Marca la denuncia como eliminada (soft delete) y registra el motivo. */
export async function eliminarDenuncia(params: {
  reporte: IncidentReport;
  uid: string;
  motivo: string;
}): Promise<EliminacionDenuncia> {
  const motivo = params.motivo?.trim();
  if (!motivo) {
    throw new Error('RF-024: la eliminación exige un motivo justificativo');
  }

  const eliminacion: EliminacionDenuncia = {
    denunciaId: params.reporte.id,
    uid: params.uid,
    motivo,
    solicitadaEn: new Date().toISOString(),
    estado: 'ELIMINADA',
  };

  // Reflejar en el objeto para que la UI reaccione de inmediato.
  params.reporte.eliminada = true;

  if (isFirebaseConfigured) {
    try {
      const batch = writeBatch(db);
      batch.set(
        doc(db, 'denuncias', params.reporte.id),
        { eliminada: true, motivoEliminacion: motivo, _serverTimestamp: serverTimestamp() },
        { merge: true }
      );
      batch.set(doc(db, 'eliminaciones', `${params.reporte.id}_baja`), {
        ...eliminacion,
        _serverTimestamp: serverTimestamp(),
      });
      await batch.commit();
    } catch (e) {
      console.warn('eliminarDenuncia: Firestore no disponible, se marca en memoria:', e);
    }
  }

  return eliminacion;
}

/** Excluye denuncias eliminadas o en disputa de un listado. */
export function listarDenunciasActivas(denuncias: IncidentReport[]): IncidentReport[] {
  return denuncias.filter((d) => !d.eliminada && d.estadoActual !== 'EN_DISPUTA');
}
