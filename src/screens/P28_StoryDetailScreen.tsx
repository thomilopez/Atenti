import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { corroborarRelato, registrarReporteContenido } from '../services/storyService';
import { listarCategoriasActivas } from '../services/categoryService';
import { CategoriaTipo } from '../services/normalize';
import {
  listarSuscripciones,
  seguirCategoria,
  dejarDeSeguirCategoria,
} from '../services/storySubscriptions';

type Props = NativeStackScreenProps<RootStackParamList, 'P28_StoryDetail'>;

export const P28_StoryDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { relato } = route.params;
  const { user } = useAuth();
  const uid = user?.uid ?? 'anonimo';

  const [categorias, setCategorias] = useState<CategoriaTipo[]>([]);
  const [corrob, setCorrob] = useState(relato.corroboraciones ?? 0);
  const [siguiendo, setSiguiendo] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    listarCategoriasActivas().then(setCategorias).catch(() => {});
    listarSuscripciones(uid).then((cats) => setSiguiendo(cats.includes(relato.categoria)));
  }, [uid, relato.categoria]);

  const cat = categorias.find((c) => c.nombre === relato.categoria);

  const handleCorroborar = async () => {
    const actualizado = await corroborarRelato(relato.id);
    if (actualizado) setCorrob(actualizado.corroboraciones ?? corrob + 1);
  };

  const handleSeguir = async () => {
    if (siguiendo) {
      await dejarDeSeguirCategoria(uid, relato.categoria);
      setSiguiendo(false);
    } else {
      await seguirCategoria(uid, relato.categoria);
      setSiguiendo(true);
    }
  };

  const handleCompartir = async () => {
    const mensaje = `Atenti - ${relato.titulo}\n${relato.modusOperandi}\nSeñales de alerta: ${relato.senalesDeAlerta.join(', ')}`;
    try {
      const url = `whatsapp://send?text=${encodeURIComponent(mensaje)}`;
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message: mensaje });
      }
    } catch {
      await Share.share({ message: mensaje });
    }
  };

  const handleReportar = async () => {
    if (!motivo.trim()) {
      Alert.alert('Motivo requerido', 'Contanos por qué reportás este relato.');
      return;
    }
    await registrarReporteContenido(relato.id, uid, motivo.trim());
    setReportModal(false);
    setMotivo('');
    Alert.alert('Reporte enviado', 'Gracias. Nuestro equipo lo va a revisar.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Relato</Text>
        <TouchableOpacity onPress={handleCompartir} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.catRow}>
            <Ionicons name={(cat?.icono ?? 'pricetag-outline') as any} size={16} color={cat?.color ?? '#0F172A'} />
            <Text style={styles.catText}>{relato.categoria}</Text>
            <Text style={styles.fecha}>{new Date(relato.creadoEn).toLocaleDateString('es-AR')}</Text>
          </View>
          <Text style={styles.titulo}>{relato.titulo}</Text>
          <Text style={styles.rol}>
            {relato.fueVictima ? 'Quien comparte fue víctima' : 'Quien comparte lo vio / se enteró'}
            {relato.fuente ? ` · Fuente: ${relato.fuente}` : ''}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Cómo funciona</Text>
        <Text style={styles.modo}>{relato.modusOperandi}</Text>

        {relato.senalesDeAlerta.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Señales de alerta</Text>
            {relato.senalesDeAlerta.map((s, i) => (
              <View key={i} style={styles.signalRow}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.signalText}>{s}</Text>
              </View>
            ))}
          </>
        )}

        {relato.identificadores.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Identificadores vinculados</Text>
            {relato.identificadores.map((id, i) => (
              <TouchableOpacity
                key={i}
                style={styles.idChip}
                onPress={() =>
                  navigation.navigate('P13_SearchResults', {
                    initialQuery: id.valor,
                    initialType: id.tipo,
                  })
                }
              >
                <Ionicons name="search-outline" size={14} color="#0F172A" />
                <Text style={styles.idChipText}>
                  [{id.tipo}] {id.valor}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {relato.links.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Enlaces</Text>
            {relato.links.map((l, i) => (
              <Text key={i} style={styles.link} numberOfLines={1}>
                {l}
              </Text>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.followBtn} onPress={handleSeguir}>
          <Ionicons name={siguiendo ? 'notifications' : 'notifications-outline'} size={16} color="#0F172A" />
          <Text style={styles.followText}>{siguiendo ? 'Siguiendo' : 'Seguir categoría'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.corroborarBtn} onPress={handleCorroborar}>
          <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
          <Text style={styles.corroborarText}>Me pasó / Lo vi ({corrob})</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reportBtn} onPress={() => setReportModal(true)}>
        <Ionicons name="flag-outline" size={14} color="#64748B" />
        <Text style={styles.reportText}>Reportar contenido</Text>
      </TouchableOpacity>

      <Modal visible={reportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reportar relato</Text>
            <TextInput
              style={styles.motivoInput}
              placeholder="Motivo del reporte"
              placeholderTextColor="#94A3B8"
              value={motivo}
              onChangeText={setMotivo}
              multiline
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleReportar}>
              <Text style={styles.confirmText}>Enviar reporte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReportModal(false)}>
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
  shareBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 24 },
  headerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  catText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  fecha: { fontSize: 11, color: '#94A3B8', marginLeft: 'auto' },
  titulo: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  rol: { fontSize: 11, color: '#64748B' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  modo: { fontSize: 14, color: '#334155', lineHeight: 22 },
  signalRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  signalText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19 },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  idChipText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  link: { fontSize: 12, color: '#2563EB', marginBottom: 4 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
  },
  followText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  corroborarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1.4,
  },
  corroborarText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  reportText: { fontSize: 11, color: '#64748B' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
  motivoInput: {
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
