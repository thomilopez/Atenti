/**
 * Cliente de Cloud Functions (RF-029, RF-030, RF-088 a RF-091, RF-010).
 *
 * Centraliza las llamadas al backend server-side: OCR con Cloud Vision,
 * verificación de teléfono por SMS OTP, rate limiting y detección de spam.
 * El OCR y las validaciones viven en el servidor para no exponer la API key
 * de Vision ni permitir que el cliente se auto-otorgue puntaje (ver design.md).
 */
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { app } from './firebase';
import { env } from './env';

let functionsInstance: Functions | null = null;

function getFn(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(app, env.functionsRegion);
  }
  return functionsInstance;
}

export interface ResultadoOCR {
  extractedText: string;
  detectedIdentifier?: string;
  matched: boolean;
  confidence: number;
}

/** RF-029/RF-030: procesa una evidencia con Cloud Vision y compara con el objetivo. */
export async function processEvidenceOCR(params: {
  imageBase64: string;
  expectedType: string;
  expectedValue: string;
}): Promise<ResultadoOCR> {
  const fn = httpsCallable(getFn(), 'processEvidenceOCR');
  const res = await fn(params);
  return res.data as ResultadoOCR;
}

/** RF-010: verifica un código OTP de teléfono en el servidor. */
export async function verificarTelefono(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  const fn = httpsCallable(getFn(), 'verificarTelefono');
  const res = await fn({ phoneNumber, code });
  const data = res.data as { verified?: boolean };
  return Boolean(data.verified);
}

export interface ResultadoLimite {
  permitido: boolean;
  restantes: number;
  limite: number;
}

/** RF-090: consulta si el usuario puede crear otra denuncia hoy. */
export async function verificarLimiteDenuncias(uid: string): Promise<ResultadoLimite> {
  const fn = httpsCallable(getFn(), 'verificarLimiteDenuncias');
  const res = await fn({ uid });
  return res.data as ResultadoLimite;
}

export interface ResultadoSpam {
  duplicado: boolean;
  motivo?: string;
}

/** RF-091: detecta contenido similar a denuncias recientes. */
export async function detectarSpam(params: {
  uid: string;
  valorNormalizado: string;
  relato: string;
}): Promise<ResultadoSpam> {
  const fn = httpsCallable(getFn(), 'detectarSpam');
  const res = await fn(params);
  return res.data as ResultadoSpam;
}
