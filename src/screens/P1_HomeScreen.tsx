import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdentifierType, IncidentReport, RootStackParamList } from '../types';
import { getIncidents } from '../services/firebase';
import { obtenerUbicacionActual } from '../services/locationService';
import { sugerirIdentificadores, sugerirCorreccion } from '../services/autocompleteService';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { useAuth } from '../context/AuthContext';
import { DraftsListModal } from '../components/DraftsListModal';
import { useReportFlow } from '../context/ReportFlowContext';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P1_Home'>;

const FILTER_CHIPS: { label: string; type: IdentifierType }[] = [
  { label: 'Alias', type: 'Alias' },
  { label: 'CBU', type: 'CBU' },
  { label: 'Tel', type: 'Tel' },
  { label: 'Local', type: 'Local' },
];

export const P1_HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { loadFromDraft } = useReportFlow();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState<IdentifierType | null>(null);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [todosIncidentes, setTodosIncidentes] = useState<IncidentReport[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [radioKm, setRadioKm] = useState<number | undefined>(undefined);
  const [centro, setCentro] = useState({ latitude: -34.6037, longitude: -58.3816 });

  useEffect(() => {
    getIncidents().then(setTodosIncidentes).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await getIncidents(selectedChip || undefined, searchQuery);
      setIncidents(data);
    };
    fetchIncidents();
  }, [selectedChip, searchQuery]);

  const sugerencias = sugerirIdentificadores(searchQuery, todosIncidentes);
  const correccion =
    searchQuery.trim().length >= 3 && incidents.length === 0
      ? sugerirCorreccion(searchQuery, todosIncidentes)
      : null;

  const handleFabPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('P3_LegalAuth', { returnTo: 'P4_CreateReport' });
    } else {
      navigation.navigate('P4_CreateReport');
    }
  };

  const handleMarkerPress = (incident: IncidentReport) => {
    navigation.navigate('P2_ReportDetail', { incident });
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Cabecera: Barra de búsqueda unificada (rectángulo largo con ícono de lupa) */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por Alias, CBU, Teléfono o Local..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            onSubmitEditing={() =>
              navigation.navigate('P13_SearchResults', {
                initialQuery: searchQuery,
                initialType: selectedChip ?? undefined,
              })
            }
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {sugerencias.length > 0 && (
          <View style={styles.suggestionsBox}>
            {sugerencias.map((s) => (
              <TouchableOpacity
                key={`${s.type}:${s.value}`}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(s.value);
                  setSelectedChip(s.type);
                }}
              >
                <Ionicons name="search-outline" size={14} color="#64748B" />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  [{s.type}] {s.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {correccion && (
          <TouchableOpacity
            style={styles.correctionRow}
            onPress={() => {
              setSearchQuery(correccion.value);
              setSelectedChip(correccion.type);
            }}
          >
            <Text style={styles.correctionText}>
              Quiso decir:{' '}
              <Text style={styles.correctionValue}>
                [{correccion.type}] {correccion.value}
              </Text>
            </Text>
          </TouchableOpacity>
        )}

        {/* Filtros: 4 rectángulos pequeños redondeados (Chips) debajo del buscador */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTER_CHIPS.map((chip) => {
              const isActive = selectedChip === chip.type;
              return (
                <TouchableOpacity
                  key={chip.type}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedChip(isActive ? null : chip.type)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    [{chip.label}]
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.draftsShortcut}
            onPress={() => setShowDraftsModal(true)}
          >
            <Ionicons name="folder-outline" size={18} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.draftsShortcut}
            onPress={() => navigation.navigate('P19_NotificationCenter')}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cuerpo: Un rectángulo gris grande ocupando el 70% de la pantalla (representa el mapa) */}
      <View style={styles.mapContainer}>
        <MapViewWrapper
          incidents={incidents}
          onMarkerPress={handleMarkerPress}
          centerLatitude={centro.latitude}
          centerLongitude={centro.longitude}
          showHeatmap={showHeatmap}
          radioKm={radioKm}
          radioCenter={centro}
        />

        {/* Controles de capas del mapa (RF-037, RF-039, RF-041) */}
        <View style={styles.mapLayersPanel}>
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

        {/* Botón Flotante (FAB): Un círculo oscuro abajo a la derecha con un "+" */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.88}
          onPress={handleFabPress}
          accessibilityRole="button"
          accessibilityLabel="Crear reporte"
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Barra de navegación inferior */}
      <BottomNavBar activeTab="home" />

      {/* Modal para ver borradores guardados en AsyncStorage */}
      <DraftsListModal
        visible={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8, // Rectángulo largo
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  correctionRow: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  correctionText: {
    fontSize: 12,
    color: '#64748B',
  },
  correctionValue: {
    color: '#0F172A',
    fontWeight: '800',
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  // 4 rectángulos pequeños redondeados (Chips)
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  draftsShortcut: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: 6,
  },
  // Rectángulo gris grande ocupando el 70% de la pantalla (representa el mapa)
  mapContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  mapLayersPanel: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
    zIndex: 20,
  },
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
  layerChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  layerChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  layerChipTextActive: {
    color: '#FFFFFF',
  },
  radioPanel: {
    position: 'absolute',
    bottom: 88,
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
  radioChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  radioChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  radioChipTextActive: {
    color: '#FFFFFF',
  },
  // Botón Flotante (FAB): Círculo oscuro abajo a la derecha con un "+"
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 30,
  },
});
