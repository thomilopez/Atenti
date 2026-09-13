/**
 * Bloque A · T01 — Clave de operación idempotente (RG-06) y código público (I-01).
 * La clave_operacion la genera el cliente una vez por intento lógico y se reutiliza
 * en cada reintento. El código AT-2026-XXXXXX es secuencial y único.
 */
import * as Crypto from 'expo-crypto';

export function generateOperationKey(): string {
  try {
    const uuid = Crypto.randomUUID();
    if (uuid) return `op_${uuid}`;
  } catch {
    // fallback fuera de entorno Expo (tests node)
  }
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isValidOperationKey(key: unknown): key is string {
  return typeof key === 'string' && key.trim().length >= 8;
}

/** Formato público Etapa 3 §3: AT-2026-XXXXXX (6 dígitos, secuencial). */
export function formatTrackingCode(seq: number): string {
  const padded = String(Math.max(0, Math.floor(seq))).padStart(6, '0');
  return `AT-2026-${padded}`;
}

export function isValidTrackingCode(code: unknown): boolean {
  return typeof code === 'string' && /^AT-2026-\d{6}$/.test(code);
}
