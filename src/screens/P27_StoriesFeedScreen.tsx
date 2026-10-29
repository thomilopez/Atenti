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
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Relato } from '../types';
import { listarRelatos } from '../services/storyService';
import { listarCategoriasActivas } from '../services/categoryService';
import { CategoriaTipo } from '../services/normalize';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P27_StoriesFeed'>;

export const P27_StoriesFeedScreen: React.FC<Props> = ({ navigation }) => {
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [categorias, setCategorias] = useState<CategoriaTipo[]>([]);
  const [query, setQuery] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [r, c] = await Promise.all([listarRelatos('PUBLICADA'), listarCategoriasActivas()]);
    setRelatos(r);
    setCategorias(c);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const iconoDe = (nombre: string) =>
    categorias.find((c) => c.nombre === nombre);

  const visibles = relatos.filter((r) => {
    if (categoriaFiltro !== 'Todas' && r.categoria !== categoriaFiltro) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        r.titulo.toLowerCase().includes(q) ||
        r.modusOperandi.toLowerCase().includes(q) ||
        r.senalesDeAlerta.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Historias de estafas</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('P29_CreateStory')}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color="#92400E" />
        <Text style={styles.disclaimerText}>
          Relatos compartidos por la comunidad. No son acusaciones formales.{' '}
          <Text
            style={styles.disclaimerLink}
            onPress={() => navigation.navigate('P33_CommunityGuidelines')}
          >
            Ver normas
          </Text>
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o señal de alerta"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.chipsRow}>
        <Chip label="Todas" active={categoriaFiltro === 'Todas'} onPress={() => setCategoriaFiltro('Todas')} />
        {categorias.slice(0, 8).map((c) => (
          <Chip
            key={c.id}
            label={c.nombre}
            active={categoriaFiltro === c.nombre}
            onPress={() => setCategoriaFiltro(c.nombre)}
          />
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyText}>Todavía no hay relatos publicados</Text>
            </View>
          }
          renderItem={({ item }) => {
            const cat = iconoDe(item.categoria);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('P28_StoryDetail', { relato: item })}
              >
                <View style={styles.cardTop}>
                  <Ionicons name={(cat?.icono ?? 'pricetag-outline') as any} size={16} color={cat?.color ?? '#0F172A'} />
                  <Text style={styles.cardCategoria}>{item.categoria}</Text>
                  <View style={styles.cardSpacer} />
                  <Text style={styles.cardFecha}>
                    {new Date(item.creadoEn).toLocaleDateString('es-AR')}
                  </Text>
                </View>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={styles.cardModo} numberOfLines={2}>
                  {item.modusOperandi}
                </Text>
                <View style={styles.cardFooter}>
                  <Ionicons name="checkmark-circle-outline" size={13} color="#16A34A" />
                  <Text style={styles.cardSenales}>{item.senalesDeAlerta.length} señales</Text>
                  <Text style={styles.cardCorrob}> · {item.corroboraciones} lo vieron</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <BottomNavBar activeTab="stories" />
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
  navTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  createBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disclaimerText: { flex: 1, fontSize: 11, color: '#92400E', lineHeight: 16 },
  disclaimerLink: { fontWeight: '800', textDecorationLine: 'underline' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  cardCategoria: { fontSize: 11, fontWeight: '800', color: '#475569' },
  cardSpacer: { flex: 1 },
  cardFecha: { fontSize: 10, color: '#94A3B8' },
  cardTitulo: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  cardModo: { fontSize: 12, color: '#334155', lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  cardSenales: { fontSize: 11, color: '#16A34A', fontWeight: '700' },
  cardCorrob: { fontSize: 11, color: '#64748B' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
