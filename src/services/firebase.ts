/**
 * Servicio de Firebase (Auth, Firestore, Storage)
 * Persistencia atómica de reportes con metadatos de auditoría (UID, IP, timestamp)
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import {
  AuditMetadata,
  EvidenceItem,
  IdentifierType,
  IncidentCategory,
  IncidentReport,
  LocationData,
  UserIdentityFactors,
} from '../types';
import { calculateRG07Score } from './credibility';
import { normalizeIdentifier, listarCategorias } from './normalize';
import {
  generateOperationKey,
  formatTrackingCode,
  isValidOperationKey,
  normalizeTrackingCode,
} from './operationKey';
import { FirestoreWriteError, NotFoundError, ValidationError } from './errors';
import { puedeEditar } from './editWindow';
import { MAX_BYTES, MAX_EVIDENCIAS, MIMES_PERMITIDOS } from './evidenceService';
import {
  DenunciaEstado,
  HistorialEvento,
  assertTransition,
  buildHistorialEvento,
  checkInvarianteI05,
} from './stateMachine';
import { toPublicProjection, PublicIncidentProjection } from './masking';
import { env, hasRealFirebaseConfig } from './env';
import { filtrarTexto } from './lexiconFilter';
import { getCache, setCache, invalidarCache } from './cacheService';

/** Indica si la app corre con credenciales reales de Firebase o en modo demo. */
export const isFirebaseConfigured = hasRealFirebaseConfig();

// Configuración de Firebase. Usa variables de entorno; si no están definidas
// arranca en modo demo con valores placeholders y fallback en memoria.
const firebaseConfig = {
  apiKey: env.firebase.apiKey || 'demo-api-key',
  authDomain: env.firebase.authDomain || 'demo.firebaseapp.com',
  projectId: env.firebase.projectId || 'demo-atenti',
  storageBucket: env.firebase.storageBucket || 'demo-atenti.appspot.com',
  messagingSenderId: env.firebase.messagingSenderId || '000000000000',
  appId: env.firebase.appId || 'demo-app-id',
};

