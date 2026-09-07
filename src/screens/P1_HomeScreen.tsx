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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdentifierType, IncidentReport, RootStackParamList } from '../types';
import { getIncidents } from '../services/firebase';
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
  const [showDraftsModal, setShowDraftsModal] = useState(false);

  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await getIncidents(selectedChip || undefined, searchQuery);
      setIncidents(data);
    };
    fetchIncidents();
  }, [selectedChip, searchQuery]);

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
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

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
        </View>
      </View>

      {/* Cuerpo: Un rectángulo gris grande ocupando el 70% de la pantalla (representa el mapa) */}
      <View style={styles.mapContainer}>
        <MapViewWrapper
          incidents={incidents}
          onMarkerPress={handleMarkerPress}
        />

        {/* Botón Flotante (FAB): Un círculo oscuro abajo a la derecha con un "+" */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.88}
          onPress={handleFabPress}
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
