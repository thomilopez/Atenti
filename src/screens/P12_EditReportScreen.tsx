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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { actualizarDenuncia } from '../services/firebase';
import { puedeEditar, textoRestante } from '../services/editWindow';
import { eliminarDenuncia } from '../services/softDeleteService';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P12_EditReport'>;

export const P12_EditReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { incident } = route.params;
  const { user } = useAuth();

  const editable = puedeEditar(incident.audit.createdAt);
  const restante = textoRestante(incident.audit.createdAt);

  const [story, setStory] = useState(incident.story);
  const [address, setAddress] = useState(incident.location.address);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await actualizarDenuncia({
        denunciaId: incident.id,
        cambios: { story, location: { ...incident.location, address } },
        actorId: user?.uid ?? 'anonimo',
        motivo: 'Edición dentro de la ventana de 24hs',
      });
      setSaving(false);
      Alert.alert('Guardado', 'Los cambios se aplicaron correctamente.');
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const handleDelete = async () => {
    if (!motivo.trim()) {
      Alert.alert('Motivo requerido', 'Escribí el motivo para eliminar la denuncia.');
      return;
    }
    try {
      await eliminarDenuncia({ reporte: incident, uid: user?.uid ?? 'anonimo', motivo });
      setShowDeleteModal(false);
      Alert.alert('Eliminada', 'La denuncia fue eliminada de forma lógica.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar la denuncia.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Editar denuncia</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCode}>{incident.trackingCode}</Text>
          <Text style={styles.infoTitle}>{incident.title}</Text>
          <Text style={styles.infoCategory}>{incident.category}</Text>
          {editable ? (
            <Text style={styles.countdown}>
              <Ionicons name="time-outline" size={14} color="#0F172A" /> Editá los datos.
              Quedan {restante}
            </Text>
          ) : (
            <Text style={styles.countdownExpired}>
              La ventana de edición de 24hs expiró
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Relato</Text>
          <TextInput
            style={[styles.textArea, !editable && styles.disabledInput]}
            value={story}
            onChangeText={setStory}
            multiline
            editable={editable}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Dirección</Text>
          <TextInput
            style={[styles.textInput, !editable && styles.disabledInput]}
            value={address}
            onChangeText={setAddress}
            editable={editable}
          />
        </View>

        {editable && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteModal(true)}>
              <Text style={styles.deleteBtnText}>Eliminar denuncia</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNavBar activeTab="home" />

      <Modal visible={showDeleteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar denuncia</Text>
            <Text style={styles.modalBody}>
              Escribí el motivo de la eliminación. La denuncia dejará de ser visible
              públicamente.
            </Text>
            <TextInput
              style={styles.motivoInput}
              placeholder="Motivo"
              placeholderTextColor="#94A3B8"
              value={motivo}
              onChangeText={setMotivo}
              multiline
            />
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleDelete}>
              <Text style={styles.modalConfirmBtnText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.modalCancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoCode: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  infoCategory: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  countdown: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 10,
  },
  countdownExpired: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 10,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  actions: {
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 19,
  },
  motivoInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