// Inicialización de la App Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Semilla inicial con incidentes geolocalizados en Argentina (CABA, Córdoba, Rosario, Mendoza)
export const INITIAL_SEED_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc_001',
    trackingCode: 'AT-2026-8941',
    identifierType: 'Alias',
    identifierValue: 'ju.mp',
    title: 'Alias: ju.mp',
    category: 'Estafa Bancaria',
    story: 'Publicaron iPhones con descuento irreal en Instagram. Pedían seña obligatoria a este alias falso y luego bloquearon la cuenta.',
    location: {
      latitude: -34.603722,
      longitude: -58.381592,
      address: 'Av. Corrientes y 9 de Julio',
      city: 'CABA',
      province: 'Buenos Aires',
    },
    evidences: [
      {
        id: 'ev_1',
        type: 'chat_screenshot',
        label: 'Chat de Instagram con el estafador',
        uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
        ocrExtractedText: 'Transferí a ju.mp para reservar el equipo',
        ocrMatched: true,
        ocrConfidence: 0.95,
        isMasked: true,
        timestamp: 1772980000000,
      },
      {
        id: 'ev_2',
        type: 'bank_receipt',
        label: 'Comprobante de transferencia $95.000',
        uri: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        ocrExtractedText: 'Destino: ju.mp / Titular Apócrifo',
        ocrMatched: true,
        ocrConfidence: 0.92,
        isMasked: true,
        timestamp: 1772980500000,
      },
    ],
    credibilityScore: 80,
    credibilityBreakdown: {
      identityScore: 30,
      evidenceScore: 40,
      corroborationScore: 10,
      totalScore: 80,
      level: 'ALTA',
      trafficLight: 'green',
    },
    corroborationCount: 2,
    audit: {
      uid: 'usr_verified_test_1',
      userEmail: 'denunciante1@gmail.com',
      clientIp: '181.44.20.11',
      platform: 'android',
      createdAt: '2026-08-30T14:20:00Z',
    },
    status: 'publicada',
  },
  {
    id: 'inc_002',
    trackingCode: 'AT-2026-7203',
    identifierType: 'CBU',
    identifierValue: '0000003100084729103829',
    title: 'CBU: 0000003100084729103829',
    category: 'Phishing / Suplantación',
    story: 'Falso llamado de soporte técnico de billetera virtual alegando préstamo preaprobado para transferir fondos a este CBU.',
    location: {
      latitude: -34.5885,
      longitude: -58.4305,
      address: 'Palermo Soho',
      city: 'CABA',
      province: 'Buenos Aires',
    },
    evidences: [
      {
        id: 'ev_3',
        type: 'chat_screenshot',
        label: 'Mensaje de WhatsApp con CBU',
        uri: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
        ocrExtractedText: 'CBU: 0000003100084729103829',
        ocrMatched: true,
        isMasked: true,
        timestamp: 1772990000000,
      },
    ],
    credibilityScore: 65,
    credibilityBreakdown: {
      identityScore: 30,
      evidenceScore: 25,
      corroborationScore: 10,
      totalScore: 65,
      level: 'SOSPECHOSA',
      trafficLight: 'yellow',
    },
    corroborationCount: 2,
    audit: {
      uid: 'usr_verified_test_2',
      userEmail: 'alerta.palermo@gmail.com',
      clientIp: '190.191.12.88',
      platform: 'ios',
      createdAt: '2026-09-02T10:15:00Z',
    },
    status: 'publicada',
  },
  {
    id: 'inc_003',
    trackingCode: 'AT-2026-3112',
    identifierType: 'Tel',
    identifierValue: '1138492018',
    title: 'Tel: +54 9 11 3849-2018',
    category: 'Phishing / Suplantación',
    story: 'Llamados insistentes fingiendo ser del Ministerio de Capital Humano para pedir datos de home banking.',
    location: {
      latitude: -31.4201,
      longitude: -64.1888,
      address: 'Nueva Córdoba',
      city: 'Córdoba Capital',
      province: 'Córdoba',
    },
    evidences: [],
    credibilityScore: 35,
    credibilityBreakdown: {
      identityScore: 15,
      evidenceScore: 15,
      corroborationScore: 5,
      totalScore: 35,
      level: 'BAJA',
      trafficLight: 'red',
    },
    corroborationCount: 1,
    audit: {
      uid: 'usr_cordoba_1',
      userEmail: 'vecino.cba@gmail.com',
      clientIp: '186.136.80.12',
      platform: 'android',
      createdAt: '2026-09-04T18:00:00Z',
    },
    status: 'publicada',
  },
  {
    id: 'inc_004',
    trackingCode: 'AT-2026-9540',
    identifierType: 'Local',
    identifierValue: 'Av. Corrientes 1420',
    title: 'Local: Av. Corrientes 1420',
    category: 'Local Físico Ilícito',
    story: 'Supuesta cueva financiera que cobra comisiones por adelantado en efectivo y cierra la persiana.',
    location: {
      latitude: -34.6045,
      longitude: -58.3888,
      address: 'Av. Corrientes 1420',
      city: 'CABA',
      province: 'Buenos Aires',
    },
    evidences: [
      {
        id: 'ev_4',
        type: 'other',
        label: 'Foto de fachada del local con cartel apócrifo',
        uri: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400',
        isMasked: true,
        timestamp: 1773010000000,
      },
    ],
    credibilityScore: 78,
    credibilityBreakdown: {
      identityScore: 30,
      evidenceScore: 35,
      corroborationScore: 13,
      totalScore: 78,
      level: 'ALTA',
      trafficLight: 'green',
    },
    corroborationCount: 3,
    audit: {
      uid: 'usr_caba_central',
      userEmail: 'comercio.seguro@gmail.com',
      clientIp: '181.47.19.4',
      platform: 'web',
      createdAt: '2026-09-05T12:30:00Z',
    },
    status: 'publicada',
  },
];

