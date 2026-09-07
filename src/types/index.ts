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
  | 'Clonación de Identidad';

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
}

export interface IncidentReport {
  id: string;
  trackingCode: string; // ej: AT-2026-XXXX
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
  savedAt: number;
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
  P1_Home: undefined;
  P2_ReportDetail: { incident: IncidentReport };
  P3_LegalAuth: { targetIdentifier?: { type: IdentifierType; value: string }; returnTo?: 'P4_CreateReport' | 'P9_CredibilityPanel' } | undefined;
  P4_CreateReport: { prefilledIdentifier?: { type: IdentifierType; value: string }; draftId?: string } | undefined;
  P5_OCRValidation: undefined;
  P6_ValidationError: { field: string; message: string; invalidValue: string };
  P7_OfflineModal: { draftId?: string } | undefined;
  P8_Confirmation: { trackingCode: string; finalScore: number; incidentId: string };
  P9_CredibilityPanel: undefined;
};
