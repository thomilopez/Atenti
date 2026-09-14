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
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { VeracityBar } from '../components/VeracityBar';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P9_CredibilityPanel'>;

export const P9_CredibilityPanelScreen: React.FC<Props> = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    identityFactors,
    logout,
    calculateMyIdentityScore,
  } = useAuth();

  const identityScore = calculateMyIdentityScore();
  // Score total simulado acumulado con evidencias
  const totalCredibility = Math.min(100, identityScore + 45 + 15);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecera: Credibilidad y Sesión */}
      <View style={styles.topHeader}>
        <View style={styles.credibilityPill}>
          <Text style={styles.credibilityPillText}>Credibilidad ({identityScore}/40 pts)</Text>
        </View>

        {isAuthenticated && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();
              Alert.alert('Sesión Cerrada', 'Has vuelto al modo anónimo (U0).');
            }}
          >
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Salir</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cuerpo: Lista interactiva de factores de identidad */}
        <View style={styles.checklistContainer}>
          {/* Ítem 1: "Cuenta Google" */}
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="logo-google" size={18} color="#0F172A" style={styles.itemIcon} />
              <View>
                <Text style={styles.itemTitle}>Cuenta Google (+15%)</Text>
                <Text style={styles.itemSub}>
                  {user?.email ? user.email : 'Autenticación base obligatoria U1'}
                </Text>
              </View>
            </View>
            {identityFactors.googleAuth ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => navigation.navigate('P3_LegalAuth', { returnTo: 'P9_CredibilityPanel' })}
              >
                <Text style={styles.verifyButtonText}>Ingresar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Ítem 2: "Teléfono verificado (+15%)" */}
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color="#0F172A" style={styles.itemIcon} />
              <View>
                <Text style={styles.itemTitle}>Teléfono verificado (+15%)</Text>
                <Text style={styles.itemSub}>
                  {identityFactors.phoneVerified
                    ? `${user?.phoneNumber || 'SMS Validado'}`
                    : 'Validación SMS OTP (U2)'}
                </Text>
              </View>
            </View>

            {identityFactors.phoneVerified ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => navigation.navigate('IdentityUpgrade', { factor: 'phone' })}
              >
                <Text style={styles.verifyButtonText}>Verificar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Ítem 3: "DNI verificado (+10%)" */}
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="card-outline" size={18} color="#0F172A" style={styles.itemIcon} />
              <View>
                <Text style={styles.itemTitle}>DNI verificado (+10%)</Text>
                <Text style={styles.itemSub}>
                  {identityFactors.dniVerified
                    ? `DNI N° ${user?.dniNumber || 'Verificado'}`
                    : 'Cotejo fotográfico OCR (U2)'}
                </Text>
              </View>
            </View>

            {identityFactors.dniVerified ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => navigation.navigate('IdentityUpgrade', { factor: 'dni' })}
              >
                <Text style={styles.verifyButtonText}>Verificar</Text>
              </TouchableOpacity>
            )}
          </View>
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
            <Text style={styles.finalScoreLabel}>Credibilidad Total:</Text>
            <VeracityBar
              percentage={totalCredibility}
              height={18}
              showPercentageText={true}
            />
          </View>
        </View>
      </ScrollView>

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  credibilityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  credibilityPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    gap: 4,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  itemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  // Abajo: Un gráfico de torta simple o líneas simulando la explicación de la fórmula
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
