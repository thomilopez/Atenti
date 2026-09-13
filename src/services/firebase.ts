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
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import {
  AuditMetadata,
  EvidenceItem,
  IdentifierType,
  IncidentCategory,
  IncidentReport,
  LocationData,
} from '../types';
import { calculateRG07Score } from './credibility';
import { normalizeIdentifier, listarCategorias } from './normalize';
import {
  generateOperationKey,
  formatTrackingCode,
  isValidOperationKey,
} from './operationKey';
import {
  DenunciaEstado,
  HistorialEvento,
  assertTransition,
  buildHistorialEvento,
  checkInvarianteI05,
} from './stateMachine';
import { toPublicProjection, PublicIncidentProjection } from './masking';

// Configuración de Firebase (Puede sobreescribirse con variables de entorno)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoAtentiApiKey2026ArgentinaMVP',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'atenti-argentina-mvp.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'atenti-argentina-mvp',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'atenti-argentina-mvp.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '928374829103',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:928374829103:web:7823abce9012837',
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
 * Obtiene todas las incidencias (filtradas opcionalmente por tipo de identificador o texto de búsqueda)
 */
export async function getIncidents(filterType?: IdentifierType, searchQuery?: string): Promise<IncidentReport[]> {
  try {
    // Intentar leer de Firestore
    const incidentsCol = collection(db, 'incidents');
    const snapshot = await getDocs(incidentsCol);
    if (!snapshot.empty) {
      const docs = snapshot.docs.map((docSnap) => docSnap.data() as IncidentReport);
      // Mezclar con iniciales si faltan
      const map = new Map<string, IncidentReport>();
      inMemoryIncidents.forEach((i) => map.set(i.id, i));
      docs.forEach((i) => map.set(i.id, i));
      inMemoryIncidents = Array.from(map.values());
    }
  } catch (error) {
    // Modo offline o fallback de desarrollo
    // Usamos el estado en memoria
  }

  return inMemoryIncidents.filter((inc) => {
    if (filterType && inc.identifierType !== filterType) {
      return false;
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchValue = inc.identifierValue.toLowerCase().includes(q);
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchStory = inc.story.toLowerCase().includes(q);
      const matchAddress = inc.location.address.toLowerCase().includes(q);
      return matchValue || matchTitle || matchStory || matchAddress;
    }
    return true;
  });
}

/**
 * Persistencia atómica de una denuncia en Firestore con metadatos de auditoría
 */
