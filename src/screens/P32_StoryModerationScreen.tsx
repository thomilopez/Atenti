import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Relato } from '../types';
import { useAuth } from '../context/AuthContext';
import { listarPendientes, aprobarRelato, ocultarRelato } from '../services/storyModerationService';

type Props = NativeStackScreenProps<RootStackParamList, 'P32_StoryModeration'>;

export const P32_StoryModerationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const actorId = user?.uid ?? 'admin_demo';
  const [pendientes, setPendientes] = useState<Relato[]>([]);
  const [loading, setLoading] = useState(true);
  const [ocultando, setOcultando] = useState<Relato | null>(null);
  const [nota, setNota] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setPendientes(await listarPendientes());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleAprobar = async (relato: Relato) => {
    await aprobarRelato(relato.id, actorId);
    await cargar();
  };

  const handleOcultar = async () => {
    if (!ocultando) return;
    if (!nota.trim()) {
      Alert.alert('Nota requerida', 'Ingresá el motivo para ocultar el relato.');
      return;
    }
    await ocultarRelato(ocultando.id, actorId, nota.trim());
    setOcultando(null);
    setNota('');
    await cargar();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Moderar relatos</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : pendientes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay relatos pendientes de revisión</Text>
          </View>
        ) : (
          pendientes.map((r) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.categoria}>{r.categoria}</Text>
              <Text style={styles.titulo}>{r.titulo}</Text>
              <Text style={styles.modo}>{r.modusOperandi}</Text>
              {r.senalesDeAlerta.length > 0 && (
                <Text style={styles.senales}>
                  Señales: {r.senalesDeAlerta.join(' · ')}
                </Text>
              )}
              {r.identificadores.length > 0 && (
                <Text style={styles.ids}>
                  Identificadores: {r.identificadores.map((i) => `[${i.tipo}] ${i.valor}`).join(', ')}
                </Text>
              )}
              <Text style={styles.rol}>
                {r.fueVictima ? 'Víctima' : 'Testigo'} · {new Date(r.creadoEn).toLocaleDateString('es-AR')}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.aprobarBtn} onPress={() => handleAprobar(r)}>
                  <Text style={styles.aprobarText}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ocultarBtn} onPress={() => setOcultando(r)}>
                  <Text style={styles.ocultarText}>Ocultar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={Boolean(ocultando)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ocultar relato</Text>
            <TextInput
              style={styles.notaInput}
              placeholder="Motivo de la moderación"
              placeholderTextColor="#94A3B8"
              value={nota}
              onChangeText={setNota}
              multiline
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleOcultar}>
              <Text style={styles.confirmText}>Confirmar ocultamiento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setOcultando(null)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoria: { fontSize: 11, fontWeight: '800', color: '#B45309', textTransform: 'uppercase' },
  titulo: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  modo: { fontSize: 13, color: '#334155', lineHeight: 19, marginTop: 6 },
  senales: { fontSize: 12, color: '#16A34A', marginTop: 6 },
  ids: { fontSize: 12, color: '#475569', marginTop: 4 },
  rol: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  aprobarBtn: { flex: 1, backgroundColor: '#000000', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  aprobarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  ocultarBtn: { flex: 1, borderWidth: 1, borderColor: '#DC2626', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  ocultarText: { color: '#DC2626', fontSize: 13, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
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
    marginBottom: 14,
  },
  confirmBtn: { backgroundColor: '#DC2626', borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  confirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  cancelBtn: { marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  cancelText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
});
