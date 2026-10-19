/**
 * Servicio de Declaración Jurada (RF-012, RNF-003).
 *
 * Genera un hash SHA-256 de la aceptación junto con los metadatos de envío
 * (uid, IP, timestamp, versión de términos) para respaldo probatorio.
 */
import * as Crypto from 'expo-crypto';

export interface DDJJHash {
  hash: string;
  aceptadaEn: string;
  ip: string;
  versionTerminos: string;
}

export const VERSION_TERMINOS_ACTUAL = 'v1.0';

export async function generarHashDDJJ(params: {
  uid: string;
  ip: string;
  versionTerminos?: string;
}): Promise<DDJJHash> {
  const aceptadaEn = new Date().toISOString();
  const versionTerminos = params.versionTerminos ?? VERSION_TERMINOS_ACTUAL;
  const payload = JSON.stringify({
    uid: params.uid,
    ip: params.ip,
    versionTerminos,
    aceptadaEn,
  });
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload
  );
  return { hash, aceptadaEn, ip: params.ip, versionTerminos };
}
