/**
 * Servicio de exportación (RF-064, RF-072).
 *
 * Genera CSV y PDF de la ficha pública y del dataset anonimizado, con un hash
 * SHA-256 de autenticidad. Comparte el archivo con el sistema operativo.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import type { PublicIncidentProjection } from './masking';
import type { FilaDataset } from './adminService';

export function escaparCSV(valor: unknown): string {
  const s = String(valor ?? '');
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function generarCSV(
  filas: Array<Record<string, unknown>>,
  columnas: Array<{ key: string; label: string }>
): string {
  const header = columnas.map((c) => escaparCSV(c.label)).join(',');
  const body = filas
    .map((f) => columnas.map((c) => escaparCSV(f[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

/** Hash SHA-256 de autenticidad de un contenido exportado. */
export async function hashAutenticidad(payload: unknown): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify(payload)
  );
}

async function compartir(uri: string, mimeType: string, titulo: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: titulo });
  }
}

export async function exportarCSV(nombreArchivo: string, csv: string): Promise<void> {
  const uri = `${FileSystem.cacheDirectory}${nombreArchivo}`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await compartir(uri, 'text/csv', 'Compartir exportación');
}

function escapeHtml(valor: unknown): string {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** RF-064: ficha pública en PDF con hash de autenticidad. */
export async function exportarFichaPDF(proyeccion: PublicIncidentProjection): Promise<string> {
  const hash = await hashAutenticidad(proyeccion);
  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; padding: 32px; color: #0F172A;">
        <h1 style="margin: 0 0 4px; font-size: 22px;">Atenti - Ficha de antecedente</h1>
        <p style="margin: 0 0 24px; color: #64748B; font-size: 12px;">Código de autenticidad (SHA-256): ${escapeHtml(hash)}</p>
        <h2 style="margin: 0 0 4px; font-size: 18px;">${escapeHtml(proyeccion.tituloEnmascarado)}</h2>
        <p style="margin: 0 0 16px; color: #475569; font-size: 13px;">${escapeHtml(proyeccion.categoria)} · ${escapeHtml(proyeccion.codigo)}</p>
        <p style="font-size: 14px;"><strong>Credibilidad:</strong> ${escapeHtml(proyeccion.credibilidadPct)}%</p>
        <p style="font-size: 14px;"><strong>Estado:</strong> ${escapeHtml(proyeccion.estado)}</p>
        <p style="font-size: 14px;"><strong>Corroboraciones:</strong> ${escapeHtml(proyeccion.corroboraciones)}</p>
        <p style="font-size: 14px;"><strong>Ubicación:</strong> ${escapeHtml(proyeccion.ubicacion.address)}</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="font-size: 14px; line-height: 20px;">${escapeHtml(proyeccion.relato)}</p>
      </body>
    </html>
  `;
  const { uri } = await Print.printToFileAsync({ html });
  await compartir(uri, 'application/pdf', 'Compartir ficha');
  return hash;
}

/** RF-072: dataset anonimizado en CSV (sin email, uid ni IP). */
export async function exportarDatasetCSV(filas: FilaDataset[]): Promise<void> {
  const columnas = [
    { key: 'codigo', label: 'Codigo' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'estado', label: 'Estado' },
    { key: 'score', label: 'Score' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'localidad', label: 'Localidad' },
  ];
  const csv = generarCSV(
    filas as unknown as Array<Record<string, unknown>>,
    columnas
  );
  await exportarCSV(`atenti_dataset_${Date.now()}.csv`, csv);
}
