import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  TERMINOS_VERSIONS,
  VERSION_TERMINOS_ACTUAL,
  RETENCION_ANIOS,
  LEY_25326_URL,
  PRIVACIDAD_RESUMEN,
} from '../services/termsService';

type Props = NativeStackScreenProps<RootStackParamList, 'P23_Legal'>;

export const P23_LegalScreen: React.FC<Props> = ({ navigation }) => {
  const [version, setVersion] = useState(VERSION_TERMINOS_ACTUAL);
  const seleccionada =
    TERMINOS_VERSIONS.find((v) => v.version === version) ?? TERMINOS_VERSIONS[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Legal</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Terminos y condiciones</Text>
        <View style={styles.chipsRow}>
          {TERMINOS_VERSIONS.map((v) => (
            <TouchableOpacity
              key={v.version}
              style={[styles.chip, version === v.version && styles.chipActive]}
              onPress={() => setVersion(v.version)}
            >
              <Text style={[styles.chipText, version === v.version && styles.chipTextActive]}>
                {v.version}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{seleccionada.version}</Text>
          <Text style={styles.cardMeta}>Aprobada el {seleccionada.aprobadaEn}</Text>
          <Text style={styles.cardBody}>{seleccionada.resumen}</Text>
        </View>

        <Text style={styles.sectionTitle}>Privacidad (Ley 25.326)</Text>
        <View style={styles.card}>
          <Text style={styles.cardBody}>{PRIVACIDAD_RESUMEN}</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL(LEY_25326_URL).catch(() => {})}
          >
            <Ionicons name="open-outline" size={16} color="#3730A3" />
            <Text style={styles.linkText}>Ver Ley 25.326</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Retencion de datos</Text>
        <View style={styles.card}>
          <Text style={styles.cardBody}>
            Los registros de auditoria y transacciones se conservan por un plazo minimo de{' '}
            {RETENCION_ANIOS} anios, conforme a los requisitos legales.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.forgetBtn}
          onPress={() => navigation.navigate('P24_RightToBeForgotten')}
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={styles.forgetBtnText}>Solicitar derecho al olvido</Text>
        </TouchableOpacity>
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
  content: { padding: 16, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  cardMeta: { fontSize: 11, color: '#64748B', marginTop: 2 },
  cardBody: { fontSize: 13, color: '#334155', lineHeight: 20, marginTop: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  linkText: { fontSize: 12, fontWeight: '700', color: '#3730A3' },
  forgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
  },
  forgetBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '800' },
});
