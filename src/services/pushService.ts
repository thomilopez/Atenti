/**
 * Push notifications (RF-077 a RF-079).
 *
 * Registra el token de Expo del dispositivo y configura el handler. El envio
 * real lo hace una Cloud Function al crearse una notificacion in-app.
 */
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function configurarNotificaciones(): Promise<void> {
  try {
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
