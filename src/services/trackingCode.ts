/** Codigo publico AT-2026-XXXXXX y normalizacion para consultas historicas. */

export function formatTrackingCode(seq: number): string {
  const padded = String(Math.max(0, Math.floor(seq))).padStart(6, '0');
  return `AT-2026-${padded}`;
}

/** Normaliza un codigo escrito con espacios, guiones o minusculas. */
export function normalizeTrackingCode(code: string): string {
  const limpio = (code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = /^AT2026(\d{4,6})$/.exec(limpio);
  return match ? `AT-2026-${match[1]}` : (code ?? '').trim().toUpperCase();
}

/** Acepta el formato nuevo de 6 digitos y los codigos historicos de 4. */
export function isValidTrackingCode(code: unknown): boolean {
  if (typeof code !== 'string') return false;
  return /^AT-2026-\d{4,6}$/.test(normalizeTrackingCode(code));
}
