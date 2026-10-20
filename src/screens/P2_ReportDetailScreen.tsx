import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { VeracityBar } from '../components/VeracityBar';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { useAuth } from '../context/AuthContext';
import { useReportFlow } from '../context/ReportFlowContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { toPublicProjection } from '../services/masking';
import { obtenerHistorialScore, EventoScore } from '../services/scoreHistory';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import {
  exportarFichaPDF,
  exportarCSV,
  generarCSV,
  hashAutenticidad,
} from '../services/exportService';

type Props = NativeStackScreenProps<RootStackParamList, 'P2_ReportDetail'>;

export const P2_ReportDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { incident } = route.params;
  const { isAuthenticated } = useAuth();
  const { setIdentifierType, setIdentifierValue, setCategory } = useReportFlow();

  const proyeccion = useMemo(() => toPublicProjection(incident), [incident]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [authHash, setAuthHash] = useState('');
  const [historialScore, setHistorialScore] = useState<EventoScore[]>([]);

  useEffect(() => {
    hashAutenticidad(proyeccion).then(setAuthHash).catch(() => {});
  }, [proyeccion]);

  useEffect(() => {
    obtenerHistorialScore(incident.id).then(setHistorialScore).catch(() => {});
  }, [incident.id]);

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await exportarFichaPDF(proyeccion);
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar la ficha en PDF.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      const columnas = [
        { key: 'codigo', label: 'Codigo' },
        { key: 'titulo', label: 'Titulo' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'score', label: 'Score' },
        { key: 'estado', label: 'Estado' },
        { key: 'relato', label: 'Relato' },
        { key: 'ubicacion', label: 'Ubicacion' },
      ];
      const fila = {
        codigo: proyeccion.codigo,
        titulo: proyeccion.tituloEnmascarado,
        categoria: proyeccion.categoria,
        score: proyeccion.credibilidadPct,
        estado: proyeccion.estado,
        relato: proyeccion.relato,
        ubicacion: proyeccion.ubicacion.address,
      };
      await exportarCSV(`atenti_${proyeccion.codigo}.csv`, generarCSV([fila], columnas));
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar la ficha en CSV.');
    } finally {
      setExporting(null);
    }
  };

  const handleDenounceSameTarget = () => {
    setIdentifierType(incident.identifierType);
    setIdentifierValue(incident.identifierValue);
    setCategory(incident.category);

    if (!isAuthenticated) {
      navigation.navigate('P3_LegalAuth', {
        returnTo: 'P4_CreateReport',
        targetIdentifier: {
          type: incident.identifierType,
          value: incident.identifierValue,
        },
      });
    } else {
      navigation.navigate('P4_CreateReport', {
        prefilledIdentifier: {
          type: incident.identifierType,
          value: incident.identifierValue,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barra de navegación superior */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Detalle de Incidencia</Text>
        <TouchableOpacity
          onPress={() => setShowExportModal(true)}
          style={styles.exportIconBtn}
        >
          <Ionicons name="share-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner de imagen superior como en el mockup */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri:
                incident.evidences[0]?.uri ||
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
            }}
            style={styles.heroImage}
            blurRadius={14}
          />
        </View>

        {/* Cabecera: Título (ej. "Alias: ju.mp") y un semáforo (un círculo gris oscuro) */}
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <Text style={styles.targetTitle} numberOfLines={1}>
              {incident.title || `${incident.identifierType}: ${incident.identifierValue}`}
            </Text>
            {/* Semáforo: un círculo gris oscuro */}
            <View style={styles.trafficLightCircle} />
          </View>

          <Text style={styles.categorySubText}>
            {incident.category} • {incident.trackingCode}
          </Text>

          {/* Barra de porcentaje: Un rectángulo horizontal ancho relleno al 80% */}
          <View style={styles.veracitySection}>
            <VeracityBar
              percentage={incident.credibilityScore || 80}
              height={18}
              label="Nivel de Veracidad"
            />
          </View>

          <View style={styles.breakdownWrap}>
            <ScoreBreakdown breakdown={incident.credibilityBreakdown} />
          </View>
        </View>

        {/* Cuerpo: Un recuadro para el mapa */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionLabel}>Ubicación Georreferenciada</Text>
          <View style={styles.mapRecuadro}>
            <MapViewWrapper
              selectedLocation={incident.location}
              centerLatitude={incident.location.latitude}
              centerLongitude={incident.location.longitude}
              style={styles.mapInner}
            />
          </View>
          <Text style={styles.addressLabel}>📍 {incident.location.address}</Text>
        </View>

        {/* Cuerpo: Debajo 2 cuadrados pequeños para las fotos (Evidencias) */}
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionLabel}>Evidencias</Text>
          <Text style={styles.maskedNote}>Datos sensibles protegidos con blur</Text>
          <View style={styles.evidenceRow}>
            {/* Cuadrado 1 */}
            <View style={styles.evidenceSquare}>
              {incident.evidences[0] ? (
                <Image
                  source={{ uri: incident.evidences[0].uri }}
                  style={styles.squareImage}
                  blurRadius={14}
                />
              ) : (
                <View style={styles.emptySquarePlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#94A3B8" />
                </View>
              )}
            </View>

            {/* Cuadrado 2 */}
            <View style={styles.evidenceSquare}>
              {incident.evidences[1] ? (
                <Image
                  source={{ uri: incident.evidences[1].uri }}
                  style={styles.squareImage}
                  blurRadius={14}
                />
              ) : (
                <View style={styles.emptySquarePlaceholder}>
                  <Ionicons name="document-text-outline" size={24} color="#94A3B8" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Relato */}
        <View style={styles.storySection}>
          <Text style={styles.sectionLabel}>Relato</Text>
          <Text style={styles.storyText}>"{incident.story}"</Text>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>Evolución del score</Text>
          {historialScore.length === 0 ? (
            <Text style={styles.emptyHistory}>Sin cambios de score registrados.</Text>
          ) : (
            historialScore.map((evento) => (
              <View key={evento.id} style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyMotivo}>{evento.motivo}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(evento.fecha).toLocaleString('es-AR')}
                  </Text>
                </View>
                <Text style={styles.historyScore}>{evento.score}%</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Pie: Botón ancho "Denunciar mismo objetivo" */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.impugnarBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('P21_Impugnacion', { incident })}
        >
          <Text style={styles.impugnarBtnText}>Impugnar esta denuncia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.denounceBtn}
          activeOpacity={0.88}
          onPress={handleDenounceSameTarget}
        >
          <Text style={styles.denounceBtnText}>Denunciar mismo objetivo</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar activeTab="home" />

      <Modal visible={showExportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Exportar ficha pública</Text>
            <Text style={styles.modalSubtitle}>{proyeccion.codigo}</Text>

            <View style={styles.qrContainer}>
              <QRCode value={proyeccion.codigo} size={140} />
            </View>

            <Text style={styles.hashLabel}>Hash de autenticidad (SHA-256)</Text>
            <Text style={styles.hashValue} numberOfLines={2}>
              {authHash || 'Calculando...'}
            </Text>

            <TouchableOpacity
              style={styles.exportPdfBtn}
              onPress={handleExportPDF}
              disabled={Boolean(exporting)}
            >
              {exporting === 'pdf' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.exportPdfText}>Exportar PDF</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportCsvBtn}
              onPress={handleExportCSV}
              disabled={Boolean(exporting)}
            >
              {exporting === 'csv' ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.exportCsvText}>Exportar CSV</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeExportBtn}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.closeExportText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
  },
  heroBanner: {
    width: '100%',
    height: 160,
    backgroundColor: '#E2E8F0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  targetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
  },
  // Semáforo: un círculo gris oscuro
  trafficLightCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155', // Círculo gris oscuro
    marginLeft: 8,
  },
  categorySubText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  veracitySection: {
    marginTop: 4,
  },
  breakdownWrap: {
    marginTop: 12,
  },
  historySection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  emptyHistory: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  historyInfo: {
    flex: 1,
  },
  historyMotivo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  historyScore: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  mapSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  // Recuadro para el mapa
  mapRecuadro: {
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  mapInner: {
    width: '100%',
    height: '100%',
  },
  addressLabel: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
  },
  evidenceSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  maskedNote: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 8,
  },
  // 2 cuadrados pequeños para las fotos (Evidencias)
  evidenceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  evidenceSquare: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  squareImage: {
    width: '100%',
    height: '100%',
  },
  emptySquarePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storySection: {
    padding: 16,
  },
  storyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  impugnarBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impugnarBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  // Botón ancho "Denunciar mismo objetivo" (en rojo llamativo como en mockup)
  denounceBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denounceBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  exportIconBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  hashLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hashValue: {
    fontSize: 10,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
  },
  exportPdfBtn: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  exportPdfText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  exportCsvBtn: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportCsvText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  closeExportBtn: {
    marginTop: 10,
    paddingVertical: 8,
  },
  closeExportText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
