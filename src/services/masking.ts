/**
 * Bloque A · T04 — Proyección pública enmascarada (RG-08 / I-07, Ley 25.326).
 * La UI pública jamás recibe llaves primarias internas sensibles ni email del emisor.
 */
import type { IdentifierType, IncidentReport } from '../types';

export function maskIdentifier(type: IdentifierType, value: string): string {
  const v = (value ?? '').trim();
  if (!v) return '***';
  if (type === 'Alias') {
    if (v.length <= 3) return '***';
    return `${v.slice(0, 2)}**.${v.slice(-2)}`;
  }
  if (type === 'CBU') {
    const digits = v.replace(/\D/g, '');
    return `****...${digits.slice(-4)}`;
  }
  if (type === 'Tel') {
    const digits = v.replace(/\D/g, '');
    return `****...${digits.slice(-4)}`;
  }
  // Local: oculta numeración exacta, conserva calle
  return v.length > 18 ? `${v.slice(0, 18)}...` : v;
}

export interface PublicIncidentProjection {
  codigo: string;
  tituloEnmascarado: string;
  categoria: IncidentReport['category'];
  relato: string;
  credibilidadPct: number;
  desglose: IncidentReport['credibilityBreakdown'];
  estado: string;
  ubicacion: IncidentReport['location'];
  evidenciasEnmascaradas: Array<{
    id: string;
    type: string;
    label: string;
    uri: string;
    ocrMatched?: boolean;
  }>;
  corroboraciones: number;
}

/** I-07: sin id interno, sin uid, sin email, sin IP. */
export function toPublicProjection(report: IncidentReport): PublicIncidentProjection {
  return {
    codigo: report.trackingCode,
    tituloEnmascarado: `${report.identifierType}: ${maskIdentifier(
      report.identifierType,
      report.identifierValue,
    )}`,
    categoria: report.category,
    relato: report.story,
    credibilidadPct: report.credibilityScore,
    desglose: report.credibilityBreakdown,
    estado: report.estadoActual ?? report.status,
    ubicacion: report.location,
    evidenciasEnmascaradas: (report.evidences ?? []).map((e) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      uri: e.uri,
      ocrMatched: e.ocrMatched,
    })),
    corroboraciones: report.corroborationCount,
  };
}
