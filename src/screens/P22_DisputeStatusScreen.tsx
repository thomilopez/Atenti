import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  Impugnacion,
  obtenerImpugnacionPorDenuncia,
  escalarImpugnacionesVencidas,
  responderImpugnacion,
  formatearRestante,
  estaVencida,
} from '../services/impugnationService';

type Props = NativeStackScreenProps<RootStackParamList, 'P22_DisputeStatus'>;

const ETIQUETA: Record<string, string> = {
  PENDIENTE: 'Pendiente de respuesta',
  RESPONDIDA: 'Respondida',
  ESCALADA: 'Escalada a moderación',
  RESUELTA: 'Resuelta',
};

export const P22_DisputeStatusScreen: React.FC<Props> = ({ route, navigation }) => {
  const { denunciaId } = route.params;
  const [impugnacion, setImpugnacion] = useState<Impugnacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ahora, setAhora] = useState(Date.now());

  const cargar = useCallback(async () => {
    await escalarImpugnacionesVencidas();
    const imp = await obtenerImpugnacionPorDenuncia(denunciaId);
    setImpugnacion(imp);
    setLoading(false);
  }, [denunciaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    const interval = setInterval(() => setAhora(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleResponder = async () => {
    if (!respuesta.trim()) {
      Alert.alert('Respuesta vacía', 'Escribí tu respuesta antes de enviarla.');
      return;
    }
    setEnviando(true);
    try {
      await responderImpugnacion(denunciaId, respuesta);
      setEnviando(false);
      setRespuesta('');
      await cargar();
      Alert.alert('Respuesta enviada', 'Tu respuesta quedó registrada.');
    } catch (e: any) {
      setEnviando(false);
      Alert.alert('Error', e?.message ?? 'No se pudo enviar la respuesta.');
    }
  };

  const vencida = impugnacion ? estaVencida(impugnacion.deadline, ahora) : false;
  const resuelta = impugnacion?.estado === 'RESUELTA';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Estado de la disputa</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : !impugnacion ? (
          <View style={styles.empty}>
            <Ionicons name="shield-checkmark-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>Esta denuncia no tiene una impugnación.</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.code}>{impugnacion.codigo}</Text>
              <View style={styles.stateRow}>
                <Text style={styles.stateLabel}>Estado:</Text>
                <Text style={styles.stateValue}>
                  {ETIQUETA[impugnacion.estado] ?? impugnacion.estado}
                </Text>
              </View>
              <Text style={styles.deadline}>
                {resuelta
                  ? 'Disputa cerrada'
                  : vencida
                  ? 'Plazo vencido'
                  : formatearRestante(impugnacion.deadline, ahora)}
              </Text>
              <Text style={styles.descargoLabel}>Descargo del impugnante</Text>
              <Text style={styles.descargo}>{impugnacion.descargo}</Text>
              {impugnacion.resultado && (
                <Text style={styles.resultado}>
                  Resultado: {impugnacion.resultado === 'PUBLICADA' ? 'Denuncia mantenida' : 'Denuncia retirada'}
                </Text>
              )}
            </View>

            {!resuelta && !vencida && (
              <>
                <Text style={styles.label}>Tu respuesta</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Explicá tu versión de los hechos..."
                  placeholderTextColor="#94A3B8"
                  value={respuesta}
                  onChangeText={setRespuesta}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.submitBtn, enviando && styles.disabled]}
                  onPress={handleResponder}
                  disabled={enviando}
                >
                  {enviando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitText}>Responder</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {!resuelta && vencida && (
              <View style={styles.escalatedBox}>
                <Ionicons name="alert-circle-outline" size={20} color="#92400E" />
                <Text style={styles.escalatedText}>
                  El plazo de 72hs venció. El caso fue escalado a moderación.
                </Text>
              </View>
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
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  code: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  stateRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  stateLabel: { fontSize: 13, color: '#64748B' },
  stateValue: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  deadline: { fontSize: 14, fontWeight: '800', color: '#B45309', marginTop: 8 },
  descargoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
    textTransform: 'uppercase',
  },
  descargo: { fontSize: 13, color: '#334155', lineHeight: 19, marginTop: 4 },
  resultado: { fontSize: 12, fontWeight: '700', color: '#059669', marginTop: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  escalatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  escalatedText: { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
