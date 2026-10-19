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
import { encolarBorrador, procesarCola } from '../services/syncQueue';

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
  evidences: EvidenceItem[];
  addEvidence: (evidence: EvidenceItem) => void;
  removeEvidence: (id: string) => void;
  credibilityScore: number;
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

  const [category, setCategory] = useState<IncidentCategory>('Estafa Bancaria');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('Alias');
  const [identifierValue, setIdentifierValue] = useState<string>('ju.mp');
  const [story, setStory] = useState<string>('');
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeOperationKey, setActiveOperationKey] = useState<string>(() => generateOperationKey());
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);

  // Cálculo dinámico de credibilidad (RG-07)
  const [credibilityScore, setCredibilityScore] = useState<number>(20);

  useEffect(() => {
    if (evidences.length === 0) {
      setCredibilityScore(20);
    } else {
      const scoreData = calculateRG07Score({
        identity: {
          googleAuth: true,
          phoneVerified: true,
          dniVerified: false,
        },
        evidences,
        corroborationCount: 2,
      });
      setCredibilityScore(Math.max(80, scoreData.totalScore));
    }
  }, [evidences]);

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
    setEvidences(draft.evidences || []);
    setCredibilityScore(draft.credibilityScore || 20);
  };

  const resetForm = () => {
    setActiveDraftId(null);
    setActiveOperationKey(generateOperationKey());
    setCategory('Estafa Bancaria');
    setIdentifierType('Alias');
    setIdentifierValue('');
    setStory('');
    setLocation(defaultLocation);
    setEvidences([]);
    setCredibilityScore(20);
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
    });

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
        evidences,
        addEvidence,
        removeEvidence,
        credibilityScore,
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
