import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { registrarSolicitudBaja } from '../services/accountService';

type Props = NativeStackScreenProps<RootStackParamList, 'P24_RightToBeForgotten'>;

export const P24_RightToBeForgottenScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    if (motivo.trim().length < 10) {
      Alert.alert('Motivo requerido', 'Contanos el motivo con al menos 10 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      await registrarSolicitudBaja({ uid: user?.uid ?? 'anonimo', motivo: motivo.trim() });
      setEnviando(false);
      Alert.alert(
        'Solicitud registrada',
        'Tu solicitud de derecho al olvido fue registrada conforme a la Ley 25.326.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      setEnviando(false);
      Alert.alert('Error', 'No se pudo registrar la solicitud.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Derecho al olvido</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#0F172A" />
          <Text style={styles.infoText}>
            Podés solicitar la supresion definitiva de tus datos personales. La solicitud
            queda registrada y sera revisada conforme a la Ley 25.326.
          </Text>
        </View>

        <Text style={styles.label}>Motivo de la solicitud</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Explicá brevemente el motivo"
          placeholderTextColor="#94A3B8"
          value={motivo}
          onChangeText={setMotivo}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, enviando && styles.disabled]}
          onPress={handleSubmit}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Enviar solicitud</Text>
          )}
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
  content: { padding: 16 },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
