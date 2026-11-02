import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Relato } from '../types';
import { useAuth } from '../context/AuthContext';
import { listarMisRelatos } from '../services/storyService';
import { listarBorradoresRelato, borrarBorradorRelato, BorradorRelato } from '../services/storyDrafts';

type Props = NativeStackScreenProps<RootStackParamList, 'P30_MyStories'>;

const ETIQUETA: Record<string, { texto: string; color: string }> = {
  EN_REVISION: { texto: 'En revisión', color: '#B45309' },
  PUBLICADA: { texto: 'Publicada', color: '#059669' },
  OCULTA: { texto: 'Ocultada', color: '#DC2626' },
};

export const P30_MyStoriesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const uid = user?.uid ?? 'anonimo';
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [borradores, setBorradores] = useState<BorradorRelato[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [r, b] = await Promise.all([listarMisRelatos(uid), listarBorradoresRelato()]);
    setRelatos(r);
    setBorradores(b);
    setLoading(false);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const borrarBorrador = async (id: string) => {
    await borrarBorradorRelato(id);
    await cargar();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mis relatos</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : (
          <>
            {borradores.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Borradores</Text>
                {borradores.map((b) => (
                  <View key={b.id} style={styles.draftCard}>
                    <View style={styles.draftInfo}>
                      <Text style={styles.draftTitulo}>{b.titulo || '(Sin título)'}</Text>
                      <Text style={styles.draftCategoria}>{b.categoria || 'Sin categoría'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.resumeBtn}
                      onPress={() => navigation.navigate('P29_CreateStory', { draftId: b.id })}
                    >
                      <Text style={styles.resumeText}>Retomar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => borrarBorrador(b.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Relatos enviados</Text>
            {relatos.length === 0 && borradores.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="newspaper-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyText}>Todavía no compartiste relatos</Text>
              </View>
            ) : relatos.length === 0 ? (
              <Text style={styles.emptyText}>No enviaste relatos todavía.</Text>
            ) : (
              relatos.map((r) => {
                const estado = ETIQUETA[r.estado] ?? ETIQUETA.EN_REVISION;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.card}
                    onPress={() => {
                      if (r.estado === 'PUBLICADA') {
                        navigation.navigate('P28_StoryDetail', { relato: r });
                      } else {
                        Alert.alert(estado.texto, r.notaModeracion ?? 'Tu relato está en revisión.');
                      }
                    }}
                  >
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitulo} numberOfLines={1}>{r.titulo}</Text>
                      <View style={[styles.badge, { backgroundColor: estado.color }]}>
                        <Text style={styles.badgeText}>{estado.texto}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardCat}>{r.categoria}</Text>
                    <Text style={styles.cardFecha}>{new Date(r.creadoEn).toLocaleDateString('es-AR')}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>
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
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
  },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  draftInfo: { flex: 1 },
  draftTitulo: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  draftCategoria: { fontSize: 11, color: '#64748B', marginTop: 2 },
  resumeBtn: { backgroundColor: '#0F172A', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  resumeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitulo: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0F172A' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  cardCat: { fontSize: 12, color: '#475569', marginTop: 4 },
  cardFecha: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
