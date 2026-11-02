/**
 * Tendencias del inicio: identificadores mas reportados.
 */
import { IdentifierType, IncidentReport } from '../types';

export interface Tendencia {
  value: string;
  type: IdentifierType;
  count: number;
}

export function calcularTendencias(
  incidents: IncidentReport[],
  max = 5
): Tendencia[] {
  const mapa = new Map<string, Tendencia>();

  for (const inc of incidents) {
    const key = `${inc.identifierType}:${inc.identifierValue}`;
    const existente = mapa.get(key);
    if (existente) {
      existente.count += 1;
    } else {
      mapa.set(key, {
        value: inc.identifierValue,
        type: inc.identifierType,
        count: 1,
      });
    }
  }

  return Array.from(mapa.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}
