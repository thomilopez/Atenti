/**
 * Push notifications (RF-077 a RF-079).
 *
 * Registra el token de Expo del dispositivo y configura el handler. El envio
 * real lo hace una Cloud Function al crearse una notificacion in-app.
 *
 * IMPORTANTE: `expo-notifications` no esta disponible en Expo Go. Para que la
 * app funcione en Expo Go (modo demo), el modulo se carga de forma diferida y
 * solo cuando NO estamos en Expo Go. En un development build o standalone se
 * carga normalmente.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

type ModuloNotificaciones = typeof import('expo-notifications');

let moduloCache: ModuloNotificaciones | null = null;

function esExpoGo(): boolean {
  return (
    (Constants as unknown as { appOwnership?: string | null }).appOwnership === 'expo'
  );
}

function obtenerModuloNotificaciones(): ModuloNotificaciones | null {
  if (esExpoGo()) return null;
  if (moduloCache) return moduloCache;
  try {
    // require diferido: evita que Metro intente resolver el modulo nativo en Expo Go.
    moduloCache = require('expo-notifications') as ModuloNotificaciones;
    return moduloCache;
  } catch (e) {
    console.warn('expo-notifications no disponible:', e);
    return null;
  }
}

export async function configurarNotificaciones(): Promise<void> {
  const Notifications = obtenerModuloNotificaciones();
  if (!Notifications) {
    console.info('Notificaciones: modo Expo Go, push deshabilitado (se usan in-app).');
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Atenti',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  } catch (e) {
    console.warn('configurarNotificaciones:', e);
  }
}

function obtenerProjectId(): string | undefined {
  const desdeConfig = Constants.expoConfig?.extra?.eas?.projectId;
  const desdeEas = Constants.easConfig?.projectId;
  const projectId = desdeConfig || desdeEas;
  return projectId && projectId.trim().length > 0 ? projectId : undefined;
}

export async function registrarTokenPush(uid: string): Promise<string | null> {
  try {
    const Notifications = obtenerModuloNotificaciones();
    if (!Notifications) return null;

    const projectId = obtenerProjectId();
    if (!projectId) {
      console.info('push: sin projectId de EAS, se omite el registro del token.');
      return null;
    }

    const permisos = await Notifications.getPermissionsAsync();
    let estado = permisos.status;
    if (estado !== 'granted') {
      const solicitados = await Notifications.requestPermissionsAsync();
      estado = solicitados.status;
    }
    if (estado !== 'granted') {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    if (isFirebaseConfigured) {
      await setDoc(
        doc(db, 'push_tokens', token),
        {
          token,
          uid,
          plataforma: Platform.OS,
          actualizadoEn: new Date().toISOString(),
          _serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return token;
  } catch (e) {
    console.warn('registrarTokenPush:', e);
    return null;
  }
}
