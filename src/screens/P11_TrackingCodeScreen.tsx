import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { consultarAntecedentePublico } from '../services/firebase';
import { isValidTrackingCode } from '../services/operationKey';
import { BottomNavBar } from '../components/BottomNavBar';
import { VeracityBar } from '../components/VeracityBar';

type Props = NativeStackScreenProps<RootStackParamList, 'P11_TrackingCode'>;

export const P11_TrackingCodeScreen: React.FC<Props> = ({ route, navigation }) => {
  const [codigo, setCodigo] = useState(route.params?.codigo ?? '');
  const [resultado, setResultado] = useState<ReturnType<typeof consultarAntecedentePublico>>(null);
  const [buscado, setBuscado] = useState(false);

  const handleConsultar = () => {
    const limpio = codigo.trim().toUpperCase();
    setBuscado(true);
    if (!isValidTrackingCode(limpio)) {
      setResultado(null);
      return;
    }
    setResultado(consultarAntecedentePublico(limpio));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Consultar estado</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Ingresá tu código de seguimiento</Text>
        <Text style={styles.subtitle}>
          Podés consultar el estado de un reporte sin iniciar sesión.
        </Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="AT-2026-000000"
            placeholderTextColor="#94A3B8"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleConsultar}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
          <Text style={styles.searchBtnText}>Consultar</Text>
        </TouchableOpacity>

        {buscado && !resultado && (
          <View style={styles.notFound}>
            <Ionicons name="alert-circle-outline" size={32} color="#F59E0B" />
            <Text style={styles.notFoundText}>
              No encontramos una denuncia con ese código o está en disputa.
            </Text>
          </View>
        )}

        {resultado && (
          <View style={styles.resultCard}>
            <Text style={styles.resultCode}>{resultado.codigo}</Text>
            <Text style={styles.resultTitle}>{resultado.tituloEnmascarado}</Text>
            <Text style={styles.resultCategory}>{resultado.categoria}</Text>
            <Text style={styles.resultState}>Estado: {resultado.estado}</Text>
            <View style={styles.resultScore}>
              <Text style={styles.resultScoreLabel}>Credibilidad:</Text>
              <VeracityBar percentage={resultado.credibilidadPct} height={16} />
            </View>
          </View>
        )}
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
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  notFound: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  notFoundText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  resultState: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 8,
  },
  resultScore: {
    marginTop: 12,
  },
  resultScoreLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
});