export async function saveIncidentReportAtomic(params: {
  identifierType: IdentifierType;
  identifierValue: string;
  category: IncidentCategory;
  story: string;
  location: LocationData;
  evidences: EvidenceItem[];
  uid: string;
  userEmail: string;
  credibilityScore: number;
}): Promise<IncidentReport> {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const trackingCode = `AT-2026-${randomCode}`;
  const incidentId = `inc_${Date.now()}`;

  // Verificar si hay corroboración previa sobre el mismo identificador
  // T03: agrupar por valor_normalizado, no por string crudo.
  const valorNormalizado = normalizeIdentifier(
    params.identifierType,
    params.identifierValue,
  );
  const existingMatches = inMemoryIncidents.filter((i) => {
    const norm = i.valorNormalizado ??
      normalizeIdentifier(i.identifierType, i.identifierValue);
    return norm === valorNormalizado;
  });
  const corroborationCount = existingMatches.length + 1;

  // Recalcular desglose de credibilidad RG-07
  const breakdown = calculateRG07Score({
    identity: {
      googleAuth: true,
      phoneVerified: true,
      dniVerified: false,
    },
    evidences: params.evidences,
    corroborationCount,
  });

  const audit: AuditMetadata = {
    uid: params.uid || 'usr_anonymous_demo',
    userEmail: params.userEmail || 'usuario.atenti@gmail.com',
    clientIp: '181.44.20.' + Math.floor(Math.random() * 254),
    platform: Platform.OS as 'android' | 'ios' | 'web',
    createdAt: new Date().toISOString(),
  };

  const report: IncidentReport = {
    id: incidentId,
    trackingCode,
    claveOperacion: `legacy_${incidentId}`,
    estadoActual: 'PUBLICADA',
    valorNormalizado,
    identifierType: params.identifierType,
    identifierValue: params.identifierValue,
    title: `${params.identifierType}: ${params.identifierValue}`,
    category: params.category,
    story: params.story,
    location: params.location,
    evidences: params.evidences.map((e) => ({ ...e, isMasked: true })),
    credibilityScore: breakdown.totalScore || params.credibilityScore,
    credibilityBreakdown: breakdown,
    corroborationCount,
    audit,
    status: 'publicada',
  };

  // 1. Guardado en memoria inmediata para UI reactiva
  inMemoryIncidents = [report, ...inMemoryIncidents];

  // 2. Persistencia Atómica en Cloud Firestore con WriteBatch
  try {
    const batch = writeBatch(db);
    const incidentDocRef = doc(db, 'incidents', incidentId);
    batch.set(incidentDocRef, {
      ...report,
      _serverTimestamp: serverTimestamp(),
    });

    const auditDocRef = doc(db, 'audit_logs', `log_${incidentId}`);
    batch.set(auditDocRef, {
      incidentId,
      trackingCode,
      audit,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
  } catch (firestoreError) {
    console.warn('Firestore offline o no configurado aún; guardado en memoria local:', firestoreError);
  }

  return report;
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
    const { getDoc, runTransaction } = await import('firebase/firestore');
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
  claveOperacion?: string;
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
    throw new Error('RG-01: se requiere sesión Google válida y DDJJ aceptada');
  }
  const claveOperacion = input.claveOperacion?.trim() || generateOperationKey();
  if (!isValidOperationKey(claveOperacion)) throw new Error('RG-06: clave_operacion inválida');

  const existente = await existeDenunciaPorClave(claveOperacion);
  if (existente) {
    return { codigo: existente.trackingCode, pct: existente.credibilityScore, reporte: existente, idempotente: true };
  }

  const valorNormalizado = normalizeIdentifier(input.identifierType, input.identifierValue);
  const previas = inMemoryIncidents.filter(
    (i) =>
      (i.valorNormalizado ?? normalizeIdentifier(i.identifierType, i.identifierValue)) === valorNormalizado,
  ).length;
  const corroborationCount = previas + 1;

  const breakdown = calculateRG07Score({
    identity: { googleAuth: true, phoneVerified: true, dniVerified: false },
    evidences: input.evidences,
    corroborationCount,
  });
  // I-06: pct == suma de componentes
  const pct = breakdown.identityScore + breakdown.evidenceScore + breakdown.corroborationScore;

  const seq = await nextTrackingSequence();
  const codigo = formatTrackingCode(seq);
  const incidentId = `den_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const audit: AuditMetadata = {
    uid: input.uid,
    userEmail: input.userEmail,
    clientIp: '0.0.0.0',
    platform: Platform.OS as 'android' | 'ios' | 'web',
    createdAt: new Date().toISOString(),
  };

  const destino: DenunciaEstado = pct >= 20 ? 'PUBLICADA' : 'RECIBIDA';
  const historial: HistorialEvento[] = [
    buildHistorialEvento({ denunciaId: incidentId, origen: null, destino: 'RECIBIDA', actorId: input.uid }),
  ];
  if (destino === 'PUBLICADA') {
    historial.push(
      buildHistorialEvento({ denunciaId: incidentId, origen: 'RECIBIDA', destino: 'PUBLICADA', actorId: 'system' }),
    );
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
    story: input.story,
    location: input.location,
    evidences: input.evidences.map((e) => ({ ...e, isMasked: true })),
    credibilityScore: pct,
    credibilityBreakdown: { ...breakdown, totalScore: pct },
    corroborationCount,
    audit,
    status: destino === 'PUBLICADA' ? 'publicada' : 'en_revision',
  };

  if (!checkInvarianteI05(destino, historial)) throw new Error('I-05: historial inconsistente');

  inMemoryIncidents = [reporte, ...inMemoryIncidents];
  byOperationKey.set(claveOperacion, reporte);
  historialByDenuncia.set(incidentId, historial);

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'denuncias', incidentId), { ...reporte, _serverTimestamp: serverTimestamp() });
    batch.set(doc(db, 'denuncias_by_clave', claveOperacion), { denunciaId: incidentId, codigo });
    batch.set(doc(db, 'objetivos', `${incidentId}_obj`), {
      denunciaId: incidentId,
      tipo: input.identifierType,
      valorNormalizado,
      valorExhibido: input.identifierValue,
    });
    if (input.location) {
      batch.set(doc(db, 'ubicaciones', `${incidentId}_ubi`), { denunciaId: incidentId, ...input.location });
    }
    input.evidences.forEach((e, idx) => {
      batch.set(doc(db, 'evidencias', `${incidentId}_ev${idx}`), { denunciaId: incidentId, ...e });
    });
    historial.forEach((h) => {
      batch.set(doc(db, 'historialEstado', h.id), { ...h, timestamp: serverTimestamp() });
    });
    batch.set(doc(db, 'audit_logs', `log_${incidentId}`), {
      incidentId,
      trackingCode: codigo,
      claveOperacion,
      audit,
      timestamp: serverTimestamp(),
    });
    await batch.commit();
  } catch (e) {
    console.warn('registrarDenuncia: Firestore no disponible, persisto en memoria:', e);
  }

  return { codigo, pct, reporte, idempotente: false };
}

/** T02: transición validada RG-10 + nota obligatoria RG-11 + I-05. */
export async function actualizarEstadoDenuncia(params: {
  denunciaId: string;
  destino: DenunciaEstado;
  actorId: string;
  nota?: string;
}): Promise<IncidentReport> {
  const reporte = inMemoryIncidents.find((i) => i.id === params.denunciaId);
  if (!reporte) throw new Error('Denuncia no encontrada');
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
  reporte.status = params.destino === 'PUBLICADA' ? 'publicada' : params.destino === 'RESUELTA' ? 'desestimada' : 'en_revision';
  historialByDenuncia.set(reporte.id, hist);
  if (!checkInvarianteI05(params.destino, hist)) throw new Error('I-05 violado');
  if (reporte.claveOperacion) byOperationKey.set(reporte.claveOperacion, reporte);
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'denuncias', reporte.id), { ...reporte }, { merge: true });
    batch.set(doc(db, 'historialEstado', evento.id), { ...evento, timestamp: serverTimestamp() });
    await batch.commit();
  } catch (e) {
    console.warn('actualizarEstadoDenuncia offline:', e);
  }
  return reporte;
}

export function getHistorial(denunciaId: string): HistorialEvento[] {
  return [...(historialByDenuncia.get(denunciaId) ?? [])];
}

/** T04: proyección pública (RG-08/I-07). Oculta EN_DISPUTA del buscador. */
export function consultarAntecedentePublico(codigo: string): PublicIncidentProjection | null {
  const rep = inMemoryIncidents.find((i) => i.trackingCode === codigo);
  if (!rep || rep.estadoActual === 'EN_DISPUTA') return null;
  return toPublicProjection(rep);
}

export function listarAntecedentesPublicos(): PublicIncidentProjection[] {
  return inMemoryIncidents
    .filter((i) => i.estadoActual === 'PUBLICADA')
    .map((i) => toPublicProjection(i));
}

export { listarCategorias, toPublicProjection as toPublicIncident };
export type { PublicIncidentProjection };
