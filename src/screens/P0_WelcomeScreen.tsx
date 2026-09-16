/**
 * Atenti - Pantalla de Bienvenida (P0_WelcomeScreen)
 * Introducción visual interactiva, validación de sesión y transición fluida hacia el mapa principal o autenticación.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'P0_Welcome'>;

interface FeaturePillProps {
  icon: any;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

const FeaturePill: React.FC<FeaturePillProps> = ({
  icon,
  iconColor,
  bgColor,
  title,
  description,
}) => (
  <View style={styles.featureCard}>
    <View style={[styles.featureIconContainer, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.featureDescription} numberOfLines={2}>
        {description}
      </Text>
    </View>
  </View>
);

export const P0_WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();

  // Validación de sesión opcional o bienvenida personalizada
  const handleStartExploring = () => {
    navigation.replace('P1_Home');
  };

  const handleGoToAuth = () => {
    navigation.navigate('P3_LegalAuth');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveContainer}>
          {/* Encabezado e Isotipo de Marca */}
          <View style={styles.brandSection}>
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Ionicons name="shield-checkmark" size={44} color="#0F172A" />
              </View>
            </View>
            <Text style={styles.brandTitle}>Atenti</Text>
            <Text style={styles.brandTagline}>
              Red Colaborativa de Prevención de Fraudes
            </Text>
            <Text style={styles.brandSub}>
              Detectá, reportá y consultá alertas ciudadanas geolocalizadas con respaldo de evidencias verificadas.
            </Text>
          </View>

          {/* Tarjetas informativas de beneficios clave */}
          <View style={styles.featuresSection}>
            <FeaturePill
              icon="map"
              iconColor="#0284C7"
              bgColor="#E0F2FE"
              title="Alertas en el Mapa"
              description="Visualizá zonas, comercios y números fraudulentos cercanos a tu ubicación en tiempo real."
            />
            <FeaturePill
              icon="analytics"
              iconColor="#059669"
              bgColor="#D1FAE5"
              title="Semáforo de Credibilidad"
              description="Algoritmo transparente que califica la veracidad con evidencias, DDJJ y corroboración."
            />
            <FeaturePill
              icon="lock-closed"
              iconColor="#7C3AED"
              bgColor="#EDE9FE"
              title="Participación Protegida"
              description="Protección de identidad y encriptación de datos sensibles bajo protocolos de seguridad."
            />
          </View>

          {/* Indicador de estado de sesión si ya está autenticado */}
          {isAuthenticated && user && (
            <View style={styles.userBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.userBannerText} numberOfLines={1}>
                Sesión activa como: <Text style={styles.userBannerEmail}>{user.displayName || user.email}</Text>
              </Text>
            </View>
          )}

          {/* Botones de acción principales */}
          <View style={styles.actionSection}>
            <AppButton
              title="Explorar Mapa de Alertas"
              onPress={handleStartExploring}
              variant="primary"
              size="lg"
              iconRight="arrow-forward"
              style={styles.mainBtn}
            />

            {!isAuthenticated ? (
              <AppButton
                title="Identificarme / Iniciar Sesión"
                onPress={handleGoToAuth}
                variant="outline"
                size="md"
                iconLeft="person-outline"
                style={styles.secondaryBtn}
              />
            ) : (
              <AppButton
                title="Ir a Mi Credibilidad"
                onPress={() => navigation.navigate('P9_CredibilityPanel')}
                variant="secondary"
                size="md"
                iconLeft="shield-outline"
                style={styles.secondaryBtn}
              />
            )}
          </View>

          {/* Pie legal mínimo */}
          <Text style={styles.footerNote}>
            Al continuar aceptás los términos de uso y la política de privacidad de la red Atenti.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  logoInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 340,
  },
  featuresSection: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  featureIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    gap: 8,
  },
  userBannerText: {
    fontSize: 12,
    color: '#065F46',
    flexShrink: 1,
  },
  userBannerEmail: {
    fontWeight: '700',
  },
  actionSection: {
    gap: 12,
    marginBottom: 16,
  },
  mainBtn: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryBtn: {},
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
  },
});
