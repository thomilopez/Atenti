import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { obtenerAuditoria } from '../services/adminService';

type Props = NativeStackScreenProps<RootStackParamList, 'P18_AdminAudit'>;

export const P18_AdminAuditScreen: React.FC<Props> = ({ route, navigation }) => {
  const { incidentId } = route.params;
  const [data, setData] = useState<Awaited<ReturnType<typeof obtenerAuditoria>> | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    setData(await obtenerAuditoria(incidentId));
    setLoading(false);
  }, [incidentId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const reporte = data?.reporte ?? null;
  const historial = data?.historial ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Auditoría</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : !reporte ? (
          <Text style={styles.emptyText}>No se encontró la denuncia.</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Datos del emisor</Text>
            <View style={styles.card}>
              <Row label="Código" value={reporte.trackingCode} />
              <Row label="UID" value={reporte.audit.uid} />
              <Row label="Email" value={reporte.audit.userEmail} />
              <Row label="IP" value={reporte.audit.clientIp} />
              <Row label="Plataforma" value={reporte.audit.platform} />
              <Row label="Fecha" value={new Date(reporte.audit.createdAt).toLocaleString('es-AR')} />
            </View>

            <Text style={styles.sectionTitle}>Denuncia</Text>
            <View style={styles.card}>
              <Row label="Objetivo" value={reporte.title} />
              <Row label="Categoría" value={reporte.category} />
              <Row label="Estado" value={reporte.estadoActual ?? 'PUBLICADA'} />
              <Row label="Score" value={`${reporte.credibilityScore}%`} />
              <Row label="Relato" value={reporte.story} />
            </View>

            <Text style={styles.sectionTitle}>Evidencias originales</Text>
            <View style={styles.card}>
              {reporte.evidences.length === 0 ? (
                <Text style={styles.emptyText}>Sin evidencias.</Text>
              ) : (
                reporte.evidences.map((ev) => (
                  <Row key={ev.id} label={ev.label} value={ev.uri} />
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Historial de estados</Text>
            <View style={styles.card}>
              {historial.length === 0 ? (
                <Text style={styles.emptyText}>Sin eventos registrados en memoria.</Text>
              ) : (
                historial.map((h) => (
                  <Row
                    key={h.id}
                    label={`${h.origen ?? 'inicio'} → ${h.destino}`}
                    value={`${new Date(h.fecha).toLocaleString('es-AR')}${h.nota ? ` · ${h.nota}` : ''}`}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
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
  backBtn: { padding: 4 },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  content: { padding: 16, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: { fontSize: 12, color: '#64748B', flex: 1 },
  rowValue: { fontSize: 12, color: '#0F172A', fontWeight: '700', flex: 1.4, textAlign: 'right' },
  emptyText: { fontSize: 12, color: '#94A3B8' },
});
