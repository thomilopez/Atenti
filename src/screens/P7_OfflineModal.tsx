import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useReportFlow } from '../context/ReportFlowContext';
import { DraftsListModal } from '../components/DraftsListModal';

type Props = NativeStackScreenProps<RootStackParamList, 'P7_OfflineModal'>;

export const P7_OfflineModal: React.FC<Props> = ({ navigation }) => {
  const { setSimulateOffline, submitReport, loadFromDraft } = useReportFlow();
  const [showDraftsList, setShowDraftsList] = useState(false);

  const handleRetry = async () => {
    try {
      setSimulateOffline(false);
      const res = await submitReport();
      navigation.replace('P8_Confirmation', {
        trackingCode: res.trackingCode,
        finalScore: res.credibilityScore,
        incidentId: res.id,
      });
    } catch (e) {
      // Sigue offline
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.75)" />

      {/* Pantalla P5 oscurecida de fondo */}
      <View style={styles.dimmedBackground}>
        <View style={styles.mockHeader}>
          <Text style={styles.mockHeaderText}>Agregar evidencia</Text>
        </View>
        <View style={styles.mockButtons}>
          <View style={styles.mockBtn} />
          <View style={styles.mockBtn} />
        </View>
        <View style={styles.mockFooter}>
          <Text style={styles.mockFooterText}>Credibilidad: 80%</Text>
        </View>
      </View>

      {/* Capa oscurecida y Modal (cuadro central) encima */}
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Ícono de alerta */}
          <View style={styles.alertIconCircle}>
            <Ionicons name="alert-circle" size={44} color="#EF4444" />
          </View>

          {/* Texto: "No hay conexión. Se guardó un borrador" */}
          <Text style={styles.alertMessage}>
            No hay conexión. Se guardó un borrador
          </Text>

          {/* Botones del Modal */}
          <View style={styles.actionsGroup}>
            {/* Botón "Reintentar" */}
            <TouchableOpacity
              style={styles.retryBtn}
              activeOpacity={0.88}
              onPress={handleRetry}
            >
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>

            {/* Botón "Ver Mis Borradores" */}
            <TouchableOpacity
              style={styles.draftsBtn}
              activeOpacity={0.88}
              onPress={() => setShowDraftsList(true)}
            >
              <Text style={styles.draftsBtnText}>Ver Mis Borradores</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DraftsListModal
        visible={showDraftsList}
        onClose={() => setShowDraftsList(false)}
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
    backgroundColor: '#000000',
  },
  dimmedBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1E293B',
    opacity: 0.25, // Oscurecida
    padding: 20,
    justifyContent: 'space-between',
  },
  mockHeader: {
    paddingVertical: 12,
  },
  mockHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mockButtons: {
    gap: 16,
  },
  mockBtn: {
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  mockFooter: {
    padding: 12,
  },
  mockFooterText: {
    color: '#94A3B8',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Oscurecido
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  // Modal (cuadro central) encima
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  alertIconCircle: {
    marginBottom: 14,
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionsGroup: {
    width: '100%',
    gap: 10,
  },
  // Botón "Reintentar"
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
  // Botón "Ver Mis Borradores"
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
