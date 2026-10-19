/**
 * Cloud Functions de Atenti (RF-029, RF-030, RF-010, RF-090, RF-091).
 *
 * - processEvidenceOCR: OCR real con Cloud Vision + validación de coincidencia.
 * - verificarTelefono: validación de OTP de teléfono.
 * - verificarLimiteDenuncias: rate limiting atómico por usuario/día.
 * - detectarSpam: detección de duplicados por contenido similar.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ImageAnnotatorClient } from '@google-cloud/vision';

initializeApp();
const db = getFirestore();

const DEFAULT_RATE_LIMIT_DAILY = Number(process.env.RATE_LIMIT_DAILY ?? 10);
const ventanaSpamMs = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// OCR (RF-029 / RF-030)
// ---------------------------------------------------------------------------

/** Extrae un identificador probable (CBU 22 dígitos, CUIT, Alias) del texto. */
export function extraerIdentificador(texto: string): string | null {
  const cbu = texto.replace(/[\s-]/g, '').match(/\b\d{22}\b/);
  if (cbu) return cbu[0];

  const cuit = texto.match(/\b\d{2}-\d{8}-\d\b/);
  if (cuit) return cuit[0];

  const alias = texto.match(/\balias[:\s]+([a-z0-9.\-_]{6,20})\b/i);
  if (alias) return alias[1].toLowerCase();

  return null;
}

/** Normaliza para comparar CBU/CUIT/Alias. */
export function normalizarParaComparar(valor: string): string {
  return valor.replace(/[\s.\-]/g, '').toLowerCase();
}

export const processEvidenceOCR = onCall(async (request) => {
  const { imageBase64, expectedType, expectedValue } = (request.data ?? {}) as {
    imageBase64?: string;
    expectedType?: string;
    expectedValue?: string;
  };

  if (!imageBase64) {
    throw new HttpsError('invalid-argument', 'Falta imageBase64');
  }

  const client = new ImageAnnotatorClient();
  const [resultado] = await client.textDetection({ image: { content: imageBase64 } });
  const texto = resultado.fullTextAnnotation?.text ?? '';
  const detectado = extraerIdentificador(texto);

  const matched = Boolean(
    detectado &&
      expectedValue &&
      normalizarParaComparar(detectado) === normalizarParaComparar(expectedValue)
  );

  const confianza = resultado.fullTextAnnotation?.pages?.[0]?.confidence ?? 0.9;

  return {
    extractedText: texto,
    detectedIdentifier: detectado ?? undefined,
    matched,
    confidence: confianza,
  };
});

// ---------------------------------------------------------------------------
// Teléfono OTP (RF-010)
// ---------------------------------------------------------------------------

export const verificarTelefono = onCall(async (request) => {
  const { phoneNumber, code } = (request.data ?? {}) as {
    phoneNumber?: string;
    code?: string;
  };

  if (!phoneNumber || !code) {
    throw new HttpsError('invalid-argument', 'Faltan phoneNumber o code');
  }

  const normalizado = phoneNumber.replace(/[^\d+]/g, '');
  const ref = db.collection('otp_codes').doc(normalizado);
  const snap = await ref.get();

  if (!snap.exists) {
    return { verified: false };
  }

  const datos = snap.data() as { code?: string; expiraEn?: number };
  const expirado = typeof datos.expiraEn === 'number' && datos.expiraEn < Date.now();
  const valido = datos.code === code && !expirado;

  if (valido) {
    await ref.delete();
  }

  return { verified: valido };
});

// ---------------------------------------------------------------------------
// Rate limiting (RF-090)
// ---------------------------------------------------------------------------

export const verificarLimiteDenuncias = onCall(async (request) => {
  const { uid } = (request.data ?? {}) as { uid?: string };
  if (!uid) {
    throw new HttpsError('invalid-argument', 'Falta uid');
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const ref = db.collection('rate_limits').doc(`${uid}_${hoy}`);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const usadas = snap.exists ? ((snap.data() as { count?: number }).count ?? 0) : 0;

    if (usadas >= DEFAULT_RATE_LIMIT_DAILY) {
      return { permitido: false, restantes: 0, limite: DEFAULT_RATE_LIMIT_DAILY };
    }

    tx.set(ref, { count: FieldValue.increment(1), fecha: hoy, uid }, { merge: true });
    return {
      permitido: true,
      restantes: DEFAULT_RATE_LIMIT_DAILY - usadas - 1,
      limite: DEFAULT_RATE_LIMIT_DAILY,
    };
  });
});

// ---------------------------------------------------------------------------
// Detección de spam (RF-091)
// ---------------------------------------------------------------------------

/** Jaccard simple sobre palabras del relato. */
export function similitud(a: string, b: string): number {
  const tokens = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^\wáéíóúñ ]/g, '')
        .split(/\s+/)
        .filter((t) => t.length > 2)
    );
  const sa = tokens(a);
  const sb = tokens(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let interseccion = 0;
  sa.forEach((t) => {
    if (sb.has(t)) interseccion++;
  });
  return interseccion / (sa.size + sb.size - interseccion);
}

export const detectarSpam = onCall(async (request) => {
  const { uid, valorNormalizado, relato } = (request.data ?? {}) as {
    uid?: string;
    valorNormalizado?: string;
    relato?: string;
  };

  if (!uid || !valorNormalizado || !relato) {
    throw new HttpsError('invalid-argument', 'Faltan datos para detectar spam');
  }

  const desde = new Date(Date.now() - ventanaSpamMs);
  const snap = await db
    .collection('denuncias')
    .where('valorNormalizado', '==', valorNormalizado)
    .where('_serverTimestamp', '>=', desde)
    .get();

  for (const doc of snap.docs) {
    const datos = doc.data() as { story?: string; audit?: { uid?: string } };
    if (datos.audit?.uid === uid && datos.story && similitud(datos.story, relato) >= 0.8) {
      return { duplicado: true, motivo: 'Relato muy similar a una denuncia reciente.' };
    }
  }

  return { duplicado: false };
});
