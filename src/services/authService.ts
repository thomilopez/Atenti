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
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { app, isFirebaseConfigured } from './firebase';
import { env } from './env';
import {
  obtenerProveedorDNI,
  EstadoDNI,
  ResultadoVerificacionDNI,
} from './renaperProvider';

export const auth = getAuth(app);

export interface SesionUsuario {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
}

function mapearUsuario(u: FirebaseUser): SesionUsuario {
  return {
    uid: u.uid,
    email: u.email ?? '',
    displayName: u.displayName ?? '',
    photoURL: u.photoURL ?? undefined,
    phoneNumber: u.phoneNumber ?? undefined,
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
