import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'P33_CommunityGuidelines'>;

const NORMAS = [
  'Compartí información real y con buena intención. No inventes estafas.',
  'No acuses a personas concretas sin evidencia. Evitá nombres, DNI o datos privados de terceros.',
  'No publiques datos sensibles (cuentas completas, DNI, domicilios particulares).',
  'Los relatos son contenido de la comunidad y pueden ser moderados u ocultados.',
  'Usá las señales de alerta para ayudar a otros, no para difamar.',
];

export const P33_CommunityGuidelinesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Normas de la comunidad</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Atenti es una comunidad de prevención de fraudes. Al compartir un relato te
          comprometés a seguir estas normas.
        </Text>

        {NORMAS.map((n, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.numCircle}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <Text style={styles.rowText}>{n}</Text>
          </View>
        ))}

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#0F172A" />
          <Text style={styles.disclaimerText}>
            Los relatos son contenido generado por usuarios y no constituyen acusaciones
            formales. Ante un delito, hacé la denuncia en las autoridades correspondientes.
          </Text>
        </View>
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
  content: { padding: 20 },
  intro: { fontSize: 14, color: '#334155', lineHeight: 21, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  numCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  rowText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19 },
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },
});
