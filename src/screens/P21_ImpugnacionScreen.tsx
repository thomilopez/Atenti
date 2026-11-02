import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { crearImpugnacion, validarDocumento, validarDescargo } from '../services/impugnationService';

type Props = NativeStackScreenProps<RootStackParamList, 'P21_Impugnacion'>;

export const P21_ImpugnacionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { incident } = route.params;
  const { user } = useAuth();
  const [cuitODni, setCuitODni] = useState('');
  const [descargo, setDescargo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!validarDocumento(cuitODni)) {
      Alert.alert('Documento inválido', 'Ingresá un CUIT/DNI de 7 a 11 dígitos.');
      return;
    }
    if (!validarDescargo(descargo)) {
      Alert.alert('Descargo muy corto', 'Contá tu descargo con al menos 20 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      await crearImpugnacion({
        denunciaId: incident.id,
        cuitODni,
        descargo,
        actorId: user?.uid ?? 'u3_comercio_demo',
      });
      setEnviando(false);
      Alert.alert(
        'Impugnación registrada',
        'La denuncia quedó en disputa y temporalmente oculta. El denunciante fue notificado.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      setEnviando(false);
      Alert.alert('Error', e?.message ?? 'No se pudo registrar la impugnación.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Impugnar denuncia</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.code}>{incident.trackingCode}</Text>
          <Text style={styles.title}>{incident.title}</Text>
          <Text style={styles.category}>{incident.category}</Text>
          <Text style={styles.note}>
            Al impugnar, la denuncia pasa a estado EN_DISPUTA y se oculta del buscador
            público hasta que se resuelva.
          </Text>
        </View>

        <Text style={styles.label}>CUIT / DNI del impugnante</Text>
        <TextInput
          style={styles.input}
          placeholder="Solo números"
          placeholderTextColor="#94A3B8"
          value={cuitODni}
          onChangeText={setCuitODni}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Descargo</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Explicá por qué la denuncia es incorrecta..."
          placeholderTextColor="#94A3B8"
          value={descargo}
          onChangeText={setDescargo}
          multiline
        />
        <Text style={styles.counter}>{descargo.trim().length}/20 caracteres mínimos</Text>

        <TouchableOpacity
          style={[styles.submitBtn, enviando && styles.disabled]}
          onPress={handleEnviar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Presentar impugnación</Text>
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
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  code: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  title: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  category: { fontSize: 12, color: '#475569', marginTop: 2 },
  note: { fontSize: 12, color: '#92400E', lineHeight: 18, marginTop: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
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
  },
  counter: { fontSize: 11, color: '#64748B', marginTop: 4, marginBottom: 16 },
  submitBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
