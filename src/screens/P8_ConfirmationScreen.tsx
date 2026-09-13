import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useReportFlow } from '../context/ReportFlowContext';
import { VeracityBar } from '../components/VeracityBar';
import { BottomNavBar } from '../components/BottomNavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P8_Confirmation'>;

export const P8_ConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { trackingCode, finalScore } = route.params;
  const { resetForm } = useReportFlow();

  const handleGoHome = () => {
    resetForm();
    navigation.reset({
      index: 0,
      routes: [{ name: 'P1_Home' }],
    });
  };

  const handleTrackStatus = () => {
    navigation.navigate('P9_CredibilityPanel');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Banner superior verde como en el mockup */}
      <View style={styles.topGreenBanner}>
        <Text style={styles.bannerText}>Reporte publicado con éxito</Text>
      </View>

      <View style={styles.container}>
        {/* Cuerpo central: Un círculo grande con un tilde (Check) */}
        <View style={styles.centerBody}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>

          {/* Textos: "Código: AT-2026-XXXX" y "Credibilidad final: 80%" */}
          <Text style={styles.codeText}>Código: {trackingCode}</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Credibilidad final: {finalScore || 80}%</Text>
            <VeracityBar
              percentage={finalScore || 80}
              height={18}
              showPercentageText={true}
            />
          </View>
        </View>

        {/* Botones inferiores: "Seguir estado" y "Volver al inicio" */}
        <View style={styles.bottomButtons}>
          {/* Botón Seguir estado */}
          <TouchableOpacity
            style={styles.trackBtn}
            activeOpacity={0.88}
            onPress={handleTrackStatus}
          >
            <Text style={styles.trackBtnText}>Seguir estado</Text>
          </TouchableOpacity>

          {/* Botón Volver al inicio */}
          <TouchableOpacity
            style={styles.homeBtn}
            activeOpacity={0.88}
            onPress={handleGoHome}
          >
            <Text style={styles.homeBtnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavBar activeTab="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topGreenBanner: {
    backgroundColor: '#00E676', // Banner verde del mockup
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  centerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // Círculo grande con un tilde (Check)
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00E676',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  // Texto: "Código: AT-2026-XXXX"
  codeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  // Texto: "Credibilidad final: 80%"
  scoreContainer: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  // Botones inferiores: "Seguir estado" y "Volver al inicio"
  bottomButtons: {
    width: '100%',
    gap: 10,
  },
  trackBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  homeBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
