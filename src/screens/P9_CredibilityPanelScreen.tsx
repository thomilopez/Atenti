import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CredibilityBreakdown } from '../types';
import { useAuth } from '../context/AuthContext';
import { VeracityBar } from '../components/VeracityBar';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { BottomNavBar } from '../components/BottomNavBar';
import { validarTelefonoE164 } from '../services/normalize';

type Props = NativeStackScreenProps<RootStackParamList, 'P9_CredibilityPanel'>;

export const P9_CredibilityPanelScreen: React.FC<Props> = ({ navigation }) => {
  const {
    identityFactors,
    verifyPhone,
    verifyDNI,
    calculateMyIdentityScore,
    dniEstado,
  } = useAuth();

  // Modales interactivos
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [digit1, setDigit1] = useState('1');
  const [digit2, setDigit2] = useState('1');
  const [digit3, setDigit3] = useState('0');
  const [digit4, setDigit4] = useState('0');
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [dniModalVisible, setDniModalVisible] = useState(false);
  const [dniInput, setDniInput] = useState('');
  const [dniLoading, setDniLoading] = useState(false);

  const identityScore = calculateMyIdentityScore();

  const identityBreakdown: CredibilityBreakdown = {
    identityScore,
    evidenceScore: 0,
    corroborationScore: 0,
    totalScore: identityScore,
    level: identityScore >= 75 ? 'ALTA' : identityScore >= 40 ? 'SOSPECHOSA' : 'BAJA',
    trafficLight: identityScore >= 75 ? 'green' : identityScore >= 40 ? 'yellow' : 'red',
  };

  const handleConfirmPhone = async () => {
    if (!validarTelefonoE164(phoneInput)) {
      Alert.alert('Teléfono inválido', 'Ingresá un celular argentino válido (ej: +54 9 11 3849 2018).');
      return;
    }
    const codigo = `${digit1}${digit2}${digit3}${digit4}`;
    if (codigo.length !== 4) {
      Alert.alert('Código incompleto', 'Ingresá los 4 dígitos del SMS.');
      return;
    }
    setPhoneLoading(true);
    const ok = await verifyPhone(phoneInput, codigo);
    setPhoneLoading(false);
    setPhoneModalVisible(false);
    Alert.alert(
      ok ? 'Verificado' : 'No verificado',
      ok ? 'Se han sumado 15 puntos a tu identidad.' : 'El código no es válido.'
    );
  };

  const handleConfirmDNI = async () => {
    const limpio = dniInput.replace(/\D/g, '');
    if (!/^\d{7,8}$/.test(limpio)) {
      Alert.alert('DNI inválido', 'Ingresá un DNI de 7 u 8 dígitos.');
      return;
    }
    setDniLoading(true);
    const resultado = await verifyDNI(limpio);
    setDniLoading(false);
    setDniModalVisible(false);
    if (resultado.estado === 'verificado') {
      Alert.alert('Verificado', 'Se han sumado 10 puntos a tu identidad.');
    } else if (resultado.estado === 'verificando') {
      Alert.alert('Verificando', resultado.mensaje);
    } else {
      Alert.alert('No verificado', resultado.mensaje);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecera: Credibilidad */}
      <View style={styles.topHeader}>
        <View style={{ width: 36 }} />
        <View style={styles.credibilityPill}>
          <Text style={styles.credibilityPillText}>Credibilidad</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('P20_Settings')}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cuerpo: Una lista de tres ítems */}
        <View style={styles.checklistContainer}>
          {/* Ítem 1: "Cuenta Google" (con tilde) */}
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="logo-google" size={18} color="#0F172A" style={styles.itemIcon} />
              <Text style={styles.itemTitle}>Cuenta Google</Text>
            </View>
            {identityFactors.googleAuth ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            ) : (
              <Text style={styles.pendingBadgeText}>Pendiente</Text>
            )}
          </View>

          {/* Ítem 2: "Teléfono verificado (+15%)" (con botón 'Verificar') */}
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color="#0F172A" style={styles.itemIcon} />
              <View>
                <Text style={styles.itemTitle}>Teléfono verificado (+15 pts)</Text>
              </View>
            </View>

            {identityFactors.phoneVerified ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => setPhoneModalVisible(true)}
              >
                <Text style={styles.verifyButtonText}>Verificar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Ítem 3: "DNI verificado (+10%)" (con botón 'Verificar') */}
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="card-outline" size={18} color="#0F172A" style={styles.itemIcon} />
              <View>
                <Text style={styles.itemTitle}>DNI verificado (+10 pts)</Text>
              </View>
            </View>

            {identityFactors.dniVerified ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            ) : dniEstado === 'verificando' ? (
              <View style={styles.pendingBadge}>
                <ActivityIndicator size="small" color="#0F172A" />
                <Text style={styles.pendingBadgeText}>Verificando</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => setDniModalVisible(true)}
              >
                <Text style={styles.verifyButtonText}>Verificar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.breakdownSection}>
          <ScoreBreakdown breakdown={identityBreakdown} />
        </View>

        {/* Abajo: Un gráfico de torta simple o líneas simulando la explicación de la fórmula */}
        <View style={styles.formulaSection}>
          <Text style={styles.formulaTitle}>Explicación de la fórmula (RG-07)</Text>

          {/* Gráfico de líneas segmentadas simulando la fórmula */}
          <View style={styles.formulaLinesContainer}>
            <View style={styles.formulaRow}>
              <Text style={styles.formulaLabel}>Identidad del denunciante</Text>
              <Text style={styles.formulaValue}>40%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '40%', backgroundColor: '#000000' }]} />
            </View>

            <View style={styles.formulaRow}>
              <Text style={styles.formulaLabel}>Evidencia de campo / OCR</Text>
              <Text style={styles.formulaValue}>45%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '45%', backgroundColor: '#000000' }]} />
            </View>

            <View style={styles.formulaRow}>
              <Text style={styles.formulaLabel}>Corroboración comunitaria</Text>
              <Text style={styles.formulaValue}>15%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '15%', backgroundColor: '#000000' }]} />
            </View>
          </View>

          {/* Barra de porcentaje final abajo */}
          <View style={styles.finalScoreBox}>
            <Text style={styles.finalScoreLabel}>Identidad verificada:</Text>
            <VeracityBar
              percentage={identityScore}
              height={18}
              showPercentageText={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal Interactivo de Verificación de Teléfono con diseño de Figma (pantalla 2 desde la derecha) */}
      <Modal visible={phoneModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.otpCard}>
            <Text style={styles.brandTitle}>Atenti</Text>
            <Text style={styles.otpSubtitle}>
              Verificación de teléfono{"\n"}(código de 4 dígitos enviado por SMS)
            </Text>

            {/* 4 casilleros de dígitos: [ 1 ] [ 1 ] [ 0 ] [ 0 ] */}
            <View style={styles.dniInputBox}>
              <TextInput
                style={styles.dniInput}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                placeholder="+54 9 11 3849 2018"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.otpDigitsRow}>
              <TextInput
                style={styles.digitBox}
                value={digit1}
                onChangeText={setDigit1}
                keyboardType="numeric"
                maxLength={1}
              />
              <TextInput
                style={styles.digitBox}
                value={digit2}
                onChangeText={setDigit2}
                keyboardType="numeric"
                maxLength={1}
              />
              <TextInput
                style={styles.digitBox}
                value={digit3}
                onChangeText={setDigit3}
                keyboardType="numeric"
                maxLength={1}
              />
              <TextInput
                style={styles.digitBox}
                value={digit4}
                onChangeText={setDigit4}
                keyboardType="numeric"
                maxLength={1}
              />
            </View>

            {/* Botón ancho Confirmar */}
            <TouchableOpacity
              style={styles.otpConfirmBtn}
              activeOpacity={0.88}
              onPress={handleConfirmPhone}
              disabled={phoneLoading}
            >
              {phoneLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.otpConfirmBtnText}>Confirmar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhoneModalVisible(false)}
              style={styles.closeModalBtn}
            >
              <Text style={styles.closeModalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Interactivo de Verificación de DNI */}
      <Modal visible={dniModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.otpCard}>
            <Text style={styles.brandTitle}>Atenti</Text>
            <Text style={styles.otpSubtitle}>
              Verificación de DNI con Renaper (+10 pts)
            </Text>

            <View style={styles.dniInputBox}>
              <TextInput
                style={styles.dniInput}
                value={dniInput}
                onChangeText={setDniInput}
                keyboardType="numeric"
                placeholder="Número de DNI"
                editable={!identityFactors.dniVerified}
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={styles.otpConfirmBtn}
              activeOpacity={0.88}
              onPress={handleConfirmDNI}
              disabled={dniLoading}
            >
              {dniLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.otpConfirmBtnText}>Validar DNI</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDniModalVisible(false)}
              style={styles.closeModalBtn}
            >
              <Text style={styles.closeModalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar activeTab="profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingsBtn: {
    padding: 4,
  },
  credibilityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  credibilityPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // Cuerpo: Una lista de tres ítems
  checklistContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemIcon: {
    width: 24,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00E676', // Tilde con fondo verde
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pendingBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  // Abajo: Un gráfico de torta simple o líneas simulando la explicación de la fórmula
  breakdownSection: {
    marginBottom: 16,
  },
  formulaSection: {
    paddingTop: 8,
  },
  formulaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  formulaLinesContainer: {
    gap: 10,
    marginBottom: 20,
  },
  formulaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  formulaLabel: {
    fontSize: 12,
    color: '#475569',
  },
  formulaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  barTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  finalScoreBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  finalScoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  otpCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 6,
  },
  otpSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  // 4 casilleros de dígitos
  otpDigitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  digitBox: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#000000',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  otpConfirmBtn: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  otpConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  closeModalBtn: {
    marginTop: 12,
    padding: 6,
  },
  closeModalBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dniInputBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  dniInput: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
    textAlign: 'center',
  },
});