// Almacén reactivo local con sincronización Firestore
let inMemoryIncidents: IncidentReport[] = [...INITIAL_SEED_INCIDENTS];

/**
 * Filtra una lista de incidencias por tipo de identificador y texto de búsqueda.
 * Por defecto excluye eliminadas y EN_DISPUTA (RF-065).
 */
function aplicarFiltros(
  lista: IncidentReport[],
  filterType?: IdentifierType,
  searchQuery?: string,
  incluirEnDisputa = false
): IncidentReport[] {
  return lista.filter((inc) => {
    if (inc.eliminada) return false;
    if (!incluirEnDisputa && inc.estadoActual === 'EN_DISPUTA') return false;
    if (filterType && inc.identifierType !== filterType) {
      return false;
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const qNormalizado = normalizeIdentifier(
        filterType ?? inc.identifierType,
        searchQuery
      );
      const valor = inc.valorNormalizado ??
        normalizeIdentifier(inc.identifierType, inc.identifierValue);
      const matchValue =
        inc.identifierValue.toLowerCase().includes(q) ||
        valor === qNormalizado ||
        valor.includes(qNormalizado);
      const matchTitle = (inc.title ?? '').toLowerCase().includes(q);
      const matchStory = (inc.story ?? '').toLowerCase().includes(q);
      const matchAddress = (inc.location?.address ?? '').toLowerCase().includes(q);
      return matchValue || matchTitle || matchStory || matchAddress;
    }
    return true;
  });
}

/**
 * Obtiene las incidencias. Lee de Firestore como fuente principal (solo
 * PUBLICADAS y no eliminadas) y usa el fallback en memoria solo si Firestore
 * no está configurado o falla.
 */
