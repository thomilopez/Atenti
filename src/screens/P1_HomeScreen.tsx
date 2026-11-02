import React, { useCallback, useEffect, useState } from 'react';
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
import { sugerirIdentificadores, sugerirCorreccion } from '../services/autocompleteService';
import {
  RecentSearch,
  agregarReciente,
  limpiarRecientes,
  listarRecientes,
} from '../services/recentSearches';
import { calcularTendencias } from '../services/trends';
import { MapViewWrapper } from '../components/MapViewWrapper';
import { useAuth } from '../context/AuthContext';
import { DraftsListModal } from '../components/DraftsListModal';
import { useReportFlow } from '../context/ReportFlowContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { Skeleton } from '../components/Skeleton';
import { HelpModal } from '../components/HelpModal';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<RootStackParamList, 'P1_Home'>;

const FILTER_CHIPS: { label: string; type: IdentifierType }[] = [
  { label: 'Alias', type: 'Alias' },
  { label: 'CBU', type: 'CBU' },
  { label: 'CUIT', type: 'CUIT' },
  { label: 'Tel', type: 'Tel' },
  { label: 'Local', type: 'Local' },
];

export const P1_HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { loadFromDraft } = useReportFlow();
  const { gutter, previewMapHeight, contentMaxWidth } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState<IdentifierType | null>(null);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [todosIncidentes, setTodosIncidentes] = useState<IncidentReport[]>([]);
  const [recientes, setRecientes] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    Promise.all([getIncidents(), listarRecientes()])
      .then(([data, recents]) => {
        setTodosIncidentes(data);
        setRecientes(recents);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getIncidents(selectedChip || undefined, searchQuery)
      .then(setIncidents)
      .catch(() => {});
  }, [selectedChip, searchQuery]);

  const sugerencias = sugerirIdentificadores(searchQuery, todosIncidentes);
  const correccion =
    searchQuery.trim().length >= 3 && incidents.length === 0
      ? sugerirCorreccion(searchQuery, todosIncidentes)
      : null;
  const tendencias = calcularTendencias(todosIncidentes);

  const abrirBusqueda = useCallback(
    async (value: string, type: IdentifierType) => {
      const limpio = value.trim();
      if (limpio) {
        const actualizados = await agregarReciente({ value: limpio, type });
        setRecientes(actualizados);
      }
      navigation.navigate('P13_SearchResults', {
        initialQuery: limpio,
        initialType: type,
      });
    },
    [navigation]
  );

  const handleBuscar = () => {
    const type = selectedChip ?? undefined;
    if (!searchQuery.trim() && !type) {
      Alert.alert(
        'Buscá un identificador',
        'Ingresá un Alias, CBU, CUIT, teléfono o local para empezar.'
      );
      return;
    }
    if (searchQuery.trim() && type) {
      abrirBusqueda(searchQuery, type);
    } else {
      navigation.navigate('P13_SearchResults', {
        initialQuery: searchQuery,
        initialType: type,
      });
    }
  };

  const handleLimpiarRecientes = async () => {
    await limpiarRecientes();
    setRecientes([]);
  };

  const handleFabPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('P3_LegalAuth', { returnTo: 'P4_CreateReport' });
    } else {
      navigation.navigate('P4_CreateReport');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMini}>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Atenti</Text>
          <View style={styles.brandSpacer} />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('P19_NotificationCenter')}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowDraftsModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Borradores"
          >
            <Ionicons name="folder-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: gutter, maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Buscador protagonico */}
        <View style={styles.searchHero}>
          <Text style={styles.heroTitle}>¿A quién querés chequear?</Text>
          <Text style={styles.heroSubtitle}>
            Alias, CBU, CUIT, teléfono o local
          </Text>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Ej: ju.mp, 0000003100084729103829..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleBuscar}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterChipsRow}>
            {FILTER_CHIPS.map((chip) => {
              const isActive = selectedChip === chip.type;
              return (
                <TouchableOpacity
                  key={chip.type}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedChip(isActive ? null : chip.type)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar} activeOpacity={0.9}>
            <Text style={styles.searchBtnText}>Buscar</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {sugerencias.length > 0 && (
          <View style={styles.suggestionsBox}>
            {sugerencias.map((s) => (
              <TouchableOpacity
                key={`${s.type}:${s.value}`}
                style={styles.suggestionItem}
                onPress={() => abrirBusqueda(s.value, s.type)}
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
            onPress={() => abrirBusqueda(correccion.value, correccion.type)}
          >
            <Text style={styles.correctionText}>
              Quiso decir:{' '}
              <Text style={styles.correctionValue}>
                [{correccion.type}] {correccion.value}
              </Text>
            </Text>
          </TouchableOpacity>
        )}

        {recientes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recientes</Text>
              <TouchableOpacity onPress={handleLimpiarRecientes}>
                <Text style={styles.sectionAction}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {recientes.map((r) => (
                <TouchableOpacity
                  key={`${r.type}:${r.value}`}
                  style={styles.recentChip}
                  onPress={() => abrirBusqueda(r.value, r.type)}
                >
                  <Ionicons name="time-outline" size={12} color="#475569" />
                  <Text style={styles.recentChipText} numberOfLines={1}>
                    [{r.type}] {r.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {tendencias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendencias</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {tendencias.map((t) => (
                <TouchableOpacity
                  key={`${t.type}:${t.value}`}
                  style={styles.trendChip}
                  onPress={() => abrirBusqueda(t.value, t.type)}
                >
                  <Ionicons name="trending-up" size={12} color="#B45309" />
                  <Text style={styles.trendChipText} numberOfLines={1}>
                    {t.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Preview del mapa */}
        <View style={styles.mapCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mapa de denuncias</Text>
            <TouchableOpacity
              style={styles.mapLink}
              onPress={() => navigation.navigate('P31_FullMap')}
            >
              <Text style={styles.mapLinkText}>Ver mapa completo</Text>
              <Ionicons name="expand-outline" size={14} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={[styles.mapPreview, { height: previewMapHeight }]}>
            {loading ? (
              <View style={styles.skeletonStack}>
                <Skeleton height={previewMapHeight - 16} radius={10} />
              </View>
            ) : (
              <MapViewWrapper
                incidents={incidents}
                interactive={false}
                onMarkerPress={(incident) =>
                  navigation.navigate('P2_ReportDetail', { incident })
                }
              />
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.helpBtn} onPress={() => setShowHelp(true)}>
          <Ionicons name="help-circle-outline" size={16} color="#475569" />
          <Text style={styles.helpBtnText}>¿Cómo funciona?</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.88}
        onPress={handleFabPress}
        accessibilityRole="button"
        accessibilityLabel="Crear reporte"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomNavBar activeTab="home" />

      <DraftsListModal
        visible={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
        onSelectDraft={(draft) => {
          loadFromDraft(draft);
          navigation.navigate('P4_CreateReport');
        }}
      />

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  brandMini: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  brandSpacer: { flex: 1 },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: { paddingTop: 8, paddingBottom: 24 },
  searchHero: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 19, fontWeight: '900', color: '#0F172A' },
  heroSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 12,
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 8,
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
  suggestionText: { fontSize: 13, color: '#0F172A', fontWeight: '600', flex: 1 },
  correctionRow: { paddingVertical: 6, paddingHorizontal: 4, marginBottom: 4 },
  correctionText: { fontSize: 12, color: '#64748B' },
  correctionValue: { color: '#0F172A', fontWeight: '800' },
  section: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: { fontSize: 11, fontWeight: '700', color: '#3730A3' },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 200,
  },
  recentChipText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 200,
  },
  trendChipText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  mapCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapLinkText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  mapPreview: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  skeletonStack: { padding: 8 },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  helpBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  fab: {
    position: 'absolute',
    bottom: 72,
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
