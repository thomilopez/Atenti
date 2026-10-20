import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EvidenceItem, RootStackParamList } from '../types';
import { useReportFlow } from '../context/ReportFlowContext';
import { processEvidenceOCR } from '../services/ocrService';
import { MAX_EVIDENCIAS, validarArchivo, formatearBytes } from '../services/evidenceService';
import { subirEvidencia } from '../services/storageService';
import { DraftsListModal } from '../components/DraftsListModal';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P5_OCRValidation'>;

export const P5_OCRValidationScreen: React.FC<Props> = ({ navigation }) => {
  const {
    identifierType,
    identifierValue,
    evidences,
    addEvidence,
    removeEvidence,
    credibilityScore,
    submitReport,
    simulateOffline,
    setSimulateOffline,
    loadFromDraft,
  } = useReportFlow();

  const [ocrLoading, setOcrLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showDraftsListModal, setShowDraftsListModal] = useState(false);

  const evidenciasLleno = evidences.length >= MAX_EVIDENCIAS;

  const handleUpload = async (type: 'chat_screenshot' | 'bank_receipt') => {
    if (evidenciasLleno) {
      Alert.alert('Límite alcanzado', `Podés adjuntar hasta ${MAX_EVIDENCIAS} evidencias.`);
      return;
    }

    try {
      setOcrLoading(true);

      let uri: string | undefined;
      let base64: string | undefined;
      let fileName: string | null | undefined;
      let mimeType: string | null | undefined;
      let size: number | undefined;
      let exif: Record<string, unknown> | undefined;

      const demoUri =
        type === 'chat_screenshot'
          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'
          : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400';

      // RF-028/RF-034: selección real desde la galería con base64 y EXIF.
      try {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permiso.granted) {
          const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.7,
            exif: true,
          });
          if (!resultado.canceled && resultado.assets[0]) {
            const asset = resultado.assets[0];
            uri = asset.uri;
            base64 = asset.base64 ?? undefined;
            fileName = asset.fileName;
            mimeType = asset.mimeType;
            size = asset.fileSize;
            exif = asset.exif ? { ...asset.exif } : undefined;
          }
        }
      } catch (pickerError) {
        // En web o sin permisos se usa la imagen demo.
      }

      const archivo = { uri: uri ?? demoUri, name: fileName, mimeType, size };
      const validacion = validarArchivo(archivo, evidences.length);
      if (!validacion.ok) {
        setOcrLoading(false);
        Alert.alert('Archivo inválido', validacion.error ?? 'No se pudo adjuntar.');
        return;
      }

      const finalUri = uri ?? demoUri;
      const url = await subirEvidencia({
        uri: finalUri,
        nombre: fileName ?? `evidencia_${Date.now()}`,
        mimeType: mimeType ?? 'image/jpeg',
      });

      const ocrResult = await processEvidenceOCR(
        type,
        identifierType,
        identifierValue,
        finalUri,
        base64
      );

      const newEvidence: EvidenceItem = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        label: type === 'chat_screenshot' ? 'Captura de Chat' : 'Comprobante de Transferencia',
        uri: url,
        ocrExtractedText: ocrResult.extractedText,
        ocrMatched: ocrResult.matched,
        ocrConfidence: ocrResult.confidence,
        isMasked: true,
        timestamp: Date.now(),
        size,
        mimeType: mimeType ?? undefined,
        exif,
      };

      addEvidence(newEvidence);
      setOcrLoading(false);
      if (ocrResult.matched) {
        Alert.alert('OCR validado', 'La evidencia coincide con el objetivo. El score se actualizó.');
      }
    } catch (err) {
      setOcrLoading(false);
      Alert.alert('Error', 'No se pudo procesar la evidencia.');
    }
  };

  const handleUploadPDF = async () => {
    if (evidenciasLleno) {
      Alert.alert('Límite alcanzado', `Podés adjuntar hasta ${MAX_EVIDENCIAS} evidencias.`);
      return;
    }
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (resultado.canceled || !resultado.assets?.[0]) return;

      const asset = resultado.assets[0];
      const validacion = validarArchivo(
        { uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size },
        evidences.length
      );
      if (!validacion.ok) {
        Alert.alert('Archivo inválido', validacion.error ?? 'No se pudo adjuntar.');
        return;
      }

      const url = await subirEvidencia({
        uri: asset.uri,
        nombre: asset.name,
        mimeType: asset.mimeType ?? 'application/pdf',
      });

      addEvidence({
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'other',
        label: asset.name,
        uri: url,
        isMasked: true,
        timestamp: Date.now(),
        size: asset.size,
        mimeType: asset.mimeType ?? 'application/pdf',
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo adjuntar el documento.');
    }
  };

  const handleSendReport = async () => {
    // RG-02: se requiere al menos una evidencia.
    if (evidences.length === 0) {
      Alert.alert(
        'Evidencia requerida',
        'Adjuntá al menos una captura o comprobante para enviar el reporte.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReport();
      setSubmitting(false);
      navigation.replace('P8_Confirmation', {
        trackingCode: result.trackingCode,
        finalScore: result.credibilityScore,
        incidentId: result.id,
      });
    } catch (error: any) {
      setSubmitting(false);
      const mensaje = error?.message ?? '';
      if (mensaje === 'RATE_LIMIT_EXCEEDED') {
        Alert.alert(
          'Límite diario alcanzado',
          'Alcanzaste el máximo de denuncias por día. Volvé a intentarlo mañana.'
        );
      } else if (mensaje === 'SPAM_DUPLICADO') {
        Alert.alert(
          'Posible duplicado',
          'Detectamos una denuncia muy similar reciente. Revisá tu reporte antes de enviarlo.'
        );
      } else {
        setShowOfflineModal(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Agregar evidencia</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Switch para prueba manual de Modo Offline (P7) */}
        <View style={styles.offlineBar}>
          <Text style={styles.offlineBarText}>
            Estado de Red: {simulateOffline ? 'Offline (Simulado)' : 'Conectado'}
          </Text>
          <TouchableOpacity
            style={[styles.offlineToggle, simulateOffline && styles.offlineToggleActive]}
            onPress={() => setSimulateOffline(!simulateOffline)}
          >
            <Text style={styles.offlineToggleText}>
              {simulateOffline ? 'Desactivar' : 'Simular Offline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cuerpo: Botones grandes delineados con íconos de "+" (Subir captura, Subir comprobante) */}
        <View style={styles.buttonsGroup}>
          {/* Subir captura */}
          <TouchableOpacity
            style={styles.largeOutlinedBtn}
            activeOpacity={0.8}
            onPress={() => handleUpload('chat_screenshot')}
            disabled={ocrLoading || evidenciasLleno}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="add" size={24} color="#000000" />
            </View>
            <Text style={styles.btnTitle}>Subir captura</Text>
            <Text style={styles.btnSubtitle}>Chats de WhatsApp, Instagram o redes</Text>
          </TouchableOpacity>

          {/* Subir comprobante */}
          <TouchableOpacity
            style={styles.largeOutlinedBtn}
            activeOpacity={0.8}
            onPress={() => handleUpload('bank_receipt')}
            disabled={ocrLoading || evidenciasLleno}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="add" size={24} color="#000000" />
            </View>
            <Text style={styles.btnTitle}>Subir comprobante</Text>
            <Text style={styles.btnSubtitle}>Comprobante bancario oficial de transferencia</Text>
          </TouchableOpacity>

          {/* Subir PDF / documento */}
          <TouchableOpacity
            style={styles.largeOutlinedBtn}
            activeOpacity={0.8}
            onPress={handleUploadPDF}
            disabled={ocrLoading || evidenciasLleno}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-attach-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.btnTitle}>Subir PDF</Text>
            <Text style={styles.btnSubtitle}>Documento o comprobante en PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Aviso: Un texto pequeño que diga "Validando OCR..." */}
        {ocrLoading && (
          <View style={styles.ocrNotice}>
            <ActivityIndicator size="small" color="#000000" />
            <Text style={styles.ocrNoticeText}>Validando OCR...</Text>
          </View>
        )}

        {/* Evidencias cargadas */}
        {evidences.length > 0 && (
          <View style={styles.evidencesSection}>
            <Text style={styles.evidencesTitle}>
              Evidencias adjuntas ({evidences.length}/{MAX_EVIDENCIAS})
            </Text>
            {evidences.map((ev) => (
              <View key={ev.id} style={styles.evidenceItem}>
                <Image source={{ uri: ev.uri }} style={styles.evidenceThumb} />
                <View style={styles.evidenceDetails}>
                  <Text style={styles.evidenceLabel}>{ev.label}</Text>
                  <Text style={styles.evidenceOcr} numberOfLines={1}>
                    {ev.ocrExtractedText}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeEvidence(ev.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Pie de pantalla: El mismo panel inferior pero ahora marcando "Credibilidad: 80%" y el botón principal oscuro "Enviar Reporte" */}
      <View style={styles.fixedFooter}>
        <View style={styles.credibilityBox}>
          <Text style={styles.credibilityLabel}>Credibilidad:</Text>
          <Text style={styles.credibilityPercent}>
            {evidences.length > 0 ? '80%' : `${credibilityScore}%`}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitMainBtn,
            (submitting || evidences.length === 0) && styles.btnDisabled,
          ]}
          activeOpacity={0.88}
          onPress={handleSendReport}
          disabled={submitting || evidences.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitMainBtnText}>Enviar Reporte</Text>
          )}
        </TouchableOpacity>
      </View>

      <BottomNavBar activeTab="report" />

      {/* P7 - Modal de Falla Técnica (Offline) */}
      <Modal visible={showOfflineModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            {/* Ícono de alerta */}
            <View style={styles.modalAlertIcon}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </View>

            {/* Texto: "No hay conexión. Se guardó un borrador" */}
            <Text style={styles.modalAlertMessage}>
              No hay conexión. Se guardó un borrador
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setShowOfflineModal(false);
                  setSimulateOffline(false);
                  setTimeout(() => handleSendReport(), 300);
                }}
              >
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.draftsBtn}
                onPress={() => {
                  setShowOfflineModal(false);
                  setShowDraftsListModal(true);
                }}
              >
                <Text style={styles.draftsBtnText}>Ver Mis Borradores</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DraftsListModal
        visible={showDraftsListModal}
        onClose={() => setShowDraftsListModal(false)}
        onSelectDraft={(draft) => {
          loadFromDraft(draft);
          navigation.navigate('P4_CreateReport');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  offlineBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  offlineBarText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  offlineToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  offlineToggleActive: {
    backgroundColor: '#FEE2E2',
  },
  offlineToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Botones grandes delineados con íconos de "+" (Subir captura, Subir comprobante)
  buttonsGroup: {
    gap: 16,
    marginBottom: 16,
  },
  largeOutlinedBtn: {
    borderWidth: 1.5,
    borderColor: '#000000', // Delineado
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  btnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 2,
  },
  btnSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  // Aviso: Un texto pequeño que diga "Validando OCR..."
  ocrNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    marginBottom: 16,
  },
  ocrNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  evidencesSection: {
    marginTop: 8,
  },
  evidencesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  evidenceThumb: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  evidenceDetails: {
    flex: 1,
  },
  evidenceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  evidenceOcr: {
    fontSize: 10,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 6,
  },
  // Pie de pantalla: El mismo panel inferior pero ahora marcando "Credibilidad: 80%" y el botón principal oscuro "Enviar Reporte"
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  credibilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credibilityLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  credibilityPercent: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00E676', // Verde vibrante
  },
  submitMainBtn: {
    backgroundColor: '#000000', // Botón principal oscuro
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitMainBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  // Modal P7
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalAlertIcon: {
    marginBottom: 12,
  },
  modalAlertMessage: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  retryBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  draftsBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  draftsBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});
