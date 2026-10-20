import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { resolverDisputa } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'P15_AdminDispute'>;

export const P15_AdminDisputeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { incident } = route.params;
  const { user } = useAuth();
  const [nota, setNota] = useState('');
  const [procesando, setProcesando] = useState<'MANTENER' | 'RETIRAR' | null>(null);

  const resolver = async (decision: 'MANTENER' | 'RETIRAR') => {
    if (decision === 'RETIRAR' && !nota.trim()) {
      Alert.alert('Nota requerida', 'Para retirar la denuncia tenés que ingresar una nota.');
      return;
    }
    setProcesando(decision);
    try {
      await resolverDisputa({
        denunciaId: incident.id,
        decision,
        nota,
        actorId: user?.uid ?? 'admin_demo',
      });
      Alert.alert(
        'Resolución aplicada',
        decision === 'MANTENER'
          ? 'La denuncia vuelve a estar publicada.'
          : 'La denuncia fue retirada y marcada como resuelta.'
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo resolver la disputa.');
    } finally {
      setProcesando(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Resolver disputa</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.code}>{incident.trackingCode}</Text>
          <Text style={styles.title}>{incident.title}</Text>
          <Text style={styles.category}>{incident.category}</Text>
          <Text style={styles.score}>Credibilidad: {incident.credibilityScore}%</Text>
          <Text style={styles.story}>{incident.story}</Text>
          <TouchableOpacity
            style={styles.auditLink}
            onPress={() =>
              navigation.navigate('P18_AdminAudit', { incidentId: incident.id })
            }
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#3730A3" />
            <Text style={styles.auditLinkText}>Ver auditoría completa</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nota de moderación</Text>
        <TextInput
          style={styles.notaInput}
          placeholder="Motivo de la decisión"
          placeholderTextColor="#94A3B8"
          value={nota}
          onChangeText={setNota}
          multiline
        />

        <TouchableOpacity
          style={[styles.keepBtn, procesando && styles.disabled]}
          onPress={() => resolver('MANTENER')}
          disabled={Boolean(procesando)}
        >
          {procesando === 'MANTENER' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.keepBtnText}>Mantener publicada</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.withdrawBtn, procesando && styles.disabled]}
          onPress={() => resolver('RETIRAR')}
          disabled={Boolean(procesando)}
        >
          {procesando === 'RETIRAR' ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.withdrawBtnText}>Retirar denuncia</Text>
          )}
        </TouchableOpacity>
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
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  code: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  title: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  category: { fontSize: 12, color: '#475569', marginTop: 2 },
  score: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginTop: 8 },
  story: { fontSize: 13, color: '#334155', lineHeight: 20, marginTop: 10 },
  auditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  auditLinkText: { fontSize: 12, fontWeight: '700', color: '#3730A3' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  notaInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  keepBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  keepBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  withdrawBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  withdrawBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
