/**
 * Historial de credibilidad por denuncia (RF-049).
 *
 * Registra cada variación del score con fecha y motivo. Persiste en Firestore
 * (`historialScore`) con fallback en memoria para el modo demo.
 */
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface EventoScore {
  id: string;
  denunciaId: string;
  score: number;
  motivo: string;
  fecha: string;
}

const memoria = new Map<string, EventoScore[]>();

export async function registrarCambioScore(params: {
  denunciaId: string;
  score: number;
  motivo: string;
}): Promise<EventoScore> {
  const evento: EventoScore = {
    id: `score_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    denunciaId: params.denunciaId,
    score: params.score,
    motivo: params.motivo,
    fecha: new Date().toISOString(),
  };

  const lista = memoria.get(params.denunciaId) ?? [];
  lista.push(evento);
  memoria.set(params.denunciaId, lista);

  if (isFirebaseConfigured) {
    try {
      await addDoc(collection(db, 'historialScore'), {
        ...evento,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('registrarCambioScore: Firestore no disponible:', e);
    }
  }

  return evento;
}

export async function obtenerHistorialScore(denunciaId: string): Promise<EventoScore[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'historialScore'), where('denunciaId', '==', denunciaId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as EventoScore)
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      }
    } catch (e) {
      console.warn('obtenerHistorialScore: Firestore no disponible:', e);
    }
  }
  return [...(memoria.get(denunciaId) ?? [])];
}
