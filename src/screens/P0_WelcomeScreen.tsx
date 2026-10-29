import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<RootStackParamList, 'P0_Welcome'>;

const ESLOGAN = 'La comunidad que te avisa antes del fraude.';

export const P0_WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { contentMaxWidth, gutter, isSmall } = useResponsive();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  const irABuscar = () => navigation.replace('P1_Home');

  const irAReportar = () => {
    if (isAuthenticated) {
      navigation.replace('P4_CreateReport');
    } else {
      navigation.replace('P3_LegalAuth', { returnTo: 'P4_CreateReport' });
    }
  };

  const irAIngresar = () => {
    if (isAuthenticated) {
      navigation.replace('P9_CredibilityPanel');
    } else {
      navigation.replace('P3_LegalAuth', { returnTo: 'P9_CredibilityPanel' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={[styles.container, { paddingHorizontal: gutter }]}>
        <Animated.View
          style={[
            styles.hero,
            { maxWidth: contentMaxWidth, opacity, transform: [{ scale }] },
          ]}
        >
          <View style={styles.logoCard}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brand, isSmall && styles.brandSmall]}>Atenti</Text>
          <Text style={styles.slogan}>{ESLOGAN}</Text>
        </Animated.View>

        <View style={[styles.actions, { maxWidth: contentMaxWidth }]}>
          <TouchableOpacity style={styles.primaryBtn} onPress={irABuscar} activeOpacity={0.9}>
            <Ionicons name="search" size={18} color="#0F172A" />
            <Text style={styles.primaryBtnText}>Buscar antecedentes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={irAReportar} activeOpacity={0.9}>
            <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
            <Text style={styles.secondaryBtnText}>Reportar una estafa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={irAIngresar} activeOpacity={0.9}>
            <Ionicons name="person-outline" size={18} color="#CBD5E1" />
            <Text style={styles.ghostBtnText}>
              {isAuthenticated ? 'Mi perfil' : 'Ingresar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Alerta ciudadana colaborativa · Argentina
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoCard: {
    width: 104,
    height: 104,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  brandSmall: {
    fontSize: 34,
  },
  slogan: {
    fontSize: 15,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 15,
  },
  primaryBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 15,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 13,
  },
  ghostBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
