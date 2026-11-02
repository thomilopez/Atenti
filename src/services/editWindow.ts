/**
 * Ventana de edición de denuncia (RF-023).
 *
 * El autor de la denuncia puede corregir sus datos dentro de las 24hs
 * posteriores al envío. Fuera de ese plazo la edición queda bloqueada.
 */

export const VENTANA_EDICION_HORAS = 24;
export const VENTANA_EDICION_MS = VENTANA_EDICION_HORAS * 60 * 60 * 1000;

/** Devuelve los milisegundos restantes de la ventana de edición. */
export function milisegundosRestantes(creadaEn: string | number, ahora: number = Date.now()): number {
  const base = typeof creadaEn === 'number' ? creadaEn : new Date(creadaEn).getTime();
  if (Number.isNaN(base)) return 0;
  return Math.max(0, base + VENTANA_EDICION_MS - ahora);
}

/** Indica si la denuncia todavía es editable. */
export function puedeEditar(creadaEn: string | number, ahora: number = Date.now()): boolean {
  return milisegundosRestantes(creadaEn, ahora) > 0;
}

/** Texto legible de la cuenta regresiva (ej: "23h 12m"). */
export function textoRestante(creadaEn: string | number, ahora: number = Date.now()): string {
  const restante = milisegundosRestantes(creadaEn, ahora);
  if (restante <= 0) return '0h 0m';
  const horas = Math.floor(restante / (60 * 60 * 1000));
  const minutos = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
  return `${horas}h ${minutos}m`;
}
