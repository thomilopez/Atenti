import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IncidentReport, RootStackParamList } from '../types';
import { getIncidents } from '../services/firebase';
import { obtenerUbicacionActual } from '../services/locationService';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P31_FullMap'>;

export const P31_FullMapScreen: React.FC<Props> = ({ navigation }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [radioKm, setRadioKm] = useState<number | undefined>(undefined);
  const [centro, setCentro] = useState({ latitude: -34.6037, longitude: -58.3816 });

  useEffect(() => {
    getIncidents()
      .then(setIncidents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMiUbicacion = async () => {
    const coords = await obtenerUbicacionActual();
    if (!coords) {
      Alert.alert(
        'Ubicación no disponible',
        'No pudimos obtener tu ubicación. Revisá los permisos del dispositivo.'
      );
      return;
    }
    setCentro(coords);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mapa de denuncias</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#0F172A" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        ) : (
          <MapViewWrapper
            incidents={incidents}
            onMarkerPress={(incident) => navigation.navigate('P2_ReportDetail', { incident })}
            centerLatitude={centro.latitude}
            centerLongitude={centro.longitude}
            showHeatmap={showHeatmap}
            radioKm={radioKm}
            radioCenter={centro}
          />
        )}

        <View style={styles.layersPanel}>
          <TouchableOpacity
            style={[styles.layerChip, showHeatmap && styles.layerChipActive]}
            onPress={() => setShowHeatmap((v) => !v)}
          >
            <Ionicons
              name="flame-outline"
              size={14}
              color={showHeatmap ? '#FFFFFF' : '#0F172A'}
            />
            <Text style={[styles.layerChipText, showHeatmap && styles.layerChipTextActive]}>
              Calor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerChip} onPress={handleMiUbicacion}>
            <Ionicons name="locate" size={14} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.radioPanel}>
          {[1, 5, 10, 20].map((km) => (
            <TouchableOpacity
              key={km}
              style={[styles.radioChip, radioKm === km && styles.radioChipActive]}
              onPress={() => setRadioKm(radioKm === km ? undefined : km)}
            >
              <Text style={[styles.radioChipText, radioKm === km && styles.radioChipTextActive]}>
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <BottomNavBar activeTab="map" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  mapContainer: { flex: 1, backgroundColor: '#E2E8F0', position: 'relative' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { fontSize: 12, color: '#64748B' },
  layersPanel: { position: 'absolute', top: 12, right: 12, gap: 8, zIndex: 20 },
  layerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  layerChipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  layerChipText: { fontSize: 10, fontWeight: '800', color: '#0F172A' },
  layerChipTextActive: { color: '#FFFFFF' },
  radioPanel: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 20,
  },
  radioChip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radioChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  radioChipText: { fontSize: 10, fontWeight: '800', color: '#0F172A' },
  radioChipTextActive: { color: '#FFFFFF' },
});
