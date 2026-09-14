/**
 * Servicio de Validación y Procesamiento OCR para Evidencias (Pantalla P5)
 * Detecta y extrae identificadores (CBU, Alias, CUIT, importes) en comprobantes y capturas
 */

import { IdentifierType, DniOcrResult } from '../types';

export interface OcrResult {
  extractedText: string;
  detectedIdentifier?: string;
  matched: boolean;
  confidence: number;
}

export function validateDniFormat(dni: string): boolean {
  const clean = dni.replace(/\D/g, '');
  return clean.length >= 7 && clean.length <= 8;
}

/**
 * T07: Procesa imagen de Documento Nacional de Identidad (DNI)
 * Extrae número de documento (7 u 8 dígitos), apellidos/nombres y número de trámite
 */
export async function processDniOCR(
  imageUri: string,
  manualHint?: string
): Promise<DniOcrResult> {
  // Simulación de latencia de red y visión artificial Cloud Vision
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const clean = (manualHint || '38412905').replace(/\D/g, '');
  const isValid = validateDniFormat(clean);
  const dniNumber = isValid ? clean : '38412905';

  return {
    extractedDni: dniNumber,
    fullName: 'RODRIGUEZ, MARTIN EZEQUIEL',
    gender: 'M',
    tramiteNumber: '00284719203',
    confidence: isValid ? 0.95 : 0.82,
    matched: isValid,
    documentType: 'DNI_ARG',
  };
}

export async function processEvidenceOCR(
  type: 'chat_screenshot' | 'bank_receipt' | 'other',
  expectedType: IdentifierType,
  expectedValue: string,
  imageUri: string
): Promise<OcrResult> {
  // Simulación de latencia de red y procesamiento de visión artificial
  await new Promise((resolve) => setTimeout(resolve, 1600));

  const cleanExpected = expectedValue.trim().toLowerCase();

  if (type === 'bank_receipt') {
    // Generación de comprobante bancario simulado acorde al tipo
    let extracted = `BANCO DE LA NACIÓN ARGENTINA\nTRANSFERENCIA INMEDIATA\nFECHA: 06/09/2026 14:22:15\n`;
    if (expectedType === 'CBU') {
      extracted += `CBU DESTINO: ${expectedValue}\nTITULAR: JUAN P. FRAUD\nESTADO: APROBADA`;
    } else if (expectedType === 'Alias') {
      extracted += `ALIAS DESTINO: ${expectedValue.toUpperCase()}\nTITULAR: TIENDA NO OFICIAL\nESTADO: APROBADA`;
    } else {
      extracted += `DESTINATARIO: ${expectedValue}\nIMPORTE: $84.500,00`;
    }

    return {
      extractedText: extracted,
      detectedIdentifier: expectedValue,
      matched: true,
      confidence: 0.94,
    };
  } else if (type === 'chat_screenshot') {
    const extracted = `WhatsApp Chat\n[13:40] Vendedor: "Haceme la transferencia al ${expectedType} ${expectedValue} y te mando la guía"\n[13:42] Víctima: "Listo, ya te transferí"\n[14:00] (Usuario bloqueado)`;

    return {
      extractedText: extracted,
      detectedIdentifier: expectedValue,
      matched: true,
      confidence: 0.88,
    };
  }

  return {
    extractedText: `Documento procesado: ${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`,
    matched: false,
    confidence: 0.5,
  };
}
