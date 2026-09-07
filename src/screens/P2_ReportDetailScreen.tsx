import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { VeracityBar } from '../components/VeracityBar';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { useAuth } from '../context/AuthContext';
import { useReportFlow } from '../context/ReportFlowContext';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P2_ReportDetail'>;

export const P2_ReportDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { incident } = route.params;
  const { isAuthenticated } = useAuth();
  const { setIdentifierType, setIdentifierValue, setCategory } = useReportFlow();

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
        <View style={{ width: 36 }} />
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
          <View style={styles.evidenceRow}>
            {/* Cuadrado 1 */}
            <View style={styles.evidenceSquare}>
              {incident.evidences[0] ? (
                <Image
                  source={{ uri: incident.evidences[0].uri }}
                  style={styles.squareImage}
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
      </ScrollView>

      {/* Pie: Botón ancho "Denunciar mismo objetivo" */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.denounceBtn}
          activeOpacity={0.88}
          onPress={handleDenounceSameTarget}
        >
          <Text style={styles.denounceBtnText}>Denunciar mismo objetivo</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar activeTab="home" />
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
});