export async function getIncidents(
  filterType?: IdentifierType,
  searchQuery?: string,
  opciones?: { incluirEnDisputa?: boolean }
): Promise<IncidentReport[]> {
  const incluirEnDisputa = opciones?.incluirEnDisputa ?? false;
  const cacheKey = `incidents:${filterType ?? ''}:${searchQuery ?? ''}:${incluirEnDisputa}`;

  // RF-100: responder desde cache si esta vigente.
  const enCache = getCache<IncidentReport[]>(cacheKey);
  if (enCache) return enCache;

  let resultado: IncidentReport[] | null = null;

  if (isFirebaseConfigured) {
    try {
      // La vista publica solo necesita PUBLICADA; "Mis Denuncias"/admin
      // necesitan todos los estados y no deben perder las disputas.
      const q = incluirEnDisputa
        ? query(collection(db, 'denuncias'))
        : query(collection(db, 'denuncias'), where('estadoActual', '==', 'PUBLICADA'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docs = snapshot.docs
          .map(
            (d) => ({ id: d.id, ...(d.data() as Omit<IncidentReport, 'id'>) } as IncidentReport)
          )
          .filter((d) => !d.eliminada);

        // No reemplazar el indice completo con una consulta parcial.
        const porId = new Map(inMemoryIncidents.map((i) => [i.id, i]));
        docs.forEach((d) => porId.set(d.id, d));
        inMemoryIncidents = Array.from(porId.values());
        resultado = aplicarFiltros(docs, filterType, searchQuery, incluirEnDisputa);
      }
    } catch (error) {
      console.warn('getIncidents: Firestore no disponible, uso fallback en memoria:', error);
    }
  }

  if (!resultado) {
    resultado = aplicarFiltros(inMemoryIncidents, filterType, searchQuery, incluirEnDisputa);
  }

  setCache(cacheKey, resultado);
  return resultado;
}

export interface BusquedaPaginadaParams {
  filterType?: IdentifierType;
  searchQuery?: string;
  desde?: string;
  hasta?: string;
  categoria?: IncidentCategory;
  scoreMinimo?: number;
  pagina?: number;
  porPagina?: number;
  incluirEnDisputa?: boolean;
}

export interface ResultadoPaginado {
  items: IncidentReport[];
  total: number;
  pagina: number;
  porPagina: number;
  hayMas: boolean;
}

/** RF-062/RF-063: filtros avanzados + paginación para la búsqueda pública. */
export async function buscarIncidentesPaginados(
  params: BusquedaPaginadaParams
): Promise<ResultadoPaginado> {
  const todos = await getIncidents(params.filterType, params.searchQuery, {
    incluirEnDisputa: params.incluirEnDisputa,
  });

  const desdeNum = params.desde ? new Date(`${params.desde}T00:00:00`).getTime() : null;
  const hastaNum = params.hasta ? new Date(`${params.hasta}T23:59:59.999`).getTime() : null;
  const desde = Number.isFinite(desdeNum) ? desdeNum : null;
  const hasta = Number.isFinite(hastaNum) ? hastaNum : null;

  const filtrados = todos.filter((inc) => {
    if (params.categoria && inc.category !== params.categoria) return false;
    if (typeof params.scoreMinimo === 'number' && inc.credibilityScore < params.scoreMinimo) {
      return false;
    }
    if (desde !== null || hasta !== null) {
      const creado = new Date(inc.audit.createdAt).getTime();
      if (desde !== null && creado < desde) return false;
      if (hasta !== null && creado > hasta) return false;
    }
    return true;
  });

  const pagina = Math.max(1, params.pagina ?? 1);
  const porPagina = Math.max(1, params.porPagina ?? 10);
  const inicio = (pagina - 1) * porPagina;
  const items = filtrados.slice(inicio, inicio + porPagina);

  return {
    items,
    total: filtrados.length,
    pagina,
    porPagina,
    hayMas: inicio + porPagina < filtrados.length,
  };
}

// ============================================================================
// BLOQUE A — Núcleo transaccional Etapa 3 (T01/T02/T03/T04)
// ============================================================================

/** Índice idempotente en memoria: clave_operacion -> IncidentReport. */
const byOperationKey = new Map<string, IncidentReport>();
/** Historial en memoria por denuncia (I-05). */
const historialByDenuncia = new Map<string, HistorialEvento[]>();
/** Contador secuencial en memoria (fallback offline del counter de Firestore). */
let seqMemoria = 1000;

for (const seed of inMemoryIncidents) {
  if (!seed.valorNormalizado) {
    seed.valorNormalizado = normalizeIdentifier(seed.identifierType, seed.identifierValue);
  }
  if (!seed.estadoActual) seed.estadoActual = 'PUBLICADA';
  if (!seed.claveOperacion) seed.claveOperacion = `seed_${seed.id}`;
  byOperationKey.set(seed.claveOperacion, seed);
}

async function nextTrackingSequence(): Promise<number> {
  try {
    const counterRef = doc(db, 'atenti_counters', 'seguimiento');
    // Intento de lectura rápida; si no existe o falla, uso memoria.
    try {
      const snap = await getDoc(counterRef);
      const current = (snap.exists() ? (snap.data() as { seq?: number }).seq ?? 1000 : 1000) as number;
      const next = current + 1;
      try {
        await runTransaction(db, async (tx) => {
          tx.set(counterRef, { seq: next }, { merge: true });
        });
        return next;
      } catch {
        seqMemoria += 1;
        return seqMemoria;
      }
    } catch {
      seqMemoria += 1;
      return seqMemoria;
    }
  } catch {
    seqMemoria += 1;
    return seqMemoria;
  }
}

/** RG-06: devuelve el reporte ya procesado para esta clave, o null. */
export async function existeDenunciaPorClave(claveOperacion: string): Promise<IncidentReport | null> {
  const mem = byOperationKey.get(claveOperacion);
  if (mem) return mem;
  try {
    const incidentsCol = collection(db, 'denuncias');
    const q = query(incidentsCol, where('claveOperacion', '==', claveOperacion));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data() as IncidentReport;
  } catch {
    // offline: solo memoria
  }
  return null;
}

export interface RegistrarDenunciaInput {
  identifierType: IdentifierType;
  identifierValue: string;
  category: IncidentCategory;
  story: string;
  location: LocationData;
  evidences: EvidenceItem[];
  uid: string;
  userEmail: string;
  ddjjAceptada: boolean;
  googleVerificado: boolean;
  /** Factores reales del usuario para RG-07. */
  identityFactors?: UserIdentityFactors;
  /** IP capturada por la Function; el cliente usa 0.0.0.0 como fallback. */
  clientIp?: string;
  claveOperacion?: string;
  /** RF-082: hash de la DDJJ con IP y timestamp. */
  ddjjHash?: string;
  ddjjAceptadaEn?: string;
}

export interface RegistrarDenunciaResult {
  codigo: string;
  pct: number;
  reporte: IncidentReport;
  idempotente: boolean;
}

/**
 * OPERACIÓN registrarDenuncia — pseudocódigo Etapa 3 §5 llevado a código.
 * 1) Requiere Google + DDJJ (RG-01). 2) Idempotencia (RG-06).
 * 3) Transacción atómica Denuncia+Objetivo+Ubicación+Evidencias+Historial (RG-04).
 * 4) RECIBIDA -> PUBLICADA automático si pct>=20 (camino principal Etapa 2 §4.1).
 */
export async function registrarDenuncia(input: RegistrarDenunciaInput): Promise<RegistrarDenunciaResult> {
  if (!input.googleVerificado || !input.ddjjAceptada) {
    throw new ValidationError('RG-01: se requiere sesión válida y DDJJ aceptada');
  }
  const claveOperacion = input.claveOperacion?.trim() || generateOperationKey();
  if (!isValidOperationKey(claveOperacion)) {
    throw new ValidationError('RG-06: clave_operacion inválida');
  }

  // RG-02: relato mínimo de 20 caracteres y al menos una evidencia.
  if ((input.story ?? '').trim().length < 20) {
    throw new ValidationError('RG-02: el relato debe tener al menos 20 caracteres');
  }
  if ((input.evidences ?? []).length < 1) {
    throw new ValidationError('RG-02: se requiere al menos una evidencia');
  }
  if (input.evidences.length > MAX_EVIDENCIAS) {
    throw new ValidationError(`Se permiten hasta ${MAX_EVIDENCIAS} evidencias`);
  }
  for (const evidencia of input.evidences) {
    if (typeof evidencia.size === 'number' && evidencia.size > MAX_BYTES) {
      throw new ValidationError('Cada evidencia debe pesar menos de 10MB');
    }
    const mime = (evidencia.mimeType ?? '').toLowerCase();
    if (mime && !MIMES_PERMITIDOS.includes(mime)) {
      throw new ValidationError('Formato de evidencia no permitido');
    }
  }

  const valorNormalizado = normalizeIdentifier(input.identifierType, input.identifierValue);
  const storySanitizada = filtrarTexto(input.story ?? '');
  const previas = inMemoryIncidents.filter(
    (i) =>
      (i.valorNormalizado ?? normalizeIdentifier(i.identifierType, i.identifierValue)) === valorNormalizado,
  ).length;
  const corroborationCount = previas + 1;
  const identity: UserIdentityFactors = input.identityFactors ?? {
    googleAuth: input.googleVerificado,
    phoneVerified: false,
    dniVerified: false,
  };

  const breakdown = calculateRG07Score({
    identity,
    evidences: input.evidences,
    corroborationCount,
  });
  const pct = breakdown.identityScore + breakdown.evidenceScore + breakdown.corroborationScore;

  const audit: AuditMetadata = {
    uid: input.uid,
    userEmail: input.userEmail,
    clientIp: input.clientIp ?? '0.0.0.0',
    platform: Platform.OS as 'android' | 'ios' | 'web',
    createdAt: new Date().toISOString(),
    ddjjHash: input.ddjjHash,
    ddjjAceptadaEn: input.ddjjAceptadaEn,
  };

  const construirReporte = (codigo: string, incidentId: string) => {
    const destino: DenunciaEstado = pct >= 20 ? 'PUBLICADA' : 'RECIBIDA';
    const historial: HistorialEvento[] = [
      buildHistorialEvento({ denunciaId: incidentId, origen: null, destino: 'RECIBIDA', actorId: input.uid }),
    ];
    if (destino === 'PUBLICADA') {
      historial.push(
        buildHistorialEvento({ denunciaId: incidentId, origen: 'RECIBIDA', destino: 'PUBLICADA', actorId: 'system' }),
      );
    }
    if (!checkInvarianteI05(destino, historial)) {
      throw new ValidationError('I-05: historial inconsistente');
    }
    const reporte: IncidentReport = {
      id: incidentId,
      trackingCode: codigo,
      claveOperacion,
      estadoActual: destino,
      valorNormalizado,
      identifierType: input.identifierType,
      identifierValue: input.identifierValue,
      title: `${input.identifierType}: ${input.identifierValue}`,
      category: input.category,
      story: storySanitizada,
      location: input.location,
      evidences: input.evidences.map((e) => ({ ...e, isMasked: true })),
      credibilityScore: pct,
      credibilityBreakdown: { ...breakdown, totalScore: pct },
      corroborationCount,
      audit,
      eliminada: false,
      status: destino === 'PUBLICADA' ? 'publicada' : 'en_revision',
    };
    return { reporte, historial };
  };

  // Modo demo: mantener el flujo en memoria sin tocar Firestore.
  if (!isFirebaseConfigured) {
    const seq = await nextTrackingSequence();
    const codigo = formatTrackingCode(seq);
    const incidentId = `den_${claveOperacion}`;
    const { reporte, historial } = construirReporte(codigo, incidentId);
    inMemoryIncidents = [reporte, ...inMemoryIncidents];
    byOperationKey.set(claveOperacion, reporte);
    historialByDenuncia.set(incidentId, historial);
    invalidarCache('incidents:');
    return { codigo, pct, reporte, idempotente: false };
  }

  try {
    const resultado = await runTransaction(db, async (tx) => {
      const claveRef = doc(db, 'denuncias_by_clave', claveOperacion);
      const claveSnap = await tx.get(claveRef);
      if (claveSnap.exists()) {
        const data = claveSnap.data() as { denunciaId?: string };
        if (data.denunciaId) {
          const existenteSnap = await tx.get(doc(db, 'denuncias', data.denunciaId));
          if (existenteSnap.exists()) {
            const reporte = {
              id: existenteSnap.id,
              ...(existenteSnap.data() as Omit<IncidentReport, 'id'>),
            } as IncidentReport;
            return { reporte, historial: [] as HistorialEvento[], idempotente: true };
          }
        }
      }

      const counterRef = doc(db, 'atenti_counters', 'seguimiento');
      const counterSnap = await tx.get(counterRef);
      const actual = counterSnap.exists()
        ? ((counterSnap.data() as { seq?: number }).seq ?? 1000)
        : 1000;
      const seq = actual + 1;
      const codigo = formatTrackingCode(seq);
      const incidentId = `den_${claveOperacion}`;
      const { reporte, historial } = construirReporte(codigo, incidentId);

      tx.set(counterRef, { seq }, { merge: true });
      tx.set(doc(db, 'denuncias', incidentId), { ...reporte, _serverTimestamp: serverTimestamp() });
      tx.set(claveRef, { denunciaId: incidentId, codigo, _serverTimestamp: serverTimestamp() });
      tx.set(doc(db, 'objetivos', `${incidentId}_obj`), {
        denunciaId: incidentId,
        tipo: input.identifierType,
        valorNormalizado,
        valorExhibido: input.identifierValue,
      });
      if (input.location) {
        tx.set(doc(db, 'ubicaciones', `${incidentId}_ubi`), {
          denunciaId: incidentId,
          ...input.location,
        });
      }
      input.evidences.forEach((e, idx) => {
        tx.set(doc(db, 'evidencias', `${incidentId}_ev${idx}`), {
          denunciaId: incidentId,
          ...e,
        });
      });
      historial.forEach((h) => {
        tx.set(doc(db, 'historialEstado', h.id), { ...h, timestamp: serverTimestamp() });
      });
      tx.set(doc(db, 'audit_logs', `log_${incidentId}`), {
        incidentId,
        trackingCode: codigo,
        claveOperacion,
        accion: 'CREACION_DENUNCIA',
        audit,
        timestamp: serverTimestamp(),
      });

      return { reporte, historial, idempotente: false };
    });

    inMemoryIncidents = [
      resultado.reporte,
      ...inMemoryIncidents.filter((i) => i.id !== resultado.reporte.id),
    ];
    byOperationKey.set(claveOperacion, resultado.reporte);
    if (resultado.historial.length > 0) {
      historialByDenuncia.set(resultado.reporte.id, resultado.historial);
    }
    invalidarCache('incidents:');
    return {
      codigo: resultado.reporte.trackingCode,
      pct: resultado.reporte.credibilityScore,
      reporte: resultado.reporte,
      idempotente: resultado.idempotente,
    };
  } catch (e) {
    if (e instanceof ValidationError) throw e;
    throw new FirestoreWriteError(
      'No se pudo guardar la denuncia. Revisá la conexión o los permisos.',
      { cause: e }
    );
  }
}

/** T02: transición validada RG-10 + nota obligatoria RG-11 + I-05. */
export async function actualizarEstadoDenuncia(params: {
  denunciaId: string;
  destino: DenunciaEstado;
  actorId: string;
  nota?: string;
}): Promise<IncidentReport> {
  let reporte = inMemoryIncidents.find((i) => i.id === params.denunciaId) ?? null;

  if (!reporte && isFirebaseConfigured) {
    const snap = await getDoc(doc(db, 'denuncias', params.denunciaId));
    if (snap.exists()) {
      reporte = { id: snap.id, ...(snap.data() as Omit<IncidentReport, 'id'>) } as IncidentReport;
    }
  }
  if (!reporte) throw new NotFoundError('Denuncia no encontrada');

  const from = (reporte.estadoActual ?? 'RECIBIDA') as DenunciaEstado;
  assertTransition(from, params.destino);
  const evento = buildHistorialEvento({
    denunciaId: reporte.id,
    origen: from,
    destino: params.destino,
    actorId: params.actorId,
    nota: params.nota,
  });
  const hist = [...(historialByDenuncia.get(reporte.id) ?? []), evento];
  reporte.estadoActual = params.destino;
  reporte.status =
    params.destino === 'PUBLICADA'
      ? 'publicada'
      : params.destino === 'RESUELTA'
        ? 'desestimada'
        : 'en_revision';
  historialByDenuncia.set(reporte.id, hist);
  if (!checkInvarianteI05(params.destino, hist)) throw new ValidationError('I-05 violado');
  if (reporte.claveOperacion) byOperationKey.set(reporte.claveOperacion, reporte);

  if (isFirebaseConfigured) {
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'denuncias', reporte.id), { ...reporte }, { merge: true });
      batch.set(doc(db, 'historialEstado', evento.id), {
        ...evento,
        timestamp: serverTimestamp(),
      });
      batch.set(doc(db, 'audit_logs', `log_${reporte.id}_${evento.id}`), {
        incidentId: reporte.id,
        trackingCode: reporte.trackingCode,
        accion: `CAMBIO_ESTADO_${params.destino}`,
        actorId: params.actorId,
        nota: params.nota,
        audit: { ...reporte.audit, createdAt: new Date().toISOString() },
        timestamp: serverTimestamp(),
      });
      await batch.commit();
    } catch (e) {
      throw new FirestoreWriteError('No se pudo actualizar el estado de la denuncia', { cause: e });
    }
  }

  invalidarCache('incidents:');
  return reporte;
}

