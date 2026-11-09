/**
 * Servicio de autenticación real (RF-009, RF-010, RF-011, RF-014).
 *
 * - Google Sign-In con Firebase Auth.
 * - Verificación de teléfono por SMS OTP.
 * - Verificación de DNI por OCR/RENAPER (provider pluggable).
 *
 * Si no hay credenciales reales configuradas (modo demo), cada operación
 * devuelve un resultado simulado para no romper el flujo del MVP.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { app, isFirebaseConfigured } from './firebase';
import { env } from './env';
import {
  obtenerProveedorDNI,
  EstadoDNI,
  ResultadoVerificacionDNI,
} from './renaperProvider';

function crearAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  // `getReactNativePersistence` existe en el build RN de Firebase, pero no en
  // los tipos de `firebase/auth`. Se resuelve en runtime con un cast.
  const mod = FirebaseAuth as unknown as {
    getReactNativePersistence?: (storage: unknown) => unknown;
  };
  if (mod.getReactNativePersistence) {
    try {
      return initializeAuth(app, {
        persistence: mod.getReactNativePersistence(AsyncStorage) as never,
      });
    } catch {
      // Ya inicializado (por ejemplo, hot reload).
      return getAuth(app);
    }
  }
  return getAuth(app);
}

export const auth = crearAuth();

/** true cuando la app corre dentro de Expo Go (sin modulos nativos). */
function esExpoGo(): boolean {
  return (
    (Constants as unknown as { appOwnership?: string | null }).appOwnership === 'expo'
  );
}

export interface SesionUsuario {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  /**
   * true cuando la sesión no viene de Google (fallback anónimo en Expo Go).
   * Sirve para no otorgar el factor de identidad `googleAuth` (+15 pts).
   */
  anonima?: boolean;
}

function mapearUsuario(u: FirebaseUser): SesionUsuario {
  const proveedores = (u.providerData ?? []).map((p) => p.providerId);
  const esGoogle = proveedores.includes('google.com');
  const esAnonima = !esGoogle && proveedores.length === 0;
  return {
    uid: u.uid,
    email: u.email ?? '',
    displayName: u.displayName ?? '',
    photoURL: u.photoURL ?? undefined,
    phoneNumber: u.phoneNumber ?? undefined,
    anonima: esAnonima,
  };
}

/**
 * Inicia sesión con Google. En modo demo devuelve un usuario simulado.
 */
export async function signInWithGoogle(): Promise<SesionUsuario> {
  if (!isFirebaseConfigured) {
    await new Promise((res) => setTimeout(res, 600));
    return {
      uid: 'usr_atenti_google_demo',
      email: 'usuario.atenti@gmail.com',
      displayName: 'Usuario Atenti Verificado',
    };
  }

  // Expo Go no incluye el modulo nativo de Google Sign-In. En su lugar se
  // crea una sesion anonima de Firebase: las reglas de Firestore aceptan
  // cualquier `request.auth != null`, asi que el usuario puede crear reportes
  // desde el celular sin Google. El factor `googleAuth` NO se otorga (ver
  // AuthContext.aPerfil) para no inflar el puntaje de credibilidad RG-07.
  if (esExpoGo()) {
    try {
      const { signInAnonymously } = await import('firebase/auth');
      const respuesta = await signInAnonymously(auth);
      return { ...mapearUsuario(respuesta.user), anonima: true };
    } catch (e: unknown) {
      const mensaje = e instanceof Error ? e.message : String(e);
      throw new Error(
        `No se pudo iniciar sesión en Expo Go (Google Sign-In no está disponible). Detalle: ${mensaje}`
      );
    }
  }

  // Web: el modulo nativo no existe; se usa el flujo popup de Firebase Auth
  // (la app web ya esta registrada en la consola de Firebase).
  if (Platform.OS === 'web') {
    const { signInWithPopup } = await import('firebase/auth');
    const respuesta = await signInWithPopup(auth, new GoogleAuthProvider());
    if (!respuesta.user) {
      throw new Error('Se canceló el inicio de sesión con Google');
    }
    return mapearUsuario(respuesta.user);
  }

  // Import dinámico: solo se carga cuando hay credenciales reales configuradas.
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  if (env.googleWebClientId) {
    GoogleSignin.configure({ webClientId: env.googleWebClientId });
  }
  await GoogleSignin.hasPlayServices();
  const respuesta = await GoogleSignin.signIn();
  if (respuesta.type !== 'success') {
    throw new Error('Se canceló el inicio de sesión con Google');
  }
  const idToken = respuesta.data.idToken;
  if (!idToken) {
    throw new Error('No se obtuvo el idToken de Google');
  }
  const credencial = GoogleAuthProvider.credential(idToken);
  const resultado = await signInWithCredential(auth, credencial);
  return mapearUsuario(resultado.user);
}

/**
 * Verifica un número de teléfono por SMS OTP.
 * En modo demo acepta cualquier código y devuelve true.
 */
export async function verifyPhone(phoneNumber: string, code: string): Promise<boolean> {
  if (!isFirebaseConfigured) {
    await new Promise((res) => setTimeout(res, 900));
    return Boolean(phoneNumber && code.trim().length > 0);
  }

  // En producción el alta/verificación del OTP se resuelve en Cloud Functions
  // (no exponemos el flujo reCAPTCHA del SDK web en React Native).
  const { verificarTelefono } = await import('./cloudFunctions');
  return verificarTelefono(phoneNumber, code);
}

/**
 * Verifica el DNI contra RENAPER. Sin credenciales queda en "verificando".
 */
export async function verifyDNI(dniNumber: string): Promise<ResultadoVerificacionDNI> {
  const proveedor = obtenerProveedorDNI();
  return proveedor.verificar(dniNumber);
}

/** Cierra la sesión actual. */
export async function logout(): Promise<void> {
  if (!isFirebaseConfigured) {
    await new Promise((res) => setTimeout(res, 300));
    return;
  }
  await firebaseSignOut(auth);
}

export type { EstadoDNI, ResultadoVerificacionDNI };
export const plataformaAuth = Platform.OS;

/** Fachada única para los consumidores del contexto de autenticación. */
export const authService = {
  signInWithGoogle,
  verifyPhone,
  verifyDNI,
  logout,
};
