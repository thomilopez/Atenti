/**
 * Servicio de Validación y Procesamiento OCR para Evidencias (Pantalla P5, RF-029/030).
 *
 * Si Firebase está configurado y se dispone de la imagen en base64, delega el
 * OCR real a la Cloud Function (Cloud Vision). En modo demo, usa una
 * simulación determinística para no romper el flujo.
 */

import { IdentifierType } from '../types';
import { isFirebaseConfigured } from './firebase';
import { processEvidenceOCR as procesarOCRRemoto } from './cloudFunctions';

export interface OcrResult {
  extractedText: string;
  detectedIdentifier?: string;
  matched: boolean;
  confidence: number;
  /** true cuando el resultado es una simulacion y no debe otorgar puntos. */
  simulated?: boolean;
}

function simularOCR(
  type: 'chat_screenshot' | 'bank_receipt' | 'other',
  expectedType: IdentifierType,
  expectedValue: string,
  imageUri: string
): OcrResult {
  if (type === 'bank_receipt') {
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
      matched: false,
      confidence: 0,
      simulated: true,
    };
  }

  if (type === 'chat_screenshot') {
    const extracted = `WhatsApp Chat\n[13:40] Vendedor: "Haceme la transferencia al ${expectedType} ${expectedValue} y te mando la guía"\n[13:42] Víctima: "Listo, ya te transferí"\n[14:00] (Usuario bloqueado)`;
    return {
      extractedText: extracted,
      matched: false,
      confidence: 0,
      simulated: true,
    };
  }

  return {
    extractedText: `Documento procesado: ${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`,
    matched: false,
    confidence: 0,
    simulated: true,
  };
}

export async function processEvidenceOCR(
  type: 'chat_screenshot' | 'bank_receipt' | 'other',
  expectedType: IdentifierType,
  expectedValue: string,
  imageUri: string,
  imageBase64?: string
): Promise<OcrResult> {
  if (isFirebaseConfigured && imageBase64) {
    try {
      const resultado = await procesarOCRRemoto({
        imageBase64,
        expectedType,
        expectedValue,
      });
      return { ...resultado, simulated: false };
    } catch (error) {
      console.warn('OCR remoto no disponible, uso simulación:', error);
    }
  }

  // Simulación de latencia de red y procesamiento de visión artificial
  await new Promise((resolve) => setTimeout(resolve, 1600));
  return simularOCR(type, expectedType, expectedValue, imageUri);
}
