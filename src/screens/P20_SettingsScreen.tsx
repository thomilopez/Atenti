import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { registrarSolicitudBaja } from '../services/accountService';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P20_Settings'>;

export const P20_SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, identityFactors, logout, isAdmin } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'P1_Home' }] });
        },
      },
    ]);
  };

  const handleRequestDelete = async () => {
    if (!motivo.trim()) {
      Alert.alert('Motivo requerido', 'Contanos el motivo para tramitar la baja.');
      return;
    }
    if (!user) return;
    await registrarSolicitudBaja({ uid: user.uid, motivo: motivo.trim() });
    setShowDeleteModal(false);
    setMotivo('');
    Alert.alert(
      'Solicitud registrada',
      'Tu solicitud de baja fue registrada conforme a la Ley 25.326. Te contactaremos para confirmar.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ajustes</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={18} color="#0F172A" />
            <Text style={styles.rowValue}>{user?.email || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="logo-google" size={18} color="#0F172A" />
            <Text style={styles.rowValue}>
              Google: {identityFactors.googleAuth ? 'Verificado' : 'Pendiente'}
            </Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="phone-portrait-outline" size={18} color="#0F172A" />
            <Text style={styles.rowValue}>
              Teléfono: {identityFactors.phoneVerified ? 'Verificado' : 'Pendiente'}
            </Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="card-outline" size={18} color="#0F172A" />
            <Text style={styles.rowValue}>
              DNI: {identityFactors.dniVerified ? 'Verificado' : 'Pendiente'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administración</Text>
          {isAdmin ? (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('P14_AdminDashboard')}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color="#0F172A" />
              <Text style={styles.actionText}>Panel de administración</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.legalNote}>
              El panel de administración está disponible solo para cuentas autorizadas.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesión y privacidad</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#0F172A" />
            <Text style={styles.actionText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={() => setShowDeleteModal(true)}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text style={[styles.actionText, styles.dangerText]}>
              Eliminar mi cuenta y datos
            </Text>
          </TouchableOpacity>
          <Text style={styles.legalNote}>
            Podés solicitar la baja definitiva conforme a la Ley 25.326 de Protección de
            Datos Personales.
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="profile" />

      <Modal visible={showDeleteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            <Text style={styles.modalBody}>
              Esta acción solicita la baja definitiva de tu cuenta y tus datos. Ingresá el
              motivo para continuar.
            </Text>
            <TextInput
              style={styles.motivoInput}
              placeholder="Motivo de la baja"
              placeholderTextColor="#94A3B8"
              value={motivo}
              onChangeText={setMotivo}
              multiline
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleRequestDelete}>
              <Text style={styles.confirmBtnText}>Confirmar baja</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowDeleteModal(false);
                setMotivo('');
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
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
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rowValue: {
    fontSize: 13,
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dangerText: {
    color: '#DC2626',
  },
  legalNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 16,
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
  confirmBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
