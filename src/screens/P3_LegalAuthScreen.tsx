import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/AppButton';

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
        'Declaración Jurada Requerida (CP-04 / RG-01)',
        'Debes aceptar expresamente la Declaración Jurada y Términos para identificarte y emitir reportes.'
      );
      return;
    }

    try {
      setLoading(true);
      await loginWithGoogle(userEmail.trim() || undefined);
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Cabecera con marca Atenti */}
          <View style={styles.header}>
            <Text style={styles.brandTitle}>Atenti</Text>
            <Text style={styles.brandSub}>
              Crea una cuenta segura en 1 minuto para acceder a toda la red
            </Text>
          </View>

          {/* Cuerpo central: Ícono de candado y formulario */}
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
            <AppButton
              title="Continuar con Google"
              onPress={handleContinue}
              variant="outline"
              size="md"
              iconLeft="logo-google"
              iconColor="#EA4335"
              style={styles.googleBtn}
              disabled={loading}
            />

            {/* Botón principal oscuro "Continuar" */}
            <AppButton
              title="Continuar"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!acceptedDDJJ || loading}
              style={styles.continueBtn}
            />
          </View>

          {/* Abajo: Cuadradito (checkbox) con texto legal DDJJ y Términos */}
          <View style={styles.legalFooter}>
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => setAcceptedDDJJ(!acceptedDDJJ)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedDDJJ }}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  acceptedDDJJ && styles.checkboxSquareChecked,
                ]}
              >
                {acceptedDDJJ && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>

              <View style={styles.legalTextContainer}>
                <Text style={styles.legalText}>
                  Acepto DDJJ y Términos. Declaro bajo juramento que los datos aportados son verídicos, asumiendo responsabilidad conforme al protocolo de Atenti.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 20,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  centerBody: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
  },
  googleBtn: {
    marginBottom: 12,
    borderColor: '#CBD5E1',
  },
  continueBtn: {
    marginTop: 4,
  },
  legalFooter: {
    paddingTop: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
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
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
});
