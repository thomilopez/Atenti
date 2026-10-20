/**
 * Configuración central de entorno de Atenti.
 *
 * Centraliza las credenciales de los servicios externos para no exponerlas en
 * el código fuente. En Expo, las variables con prefijo `EXPO_PUBLIC_` se
 * inyectan en tiempo de build (ver https://docs.expo.dev/versions/v57.0.0/).
 *
 * Si las variables de Firebase no están definidas, la app arranca en modo demo
 * con el fallback en memoria (`hasRealFirebaseConfig() === false`).
 */

export interface AtentiEnv {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  googleMapsApiKey: string;
  googleWebClientId: string;
  /** RF-090: máximo de denuncias por usuario por día. */
  rateLimitDaily: number;
  renaper: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
  };
  cloudFunctionsBaseUrl: string;
  functionsRegion: string;
  /** Emails autorizados a ver el panel de administración (temporal, RF-015 pendiente). */
  adminEmails: string[];
  sentryDsn: string;
}

/** Límite por defecto de denuncias diarias por usuario (RF-090). */
export const DEFAULT_RATE_LIMIT_DAILY = 10;

function read(name: string): string {
  const value = process.env[name];
  return (value ?? '').trim();
}

/** Indica si hay credenciales reales de Firebase configuradas. */
export function hasRealFirebaseConfig(): boolean {
  return Boolean(
    read('EXPO_PUBLIC_FIREBASE_API_KEY') &&
      read('EXPO_PUBLIC_FIREBASE_PROJECT_ID') &&
      read('EXPO_PUBLIC_FIREBASE_APP_ID')
  );
}

/** Indica si las credenciales de RENAPER están disponibles. */
export function hasRenaperConfig(): boolean {
  return read('EXPO_PUBLIC_RENAPER_ENABLED') === 'true' && Boolean(read('EXPO_PUBLIC_RENAPER_API_KEY'));
}

export function loadEnv(): AtentiEnv {
  const parsed = Number(read('EXPO_PUBLIC_RATE_LIMIT_DAILY'));
  const rateLimitDaily =
    Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_RATE_LIMIT_DAILY;

  return {
    firebase: {
      apiKey: read('EXPO_PUBLIC_FIREBASE_API_KEY'),
      authDomain: read('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: read('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: read('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: read('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: read('EXPO_PUBLIC_FIREBASE_APP_ID'),
    },
    googleMapsApiKey: read('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'),
    googleWebClientId: read('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
    rateLimitDaily,
    renaper: {
      enabled: read('EXPO_PUBLIC_RENAPER_ENABLED') === 'true',
      endpoint: read('EXPO_PUBLIC_RENAPER_ENDPOINT'),
      apiKey: read('EXPO_PUBLIC_RENAPER_API_KEY'),
    },
    cloudFunctionsBaseUrl: read('EXPO_PUBLIC_CLOUD_FUNCTIONS_BASE_URL'),
    functionsRegion: read('EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION') || 'us-central1',
    adminEmails: read('EXPO_PUBLIC_ADMIN_EMAILS')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    sentryDsn: read('EXPO_PUBLIC_SENTRY_DSN'),
  };
}

export const env = loadEnv();
