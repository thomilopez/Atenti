import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IncidentReport, RootStackParamList } from '../types';
import { getIncidents } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P10_MisDenuncias'>;

type FiltroEstado = 'TODAS' | 'PUBLICADA' | 'EN_DISPUTA' | 'RESUELTA';

const FILTROS: FiltroEstado[] = ['TODAS', 'PUBLICADA', 'EN_DISPUTA', 'RESUELTA'];

const ETIQUETA_ESTADO: Record<string, string> = {
  PUBLICADA: 'Publicada',
  EN_DISPUTA: 'En disputa',
  RESUELTA: 'Resuelta',
  RECIBIDA: 'Recibida',
};

export const P10_MisDenunciasScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [denuncias, setDenuncias] = useState<IncidentReport[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('TODAS');

  useEffect(() => {
    const cargar = async () => {
      // Mis Denuncias incluye EN_DISPUTA (no es la vista pública).
      const todas = await getIncidents(undefined, undefined, { incluirEnDisputa: true });
      setDenuncias(todas.filter((d) => !d.eliminada));
    };
    cargar();
  }, []);

  const propias = denuncias.filter((d) => d.audit.uid === user?.uid);
  // En modo demo el uid no coincide con la semilla: se muestra todo el listado.
  const base = propias.length > 0 ? propias : denuncias;

  const visibles =
    filtro === 'TODAS'
      ? base
      : base.filter((d) => (d.estadoActual ?? 'PUBLICADA') === filtro);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mis Denuncias</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.filters}>
        {FILTROS.map((f) => {
          const activo = filtro === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activo && styles.filterChipActive]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[styles.filterText, activo && styles.filterTextActive]}>
                {f === 'TODAS' ? 'Todas' : ETIQUETA_ESTADO[f] ?? f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {visibles.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="documents-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>No tenés denuncias en este estado</Text>
        </View>
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('P12_EditReport', { incident: item })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardCode}>{item.trackingCode}</Text>
                <View style={styles.stateBadge}>
                  <Text style={styles.stateText}>
                    {ETIQUETA_ESTADO[item.estadoActual ?? 'PUBLICADA'] ?? 'Publicada'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <BottomNavBar activeTab="report" />
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stateBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3730A3',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardCategory: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
