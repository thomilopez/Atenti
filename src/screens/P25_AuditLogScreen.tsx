import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { listarAuditLogs, AuditEvent } from '../services/auditService';

type Props = NativeStackScreenProps<RootStackParamList, 'P25_AuditLog'>;

export const P25_AuditLogScreen: React.FC<Props> = ({ navigation }) => {
  const [eventos, setEventos] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      setLoading(true);
      listarAuditLogs().then((data) => {
        if (activo) {
          setEventos(data);
          setLoading(false);
        }
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Log de auditoría</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
      ) : eventos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={44} color="#CBD5E1" />
          <Text style={styles.emptyText}>No hay eventos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.accion}>{item.accion}</Text>
                <Text style={styles.fecha}>
                  {new Date(item.timestamp).toLocaleString('es-AR')}
                </Text>
              </View>
              <Text style={styles.row}>UID: {item.uid || '—'}</Text>
              <Text style={styles.row}>Email: {item.email || '—'}</Text>
              <Text style={styles.row}>IP: {item.ip || '—'}</Text>
              {item.denunciaId && <Text style={styles.row}>Denuncia: {item.denunciaId}</Text>}
            </View>
          )}
        />
      )}
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
  list: { padding: 16, paddingBottom: 24 },
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
    marginBottom: 6,
  },
  accion: { fontSize: 11, fontWeight: '800', color: '#3730A3' },
  fecha: { fontSize: 10, color: '#94A3B8' },
  row: { fontSize: 12, color: '#334155', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
