/**
 * Regla de Negocio RG-07: Algoritmo de Veracidad y Credibilidad
 * 
 * Distribución de Puntos (Total Máximo: 100%):
 * 1. Identidad del Denunciante (Hasta 40 pts):
 *    - Cuenta Google vinculada / Auth activa: +15 pts
 *    - Teléfono verificado por SMS OTP: +15 pts
 *    - DNI verificado por Renaper / OCR: +10 pts
 * 
 * 2. Evidencias Digitales y Validación OCR (Hasta 45 pts):
 *    - Captura de pantalla de chat (WhatsApp/Instagram): +20 pts
 *    - Comprobante bancario oficial de transferencia: +25 pts
 *    - Coincidencia exacta de OCR (CBU o Alias detectado coincide con el objetivo): Bono de consistencia
 * 
 * 3. Corroboración Comunitaria (Hasta 15 pts):
 *    - Múltiples denuncias independientes sobre el mismo objetivo (Alias, CBU, Tel, Local):
 *      1 denuncia previa: +5 pts, 2 previas: +10 pts, 3 o más: +15 pts
 */

import {
  CredibilityBreakdown,
  EvidenceItem,
  TrafficLightColor,
  UserIdentityFactors,
  VeracityLevel,
} from '../types';

export function calculateRG07Score(params: {
  identity: UserIdentityFactors;
  evidences?: EvidenceItem[];
  corroborationCount?: number;
}): CredibilityBreakdown {
  const { identity, evidences = [], corroborationCount = 0 } = params;

  // 1. Cálculo de Identidad (Hasta 40 pts)
  let identityScore = 0;
  if (identity.googleAuth) identityScore += 15;
  if (identity.phoneVerified) identityScore += 15;
  if (identity.dniVerified) identityScore += 10;
  identityScore = Math.min(40, identityScore);

  // 2. Cálculo de Evidencias (Hasta 45 pts)
  let evidenceScore = 0;
  const hasChat = evidences.some((e) => e.type === 'chat_screenshot');
  const hasReceipt = evidences.some((e) => e.type === 'bank_receipt');
  const hasOcrMatch = evidences.some((e) => e.ocrMatched);

  if (hasChat) evidenceScore += 20;
  if (hasReceipt) evidenceScore += 20;
  if (hasOcrMatch) evidenceScore += 5; // Bono de consistencia OCR

  evidenceScore = Math.min(45, evidenceScore);

  // 3. Cálculo de Corroboración (Hasta 15 pts)
  let corroborationScore = 0;
  if (corroborationCount >= 3) {
    corroborationScore = 15;
  } else if (corroborationCount === 2) {
    corroborationScore = 10;
  } else if (corroborationCount === 1) {
    corroborationScore = 5;
  }

  const totalScore = Math.min(100, identityScore + evidenceScore + corroborationScore);

  const level: VeracityLevel =
    totalScore >= 75 ? 'ALTA' : totalScore >= 40 ? 'SOSPECHOSA' : 'BAJA';

  const trafficLight: TrafficLightColor =
    totalScore >= 75 ? 'green' : totalScore >= 40 ? 'yellow' : 'red';

  return {
    identityScore,
    evidenceScore,
    corroborationScore,
    totalScore,
    level,
    trafficLight,
  };
}

export function getTrafficLightColor(color: TrafficLightColor): string {
  switch (color) {
    case 'green':
      return '#10B981'; // Esmeralda / Verificado
    case 'yellow':
      return '#F59E0B'; // Ámbar / Sospechoso
    case 'red':
      return '#EF4444'; // Rojo / Alerta Crítica o Baja Veracidad
  }
}

export function getVeracityDescription(level: VeracityLevel): string {
  switch (level) {
    case 'ALTA':
      return 'Evidencias concluyentes y denunciante verificado (Alta Veracidad)';
    case 'SOSPECHOSA':
      return 'En proceso de verificación con indicios sustanciales';
    case 'BAJA':
      return 'Reporte preliminar con baja documentación probatoria';
  }
}
