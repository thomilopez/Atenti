/**
 * Atenti - Definiciones de Tipos del MVP
 * Plataforma colaborativa y geolocalizada de prevención de fraudes en Argentina
 */

export type IdentifierType = 'Alias' | 'CBU' | 'Tel' | 'Local';

export type IncidentCategory =
  | 'Estafa Bancaria'
  | 'Phishing / Suplantación'
  | 'Comercio Virtual Falso'
  | 'Local Físico Ilícito'
  | 'Clonación de Identidad'
  | 'Fraude con Criptoactivos'
  | 'Robo o Despojo en Vía Pública'
  | 'Falso Gestor / Trámite'
  | 'Llamada Extorsiva / Cuento del Tío'
  | 'Alquiler Fantasma / Inmueble Falso';

export type VeracityLevel = 'ALTA' | 'SOSPECHOSA' | 'BAJA';

export type TrafficLightColor = 'green' | 'yellow' | 'red';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  province?: string;
}

export interface EvidenceItem {
  id: string;
  type: 'chat_screenshot' | 'bank_receipt' | 'other';
  label: string;
  uri: string;
  ocrExtractedText?: string;
  ocrMatched?: boolean;
  ocrConfidence?: number;
  isMasked?: boolean;
  timestamp: number;
}

export interface UserIdentityFactors {
  googleAuth: boolean;      // +15 pts
  phoneVerified: boolean;   // +15 pts
  dniVerified: boolean;     // +10 pts
}

export interface CredibilityBreakdown {
  identityScore: number;       // Hasta 40 pts
  evidenceScore: number;       // Hasta 45 pts
  corroborationScore: number;  // Hasta 15 pts
  totalScore: number;          // Hasta 100%
  level: VeracityLevel;
  trafficLight: TrafficLightColor;
}

export interface AuditMetadata {
  uid: string;
  userEmail: string;
  clientIp: string;
  platform: 'android' | 'ios' | 'web';
  createdAt: string;
  /** RNF3: hash criptográfico inmutable de la DDJJ, UID, IP y timestamp */
  ddjjHash?: string;
  ddjjAccepted?: boolean;
  ddjjAcceptedAt?: string;
  indemnityAccepted?: boolean;
}

export interface DniOcrResult {
  extractedDni: string;
  fullName?: string;
  gender?: string;
  tramiteNumber?: string;
  confidence: number;
  matched: boolean;
  documentType: 'DNI_ARG' | 'UNKNOWN';
}

export interface IncidentReport {
  id: string;
  trackingCode: string; // ej: AT-2026-XXXXXX (I-01 único)
  /** RG-06: clave idempotente generada por el cliente para el intento lógico. */
  claveOperacion?: string;
  /** Etapa 3 §4: estado canónico. `status` se conserva por compatibilidad. */
  estadoActual?: 'RECIBIDA' | 'PUBLICADA' | 'EN_DISPUTA' | 'RESUELTA';
  /** Etapa 3 §3: índice de agrupación comunitaria. */
  valorNormalizado?: string;
  identifierType: IdentifierType;
  identifierValue: string;
  title: string;
  category: IncidentCategory;
  story: string;
  location: LocationData;
  evidences: EvidenceItem[];
  credibilityScore: number;
  credibilityBreakdown: CredibilityBreakdown;
  corroborationCount: number;
  audit: AuditMetadata;
  status: 'publicada' | 'en_revision' | 'desestimada';
}

export interface ReportDraft {
  id: string;
  clave_operacion: string; // Identificador único para el borrador, usado para guardar y recuperar
  savedAt: number;
  /** RG-06: el borrador retiene la misma clave del intento lógico (E2/E3). */
  claveOperacion: string;
  category: IncidentCategory;
  identifierType: IdentifierType;
  identifierValue: string;
  story: string;
  location: LocationData;
  evidences: EvidenceItem[];
  credibilityScore: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  identityFactors: UserIdentityFactors;
  phoneNumber?: string;
  dniNumber?: string;
}

export type RootStackParamList = {
  P0_Welcome: undefined;
  P1_Home: undefined;
  P2_ReportDetail: { incident: IncidentReport };
  P3_LegalAuth: { targetIdentifier?: { type: IdentifierType; value: string }; returnTo?: 'P4_CreateReport' | 'P9_CredibilityPanel' | 'IdentityUpgrade' } | undefined;
  P4_CreateReport: { prefilledIdentifier?: { type: IdentifierType; value: string }; draftId?: string } | undefined;
  P5_OCRValidation: undefined;
  P6_ValidationError: { field: string; message: string; invalidValue: string };
  P7_OfflineModal: { draftId?: string } | undefined;
  P8_Confirmation: { trackingCode: string; finalScore: number; incidentId: string };
  P9_CredibilityPanel: undefined;
  IdentityUpgrade: { factor?: 'phone' | 'dni' } | undefined;
};

