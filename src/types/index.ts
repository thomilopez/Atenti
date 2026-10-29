/**
 * Atenti - Definiciones de Tipos del MVP
 * Plataforma colaborativa y geolocalizada de prevención de fraudes en Argentina
 */

export type IdentifierType = 'Alias' | 'CBU' | 'CUIT' | 'Tel' | 'Local';

/**
 * Categoría de incidencia. Es un string para permitir categorías
 * paramétricas administrables (RF-027/RF-069).
 */
export type IncidentCategory = string;

export type VeracityLevel = 'ALTA' | 'SOSPECHOSA' | 'BAJA';

export type TrafficLightColor = 'green' | 'yellow' | 'red';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  province?: string;
  /** Campos de dirección manual (RF direccion). */
  calle?: string;
  numero?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  referencia?: string;
  /** true si se obtuvo por geocodificacion; false si es texto sin verificar. */
  verificada?: boolean;
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
  /** RF-034: metadatos técnicos leídos del archivo (no se muestran públicamente). */
  exif?: Record<string, unknown>;
  size?: number;
  mimeType?: string;
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
  /** RF-082: hash SHA-256 de la DDJJ aceptada. */
  ddjjHash?: string;
  ddjjAceptadaEn?: string;
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
  /** RF-024: borrado lógico; la denuncia deja de ser visible públicamente. */
  eliminada?: boolean;
  status: 'publicada' | 'en_revision' | 'desestimada';
}

export interface ReportDraft {
  id: string;
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

export interface ValidationErrorInfo {
  field: string;
  message: string;
  invalidValue: string;
}

export type RootStackParamList = {
  P0_Welcome: undefined;
  P1_Home: undefined;
  P2_ReportDetail: { incident: IncidentReport };
  P3_LegalAuth: { targetIdentifier?: { type: IdentifierType; value: string }; returnTo?: 'P4_CreateReport' | 'P9_CredibilityPanel' } | undefined;
  P4_CreateReport: { prefilledIdentifier?: { type: IdentifierType; value: string }; draftId?: string; validationError?: ValidationErrorInfo } | undefined;
  P5_OCRValidation: undefined;
  P7_OfflineModal: { draftId?: string } | undefined;
  P8_Confirmation: { trackingCode: string; finalScore: number; incidentId: string };
  P9_CredibilityPanel: undefined;
  P10_MisDenuncias: undefined;
  P11_TrackingCode: { codigo?: string } | undefined;
  P12_EditReport: { incident: IncidentReport };
  P13_SearchResults: { initialQuery?: string; initialType?: IdentifierType } | undefined;
  P14_AdminDashboard: undefined;
  P15_AdminDispute: { incident: IncidentReport };
  P16_AdminCategories: undefined;
  P17_AdminUsers: undefined;
  P18_AdminAudit: { incidentId: string };
  P19_NotificationCenter: undefined;
  P20_Settings: undefined;
  P21_Impugnacion: { incident: IncidentReport };
  P22_DisputeStatus: { denunciaId: string };
  P23_Legal: undefined;
  P24_RightToBeForgotten: undefined;
  P25_AuditLog: undefined;
  P26_NotificationPreferences: undefined;
  P31_FullMap: undefined;
};
