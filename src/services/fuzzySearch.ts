/**
 * Búsqueda tolerante a errores tipográficos (RF-061).
 *
 * Usa distancia de Levenshtein para sugerir la coincidencia más cercana y
 * filtrar resultados aunque el texto tenga pequeñas diferencias.
 */

export function levenshtein(a: string, b: string): number {
  const s = a ?? '';
  const t = b ?? '';
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const costo = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + costo);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }

  return prev[n];
}

/** Similitud normalizada 0..1 basada en Levenshtein. */
export function similitudTexto(a: string, b: string): number {
  const s = (a ?? '').toLowerCase().trim();
  const t = (b ?? '').toLowerCase().trim();
  const max = Math.max(s.length, t.length);
  if (max === 0) return 1;
  return 1 - levenshtein(s, t) / max;
}

/**
 * Devuelve las coincidencias más cercanas a `query` dentro de `candidatos`.
 * Solo incluye las que superan `umbral` de similitud.
 */
export function sugerirCoincidencia(
  query: string,
  candidatos: string[],
  umbral = 0.7
): string[] {
  return candidatos
    .map((c) => ({ c, score: similitudTexto(query, c) }))
    .filter((x) => x.score >= umbral)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);
}

/** Indica si un texto es "suficientemente parecido" a la consulta. */
export function coincideConTolerancia(query: string, texto: string, umbral = 0.7): boolean {
  return similitudTexto(query, texto) >= umbral;
}
