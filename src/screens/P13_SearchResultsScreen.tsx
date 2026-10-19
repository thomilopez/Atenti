import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdentifierType, IncidentCategory, IncidentReport, RootStackParamList } from '../types';
import { buscarIncidentesPaginados } from '../services/firebase';
import { VeracityBar } from '../components/VeracityBar';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P13_SearchResults'>;

const IDENTIFIER_TYPES: (IdentifierType | 'Todas')[] = ['Todas', 'Alias', 'CBU', 'Tel', 'Local'];

const CATEGORIAS: (IncidentCategory | 'Todas')[] = [
  'Todas',
  'Estafa Bancaria',
  'Phishing / Suplantación',
  'Comercio Virtual Falso',
  'Local Físico Ilícito',
  'Clonación de Identidad',
];

const SCORES = [0, 40, 60, 75];

const POR_PAGINA = 5;

export const P13_SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [filterType, setFilterType] = useState<IdentifierType | 'Todas'>(
    route.params?.initialType ?? 'Todas'
  );
  const [categoria, setCategoria] = useState<IncidentCategory | 'Todas'>('Todas');
  const [scoreMinimo, setScoreMinimo] = useState(0);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [items, setItems] = useState<IncidentReport[]>([]);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(
    async (paginaSolicitada: number) => {
      setLoading(true);
      const resultado = await buscarIncidentesPaginados({
        searchQuery: query,
        filterType: filterType === 'Todas' ? undefined : filterType,
        categoria: categoria === 'Todas' ? undefined : categoria,
        scoreMinimo: scoreMinimo || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
        pagina: paginaSolicitada,
        porPagina: POR_PAGINA,
      });
      setItems((prev) =>
        paginaSolicitada === 1 ? resultado.items : [...prev, ...resultado.items]
      );
      setPagina(resultado.pagina);
      setHayMas(resultado.hayMas);
      setTotal(resultado.total);
      setLoading(false);
    },
    [query, filterType, categoria, scoreMinimo, desde, hasta]
  );

  useEffect(() => {
    cargar(1);
  }, [cargar]);

  const cargarMas = () => {
    if (!loading && hayMas) cargar(pagina + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Resultados</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Alias, CBU, teléfono o local"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            <View style={styles.chipsRow}>
              {IDENTIFIER_TYPES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={filterType === t}
                  onPress={() => setFilterType(t)}
                />
              ))}
            </View>

            <View style={styles.chipsRow}>
              {SCORES.map((s) => (
                <Chip
                  key={s}
                  label={s === 0 ? 'Score: todos' : `Score ≥ ${s}`}
                  active={scoreMinimo === s}
                  onPress={() => setScoreMinimo(s)}
                />
              ))}
            </View>

            <View style={styles.chipsRow}>
              {CATEGORIAS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={categoria === c}
                  onPress={() => setCategoria(c)}
                />
              ))}
            </View>

            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                placeholder="Desde (YYYY-MM-DD)"
                placeholderTextColor="#94A3B8"
                value={desde}
                onChangeText={setDesde}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="Hasta (YYYY-MM-DD)"
                placeholderTextColor="#94A3B8"
                value={hasta}
                onChangeText={setHasta}
              />
            </View>

            <Text style={styles.totalText}>
              {total} resultado{total === 1 ? '' : 's'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('P2_ReportDetail', { incident: item })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>{item.credibilityScore}%</Text>
              </View>
            </View>
            <Text style={styles.cardCategory}>{item.category}</Text>
            <VeracityBar percentage={item.credibilityScore} height={10} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          loading ? <ActivityIndicator style={styles.loading} color="#0F172A" /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Sin resultados</Text>
            </View>
          ) : null
        }
      />

      <BottomNavBar activeTab="home" />
    </SafeAreaView>
  );
};

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    margin: 16,
    marginBottom: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  totalText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  scorePill: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scorePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3730A3',
  },
  cardCategory: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  loading: {
    paddingVertical: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
