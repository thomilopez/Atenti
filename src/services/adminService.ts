/**
 * Servicio de administración y moderación (RF-066 a RF-072).
 *
 * Agrupa el listado de disputas, la resolución, la auditoría completa, la
 * gestión de usuarios, las métricas y la generación del dataset anonimizado.
 */
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, actualizarEstadoDenuncia, obtenerDenuncia, getHistorial } from './firebase';
import { IncidentReport } from '../types';

export interface UsuarioAdmin {
  uid: string;
  email: string;
  denuncias: number;
  suspendido: boolean;
}

export interface MetricaDia {
  fecha: string;
  cantidad: number;
}

export interface MetricaCategoria {
  categoria: string;
  cantidad: number;
}

export interface MetricasAdmin {
  total: number;
  promedioScore: number;
  enDisputa: number;
  porDia: MetricaDia[];
  topCategorias: MetricaCategoria[];
}

export interface FilaDataset {
  codigo: string;
  categoria: string;
  estado: string;
  score: number;
  fecha: string;
  localidad: string;
}

async function cargarTodas(): Promise<IncidentReport[]> {
  // Import dinámico para evitar ciclos con firebase.ts en el arranque.
  const { getIncidents } = await import('./firebase');
  return getIncidents(undefined, undefined, { incluirEnDisputa: true });
}

/** RF-066: denuncias que requieren moderación. */
export async function listarDenunciasEnDisputa(): Promise<IncidentReport[]> {
  const todas = await cargarTodas();
  return todas.filter((d) => (d.estadoActual ?? 'PUBLICADA') === 'EN_DISPUTA');
}

/**
 * RF-067: resuelve una disputa.
 * - MANTENER: EN_DISPUTA -> PUBLICADA (vuelve al buscador).
 * - RETIRAR: EN_DISPUTA -> RESUELTA (exige nota, sale del buscador).
 */
export async function resolverDisputa(params: {
  denunciaId: string;
  decision: 'MANTENER' | 'RETIRAR';
  nota: string;
  actorId: string;
}): Promise<IncidentReport> {
  const nota = params.nota.trim();
  if (params.decision === 'RETIRAR' && !nota) {
    throw new Error('RF-067: retirar la denuncia exige una nota justificativa');
  }
  const destino = params.decision === 'MANTENER' ? 'PUBLICADA' : 'RESUELTA';
  return actualizarEstadoDenuncia({
    denunciaId: params.denunciaId,
    destino,
    actorId: params.actorId,
    nota: nota || undefined,
  });
}

/** RF-068: auditoría completa de una denuncia. */
export async function obtenerAuditoria(denunciaId: string): Promise<{
  reporte: IncidentReport | null;
  historial: ReturnType<typeof getHistorial>;
}> {
  return {
    reporte: obtenerDenuncia(denunciaId),
    historial: getHistorial(denunciaId),
  };
}

const suspendidos = new Map<string, boolean>();

/** RF-070: usuarios derivados de las denuncias, con estado de suspensión. */
export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const todas = await cargarTodas();
  const mapa = new Map<string, UsuarioAdmin>();
  for (const d of todas) {
    const uid = d.audit.uid;
    const actual = mapa.get(uid);
    if (actual) {
      actual.denuncias += 1;
    } else {
      mapa.set(uid, {
        uid,
        email: d.audit.userEmail,
        denuncias: 1,
        suspendido: suspendidos.get(uid) ?? false,
      });
    }
  }
  return Array.from(mapa.values());
}

/** RF-070: suspende o reactiva una cuenta. */
export async function cambiarSuspension(uid: string, suspendido: boolean): Promise<void> {
  suspendidos.set(uid, suspendido);
  if (isFirebaseConfigured) {
    try {
      await setDoc(
        doc(db, 'usuarios', uid),
        { suspendido, _serverTimestamp: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.warn('cambiarSuspension: Firestore no disponible:', e);
    }
  }
}

/** RF-071: métricas de administración. */
export async function calcularMetricas(): Promise<MetricasAdmin> {
  const todas = await cargarTodas();
  const total = todas.length;
  const promedioScore =
    total === 0
      ? 0
      : Math.round(todas.reduce((acc, d) => acc + d.credibilityScore, 0) / total);
  const enDisputa = todas.filter((d) => d.estadoActual === 'EN_DISPUTA').length;

  const hoy = new Date();
  const porDia: MetricaDia[] = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const clave = fecha.toISOString().slice(0, 10);
    const cantidad = todas.filter((d) => d.audit.createdAt.slice(0, 10) === clave).length;
    porDia.push({ fecha: clave, cantidad });
  }

  const conteoCat = new Map<string, number>();
  todas.forEach((d) => conteoCat.set(d.category, (conteoCat.get(d.category) ?? 0) + 1));
  const topCategorias = Array.from(conteoCat.entries())
    .map(([categoria, cantidad]) => ({ categoria, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return { total, promedioScore, enDisputa, porDia, topCategorias };
}

/** RF-072: dataset sin datos personales. */
export async function generarDatasetAnonimizado(): Promise<FilaDataset[]> {
  const todas = await cargarTodas();
  return todas.map((d) => ({
    codigo: d.trackingCode,
    categoria: d.category,
    estado: d.estadoActual ?? 'PUBLICADA',
    score: d.credibilityScore,
    fecha: d.audit.createdAt,
    localidad: d.location.city ?? '',
  }));
}
