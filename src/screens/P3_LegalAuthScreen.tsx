import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'P3_LegalAuth'>;

export const P3_LegalAuthScreen: React.FC<Props> = ({ route, navigation }) => {
  const { loginWithGoogle } = useAuth();
  const [acceptedDDJJ, setAcceptedDDJJ] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const returnTo = route.params?.returnTo || 'P4_CreateReport';
  const targetIdentifier = route.params?.targetIdentifier;

  const handleContinue = async () => {
    if (!acceptedDDJJ) {
      Alert.alert(
        'Declaración Jurada Requerida',
        'Debes tildar el casillero de aceptación de DDJJ y Términos para continuar.'
      );
      return;
    }

    try {
      setLoading(true);
      await loginWithGoogle();
      setLoading(false);

      if (returnTo === 'P4_CreateReport') {
        navigation.replace('P4_CreateReport', {
          prefilledIdentifier: targetIdentifier,
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo iniciar sesión.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabecera con marca Atenti */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Atenti</Text>
          <Text style={styles.brandSub}>
            Crea una cuenta segura en 1 minuto para acceder a toda la red
          </Text>
        </View>

        {/* Cuerpo central: Ícono genérico de candado o usuario y texto principal */}
        <View style={styles.centerBody}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={36} color="#0F172A" />
          </View>

          <Text style={styles.mainTitle}>Para denunciar necesitás identificarte</Text>

          {/* Input simulado de email */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Ingresa tu correo"
              placeholderTextColor="#94A3B8"
              value={userEmail}
              onChangeText={setUserEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Botón ancho "Continuar con Google" */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.88}
            onPress={handleContinue}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Google</Text>
          </TouchableOpacity>

          {/* Botón principal oscuro "Continuar" */}
          <TouchableOpacity
            style={[styles.continueBtn, !acceptedDDJJ && styles.btnDisabled]}
            activeOpacity={0.88}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueBtnText}>Continuar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Abajo: Un cuadradito (checkbox) con líneas simulando el texto legal "Acepto DDJJ y Términos" */}
        <View style={styles.legalFooter}>
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAcceptedDDJJ(!acceptedDDJJ)}
          >
            {/* Cuadradito (checkbox) */}
            <View style={[styles.checkboxSquare, acceptedDDJJ && styles.checkboxSquareChecked]}>
              {acceptedDDJJ && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>

            {/* Texto legal / líneas simulando DDJJ y Términos */}
            <View style={styles.legalTextContainer}>
              <Text style={styles.legalText}>
                Acepto DDJJ y Términos. Declaro bajo juramento que los datos aportados son verídicos, asumiendo responsabilidad conforme al protocolo de Atenti.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  centerBody: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
  },
  // Botón ancho "Continuar con Google"
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 12,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  legalFooter: {
    paddingTop: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  // Cuadradito (checkbox)
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSquareChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  legalTextContainer: {
    flex: 1,
  },
  legalText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