export async function getHistorial(denunciaId: string): Promise<HistorialEvento[]> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'historialEstado'), where('denunciaId', '==', denunciaId))
      );
      if (!snap.empty) {
        return snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<HistorialEvento, 'id'>) } as HistorialEvento))
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      }
    } catch (e) {
      console.warn('getHistorial: Firestore no disponible, uso memoria:', e);
    }
  }
  return [...(historialByDenuncia.get(denunciaId) ?? [])];
}

/** Busca una denuncia por id en Firestore y cae a memoria en modo demo. */
export async function obtenerDenuncia(denunciaId: string): Promise<IncidentReport | null> {
  const enMemoria = inMemoryIncidents.find((i) => i.id === denunciaId) ?? null;
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, 'denuncias', denunciaId));
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Omit<IncidentReport, 'id'>) } as IncidentReport;
      }
    } catch (e) {
      console.warn('obtenerDenuncia: Firestore no disponible, uso memoria:', e);
    }
  }
  return enMemoria;
}

/**
 * RF-023: corrige los datos de una denuncia propia dentro de la ventana de 24hs.
 * No es una transición de estado, por lo que registra un evento de auditoría
 * de tipo EDICION sin tocar la máquina de estados.
 */
export async function actualizarDenuncia(params: {
  denunciaId: string;
  cambios: Partial<Pick<IncidentReport, 'category' | 'story' | 'location' | 'identifierValue'>>;
  actorId: string;
  motivo: string;
}): Promise<IncidentReport> {
  const reporte = await obtenerDenuncia(params.denunciaId);
  if (!reporte) throw new NotFoundError('Denuncia no encontrada');
  if (reporte.audit.uid !== params.actorId) {
    throw new ValidationError('Solo el autor puede editar su denuncia');
  }
  if (!puedeEditar(reporte.audit.createdAt)) {
    throw new ValidationError('La ventana de edición de 24hs expiró');
  }
  if (params.cambios.story !== undefined && params.cambios.story.trim().length < 20) {
    throw new ValidationError('El relato debe tener al menos 20 caracteres');
  }
  if (params.cambios.location && !params.cambios.location.address.trim()) {
    throw new ValidationError('La dirección no puede quedar vacía');
  }

  Object.assign(reporte, params.cambios);

  if (isFirebaseConfigured) {
    try {
      const batch = writeBatch(db);
      batch.set(
        doc(db, 'denuncias', params.denunciaId),
        {
          ...params.cambios,
          editadaEn: new Date().toISOString(),
          _serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      );
      batch.set(doc(db, 'historialEstado', `edit_${Date.now()}`), {
        denunciaId: params.denunciaId,
        tipo: 'EDICION',
        actorId: params.actorId,
        motivo: params.motivo,
        timestamp: serverTimestamp(),
      });
      await batch.commit();
    } catch (e) {
      throw new FirestoreWriteError('No se pudieron guardar los cambios', { cause: e });
    }
  }

  invalidarCache('incidents:');
  return reporte;
}

/** T04: proyección pública (RG-08/I-07). Oculta EN_DISPUTA del buscador. */
export async function consultarAntecedentePublico(
  codigo: string
): Promise<PublicIncidentProjection | null> {
  const normalizado = normalizeTrackingCode(codigo);
  let rep = inMemoryIncidents.find((i) => i.trackingCode === normalizado) ?? null;

  if (!rep && isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'denuncias'), where('trackingCode', '==', normalizado))
      );
      if (!snap.empty) {
        rep = {
          id: snap.docs[0].id,
          ...(snap.docs[0].data() as Omit<IncidentReport, 'id'>),
        } as IncidentReport;
      }
    } catch (e) {
      console.warn('consultarAntecedentePublico: Firestore no disponible:', e);
    }
  }

  if (!rep || rep.eliminada || rep.estadoActual === 'EN_DISPUTA') return null;
  return toPublicProjection(rep);
}

export function listarAntecedentesPublicos(): PublicIncidentProjection[] {
  return inMemoryIncidents
    .filter((i) => !i.eliminada && i.estadoActual === 'PUBLICADA')
    .map((i) => toPublicProjection(i));
}

export { listarCategorias, toPublicProjection as toPublicIncident };
export type { PublicIncidentProjection };
