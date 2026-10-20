/**
 * Contexto de Flujo de Creación de Denuncias (P4, P5, P7, P8)
 * Gestiona el formulario reactivo, cálculo de credibilidad RG-07, respaldo
 * offline (autosave cada 10s) y sincronización con reintentos exponenciales.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import {
  CredibilityBreakdown,
  EvidenceItem,
  IdentifierType,
  IncidentCategory,
  IncidentReport,
  LocationData,
  ReportDraft,
} from '../types';
import { calculateRG07Score } from '../services/credibility';
import { registrarDenuncia, isFirebaseConfigured } from '../services/firebase';
import { generateOperationKey } from '../services/operationKey';
import { normalizeIdentifier } from '../services/normalize';
import { verificarLimiteDenuncias, detectarSpam } from '../services/cloudFunctions';
import { saveDraft, getDraftById, deleteDraft } from '../services/draftStorage';
import { useConnectivity } from './ConnectivityContext';
import { useAuth } from './AuthContext';
import { encolarBorrador, procesarCola } from '../services/syncQueue';
import { registrarCambioScore } from '../services/scoreHistory';
import { generarHashDDJJ } from '../services/ddjjService';
import { crearNotificacion } from '../services/notificationService';
import { notificarCorroboracion } from '../services/corroborationService';

interface ReportFlowContextType {
  category: IncidentCategory;
  setCategory: (val: IncidentCategory) => void;
  identifierType: IdentifierType;
  setIdentifierType: (val: IdentifierType) => void;
  identifierValue: string;
  setIdentifierValue: (val: string) => void;
  story: string;
  setStory: (val: string) => void;
  location: LocationData;
  setLocation: (val: LocationData) => void;
  /** RG-03: indica si el usuario confirmó explícitamente un pin en el mapa. */
  pinConfirmado: boolean;
  setPinConfirmado: (val: boolean) => void;
  evidences: EvidenceItem[];
  addEvidence: (evidence: EvidenceItem) => void;
  removeEvidence: (id: string) => void;
  credibilityScore: number;
  credibilityBreakdown: CredibilityBreakdown;
  activeDraftId: string | null;
  loadFromDraft: (draft: ReportDraft) => void;
  resetForm: () => void;
  saveCurrentDraft: () => Promise<ReportDraft>;
  submitReport: () => Promise<IncidentReport>;
  simulateOffline: boolean;
  setSimulateOffline: (val: boolean) => void;
}

const defaultLocation: LocationData = {
  latitude: -34.6037,
  longitude: -58.3816,
  address: 'Av. Corrientes 1050, San Nicolás, CABA',
  city: 'CABA',
  province: 'Buenos Aires',
};

const ReportFlowContext = createContext<ReportFlowContextType | undefined>(undefined);

