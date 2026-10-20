/**
 * Autocompletado de identificadores (RF-003, RF-061).
 *
 * Sugiere identificadores a partir de las denuncias cargadas y, cuando no hay
 * coincidencia exacta, propone la más cercana ("Quiso decir...").
 */
import { IdentifierType, IncidentReport } from '../types';
import { similitudTexto } from './fuzzySearch';

export interface Sugerencia {
  value: string;
  type: IdentifierType;
  score: number;
}

export function sugerirIdentificadores(
  query: string,
  incidents: IncidentReport[],
  max = 5
): Sugerencia[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const mapa = new Map<string, Sugerencia>();
  for (const inc of incidents) {
    const valor = inc.identifierValue;
    const exacto = valor.toLowerCase().includes(q);
    const score = exacto ? 1 : similitudTexto(q, valor.toLowerCase());
    if (exacto || score >= 0.6) {
      const key = `${inc.identifierType}:${valor}`;
      if (!mapa.has(key)) {
        mapa.set(key, { value: valor, type: inc.identifierType, score });
      }
    }
  }

  return Array.from(mapa.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

/** Devuelve la corrección más probable si la consulta no matchea exacto. */
export function sugerirCorreccion(
  query: string,
  incidents: IncidentReport[]
): Sugerencia | null {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return null;

  let mejor: Sugerencia | null = null;
  for (const inc of incidents) {
    const valor = inc.identifierValue;
    if (valor.toLowerCase() === q) continue;
    const score = similitudTexto(q, valor.toLowerCase());
    if (score >= 0.7 && (!mejor || score > mejor.score)) {
      mejor = { value: valor, type: inc.identifierType, score };
    }
  }
  return mejor;
}
