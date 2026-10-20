/**
 * Validación de evidencias (RF-033, RF-034).
 *
 * Aplica límites de cantidad y tamaño, y valida que el formato sea JPG, PNG o
 * PDF. La subida real vive en `storageService`.
 */

export const MAX_EVIDENCIAS = 5;
export const MAX_BYTES = 10 * 1024 * 1024;
export const EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'pdf'];
export const MIMES_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];

export interface ArchivoEvidencia {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number;
}

export interface ValidacionEvidencia {
  ok: boolean;
  error?: string;
}

export function extensionDe(archivo: ArchivoEvidencia): string {
  const nombre = archivo.name || archivo.uri;
  const match = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(nombre);
  return (match?.[1] ?? '').toLowerCase();
}

export function formatoPermitido(archivo: ArchivoEvidencia): boolean {
  const ext = extensionDe(archivo);
  if (EXTENSIONES_PERMITIDAS.includes(ext)) return true;
  const mime = (archivo.mimeType ?? '').toLowerCase();
  return MIMES_PERMITIDOS.includes(mime);
}

export function tamanoValido(archivo: ArchivoEvidencia): boolean {
  const size = archivo.size ?? 0;
  if (!size) return true; // tamaño desconocido: no bloquear
  return size <= MAX_BYTES;
}

export function validarArchivo(
  archivo: ArchivoEvidencia,
  cantidadActual: number
): ValidacionEvidencia {
  if (cantidadActual >= MAX_EVIDENCIAS) {
    return { ok: false, error: `Podés adjuntar hasta ${MAX_EVIDENCIAS} evidencias.` };
  }
  if (!formatoPermitido(archivo)) {
    return { ok: false, error: 'Formato no permitido. Subí JPG, PNG o PDF.' };
  }
  if (!tamanoValido(archivo)) {
    return { ok: false, error: 'El archivo supera los 10MB.' };
  }
  return { ok: true };
}

export function formatearBytes(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return 'tamaño desconocido';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