export const ReportFlowProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useConnectivity();
  const { identityFactors } = useAuth();

  const [category, setCategory] = useState<IncidentCategory>('Estafa Bancaria');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('Alias');
  const [identifierValue, setIdentifierValue] = useState<string>('ju.mp');
  const [story, setStory] = useState<string>('');
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [pinConfirmado, setPinConfirmado] = useState<boolean>(false);
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeOperationKey, setActiveOperationKey] = useState<string>(() => generateOperationKey());
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);

  // Cálculo dinámico de credibilidad (RG-07), sin valores fijos.
  const [credibilityBreakdown, setCredibilityBreakdown] = useState<CredibilityBreakdown>(() =>
    calculateRG07Score({
      identity: identityFactors,
      evidences: [],
      corroborationCount: 0,
    })
  );
  const credibilityScore = credibilityBreakdown.totalScore;

  useEffect(() => {
    const breakdown = calculateRG07Score({
      identity: identityFactors,
      evidences,
      corroborationCount: 0,
    });
    setCredibilityBreakdown(breakdown);
  }, [evidences, identityFactors]);

  const addEvidence = (evidence: EvidenceItem) => {
    setEvidences((prev) => [...prev, evidence]);
  };

  const removeEvidence = (id: string) => {
    setEvidences((prev) => prev.filter((e) => e.id !== id));
  };

  const loadFromDraft = (draft: ReportDraft) => {
    setActiveDraftId(draft.id);
    setActiveOperationKey(draft.claveOperacion || generateOperationKey());
    setCategory(draft.category);
    setIdentifierType(draft.identifierType);
    setIdentifierValue(draft.identifierValue);
    setStory(draft.story);
    setLocation(draft.location);
    setPinConfirmado(true);
    setEvidences(draft.evidences || []);
  };

  const resetForm = () => {
    setActiveDraftId(null);
    setActiveOperationKey(generateOperationKey());
    setCategory('Estafa Bancaria');
    setIdentifierType('Alias');
    setIdentifierValue('');
    setStory('');
    setLocation(defaultLocation);
    setPinConfirmado(false);
    setEvidences([]);
  };

  const saveCurrentDraft = async (): Promise<ReportDraft> => {
    const draft = await saveDraft({
      id: activeDraftId || undefined,
      claveOperacion: activeOperationKey,
      category,
      identifierType,
      identifierValue,
      story,
      location,
      evidences,
      credibilityScore,
    });
    setActiveDraftId(draft.id);
    return draft;
  };

  // Ref con la última versión de saveCurrentDraft para el autosave.
  const saveRef = useRef(saveCurrentDraft);
  useEffect(() => {
    saveRef.current = saveCurrentDraft;
  });

  const hayContenido =
    Boolean(identifierValue.trim()) || Boolean(story.trim()) || evidences.length > 0;
  const hayContenidoRef = useRef(hayContenido);
  useEffect(() => {
    hayContenidoRef.current = hayContenido;
  }, [hayContenido]);

  // RF-054: autosave cada 10 segundos.
  useEffect(() => {
    const interval = setInterval(() => {
      if (hayContenidoRef.current) {
        saveRef.current().catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // RF-055/RF-056: al recuperar conexión, procesar la cola de borradores.
  const enviarBorradorPorId = async (draftId: string): Promise<void> => {
    const draft = await getDraftById(draftId);
    if (!draft) throw new Error('Borrador inexistente');
    await registrarDenuncia({
      identifierType: draft.identifierType,
      identifierValue: draft.identifierValue,
      category: draft.category,
      story: draft.story,
      location: draft.location,
      evidences: draft.evidences ?? [],
      uid: 'usr_atenti_reporter_demo',
      userEmail: 'denunciante.atenti@gmail.com',
      ddjjAceptada: true,
      googleVerificado: true,
      claveOperacion: draft.claveOperacion,
    });
    await deleteDraft(draftId);
  };

  const enviarRef = useRef(enviarBorradorPorId);
  useEffect(() => {
    enviarRef.current = enviarBorradorPorId;
  });

  useEffect(() => {
    if (!isConnected) return;
    procesarCola((draftId) => enviarRef.current(draftId)).catch(() => {});
  }, [isConnected]);

  const submitReport = async (): Promise<IncidentReport> => {
    if (simulateOffline || !isConnected) {
      // E2: borrador retiene la misma clave_operacion, sin código AT-.
      const draft = await saveCurrentDraft();
      await encolarBorrador(draft.id);
      throw new Error('NETWORK_OFFLINE_ERROR');
    }

    const uid = 'usr_atenti_reporter_demo';

    // RF-090 / RF-091: validaciones server-side antes de registrar.
    if (isFirebaseConfigured) {
      const limite = await verificarLimiteDenuncias(uid);
      if (!limite.permitido) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      const spam = await detectarSpam({
        uid,
        valorNormalizado: normalizeIdentifier(identifierType, identifierValue),
        relato: story,
      });
      if (spam.duplicado) {
        throw new Error('SPAM_DUPLICADO');
      }
    }

    // RF-082: hash de la DDJJ con IP y timestamp.
    const ddjj = await generarHashDDJJ({ uid, ip: '0.0.0.0' });

    // E3: reintentos usan la misma clave; el servidor devuelve el código original.
    const { reporte } = await registrarDenuncia({
      identifierType,
      identifierValue,
      category,
      story,
      location,
      evidences,
      uid,
      userEmail: 'denunciante.atenti@gmail.com',
      ddjjAceptada: true,
      googleVerificado: true,
      claveOperacion: activeOperationKey,
      ddjjHash: ddjj.hash,
      ddjjAceptadaEn: ddjj.aceptadaEn,
    });

    // RF-049: registrar la evolución del score de la denuncia recién creada.
    const scoreInicial = calculateRG07Score({
      identity: identityFactors,
      evidences: [],
      corroborationCount: 0,
    }).totalScore;
    await registrarCambioScore({
      denunciaId: reporte.id,
      score: scoreInicial,
      motivo: 'Creación sin evidencias',
    });
    if (evidences.length > 0) {
      await registrarCambioScore({
        denunciaId: reporte.id,
        score: reporte.credibilityScore,
        motivo: 'Evidencias adjuntas',
      });
    }

    // RF-077: avisar al denunciante que su reporte fue publicado.
    if (reporte.estadoActual === 'PUBLICADA') {
      await crearNotificacion({
        uid,
        tipo: 'CAMBIO_ESTADO',
        mensaje: `Tu denuncia ${reporte.trackingCode} fue publicada.`,
        denunciaId: reporte.id,
      });
    }

    // RF-078: avisar a denunciantes previos sobre el mismo objetivo.
    await notificarCorroboracion({
      valorNormalizado: normalizeIdentifier(identifierType, identifierValue),
      excludeUid: uid,
      codigo: reporte.trackingCode,
    }).catch(() => {});

    return reporte;
  };

  return (
    <ReportFlowContext.Provider
      value={{
        category,
        setCategory,
        identifierType,
        setIdentifierType,
        identifierValue,
        setIdentifierValue,
        story,
        setStory,
        location,
        setLocation,
        pinConfirmado,
        setPinConfirmado,
        evidences,
        addEvidence,
        removeEvidence,
        credibilityScore,
        credibilityBreakdown,
        activeDraftId,
        loadFromDraft,
        resetForm,
        saveCurrentDraft,
        submitReport,
        simulateOffline,
        setSimulateOffline,
      }}
    >
      {children}
    </ReportFlowContext.Provider>
  );
};

export const useReportFlow = () => {
  const context = useContext(ReportFlowContext);
  if (!context) {
    throw new Error('useReportFlow debe ser utilizado dentro de un ReportFlowProvider');
  }
  return context;
};
