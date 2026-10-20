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
import { IncidentReport, RootStackParamList } from '../types';
import {
  listarDenunciasEnDisputa,
  calcularMetricas,
  generarDatasetAnonimizado,
  MetricasAdmin,
} from '../services/adminService';
import { exportarDatasetCSV } from '../services/exportService';
import { useAuth } from '../context/AuthContext';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P14_AdminDashboard'>;

export const P14_AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [disputas, setDisputas] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [m, d] = await Promise.all([calcularMetricas(), listarDenunciasEnDisputa()]);
    setMetricas(m);
    setDisputas(d);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleExportar = async () => {
    setExportando(true);
    try {
      const dataset = await generarDatasetAnonimizado();
      await exportarDatasetCSV(dataset);
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el dataset anonimizado.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Panel de administración</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading || !metricas ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : (
          <>
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{metricas.total}</Text>
                <Text style={styles.kpiLabel}>Denuncias</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{metricas.promedioScore}%</Text>
                <Text style={styles.kpiLabel}>Score prom.</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{metricas.enDisputa}</Text>
                <Text style={styles.kpiLabel}>En disputa</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('P16_AdminCategories')}
              >
                <Ionicons name="pricetags-outline" size={18} color="#0F172A" />
                <Text style={styles.actionText}>Categorías</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('P17_AdminUsers')}
              >
                <Ionicons name="people-outline" size={18} color="#0F172A" />
                <Text style={styles.actionText}>Usuarios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleExportar}
                disabled={exportando}
              >
                <Ionicons name="download-outline" size={18} color="#0F172A" />
                <Text style={styles.actionText}>
                  {exportando ? 'Generando...' : 'Dataset'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.auditBtn}
              onPress={() => navigation.navigate('P25_AuditLog')}
            >
              <Ionicons name="document-text-outline" size={16} color="#0F172A" />
              <Text style={styles.actionText}>Log de auditoría</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Denuncias en disputa</Text>
            {disputas.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="checkmark-done-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyText}>No hay disputas pendientes</Text>
              </View>
            ) : (
              disputas.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.disputeCard}
                  onPress={() => navigation.navigate('P15_AdminDispute', { incident: d })}
                >
                  <View style={styles.disputeTop}>
                    <Text style={styles.disputeCode}>{d.trackingCode}</Text>
                    <Text style={styles.disputeScore}>{d.credibilityScore}%</Text>
                  </View>
                  <Text style={styles.disputeTitle}>{d.title}</Text>
                  <Text style={styles.disputeCategory}>
                    {d.category} · {new Date(d.audit.createdAt).toLocaleDateString('es-AR')}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.sectionTitle}>Métricas por día</Text>
            <View style={styles.chartCard}>
              {metricas.porDia.map((dia) => (
                <View key={dia.fecha} style={styles.chartRow}>
                  <Text style={styles.chartDay}>{dia.fecha.slice(5)}</Text>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        { width: `${Math.min(100, dia.cantidad * 20)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartValue}>{dia.cantidad}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <BottomNavBar activeTab="profile" />
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
  content: { padding: 16, paddingBottom: 24 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  auditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  disputeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disputeTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  disputeCode: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  disputeScore: { fontSize: 12, fontWeight: '800', color: '#3730A3' },
  disputeTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  disputeCategory: { fontSize: 12, color: '#475569', marginTop: 2 },
  chartCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  chartDay: { width: 44, fontSize: 10, color: '#64748B' },
  chartTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartFill: { height: '100%', backgroundColor: '#0F172A' },
  chartValue: { width: 20, fontSize: 10, color: '#0F172A', textAlign: 'right' },
});
