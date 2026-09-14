/**
 * Bloque A · T02 — Máquina de estados de denuncia (Etapa 3 §4).
 * RECIBIDA -> PUBLICADA -> EN_DISPUTA -> RESUELTA. Sin saltos (RG-10).
 * I-05: estado_actual == destino del último evento de HistorialEstado.
 * RG-11: cerrar disputa exige nota del moderador.
 */

export type DenunciaEstado = 'RECIBIDA' | 'PUBLICADA' | 'EN_DISPUTA' | 'RESUELTA';

const TRANSITIONS: Record<DenunciaEstado, DenunciaEstado[]> = {
  RECIBIDA: ['PUBLICADA'],
  PUBLICADA: ['EN_DISPUTA'],
  EN_DISPUTA: ['RESUELTA'],
  RESUELTA: [],
};

export function allowedTransitions(from: DenunciaEstado): DenunciaEstado[] {
  return [...(TRANSITIONS[from] ?? [])];
}

export function canTransition(from: DenunciaEstado, to: DenunciaEstado): boolean {
  return allowedTransitions(from).includes(to);
}

export class IllegalStateTransitionError extends Error {
  readonly from: DenunciaEstado;
  readonly to: DenunciaEstado;
  constructor(from: DenunciaEstado, to: DenunciaEstado) {
    super(`Transición ilegal ${from} -> ${to} (RG-10)`);
    this.name = 'IllegalStateTransitionError';
    this.from = from;
    this.to = to;
  }
}

export function assertTransition(from: DenunciaEstado, to: DenunciaEstado): void {
  if (!canTransition(from, to)) throw new IllegalStateTransitionError(from, to);
}

export interface HistorialEvento {
  id: string;
  denunciaId: string;
  origen: DenunciaEstado | null;
  destino: DenunciaEstado;
  fecha: string;
  actorId?: string;
  nota?: string;
}

export function buildHistorialEvento(params: {
  denunciaId: string;
  origen: DenunciaEstado | null;
  destino: DenunciaEstado;
  actorId?: string;
  nota?: string;
}): HistorialEvento {
  if (params.origen !== null) assertTransition(params.origen, params.destino);
  // RG-11: resolución de disputa exige nota
  if (params.destino === 'RESUELTA' && !params.nota?.trim()) {
    throw new Error('RG-11: la resolución a RESUELTA exige nota del moderador');
  }
  return {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    denunciaId: params.denunciaId,
    origen: params.origen,
    destino: params.destino,
    fecha: new Date().toISOString(),
    actorId: params.actorId,
    nota: params.nota,
  };
}

/** I-05: verifica que estado_actual coincida con el último evento. */
export function checkInvarianteI05(
  estadoActual: DenunciaEstado,
  historial: HistorialEvento[],
): boolean {
  if (historial.length === 0) return false;
  return historial[historial.length - 1].destino === estadoActual;
}
