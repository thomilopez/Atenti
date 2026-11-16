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
  /**
   * Key para la Maps JavaScript API en navegador. La de arriba está restringida
   * a la app Android (paquete + SHA-1), así que Google rechaza los tiles desde
   * web. Si falta, se cae a `googleMapsApiKey`.
   */
  googleMapsWebApiKey: string;
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
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  );
}

/** Indica si las credenciales de RENAPER están disponibles. */
export function hasRenaperConfig(): boolean {
  return (
    process.env.EXPO_PUBLIC_RENAPER_ENABLED === 'true' &&
    Boolean(process.env.EXPO_PUBLIC_RENAPER_API_KEY)
  );
}

export function loadEnv(): AtentiEnv {
  const parsed = Number(process.env.EXPO_PUBLIC_RATE_LIMIT_DAILY);
  const rateLimitDaily =
    Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_RATE_LIMIT_DAILY;

  return {
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
    },
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    googleMapsWebApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY || '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    rateLimitDaily,
    renaper: {
      enabled: process.env.EXPO_PUBLIC_RENAPER_ENABLED === 'true',
      endpoint: process.env.EXPO_PUBLIC_RENAPER_ENDPOINT || '',
      apiKey: process.env.EXPO_PUBLIC_RENAPER_API_KEY || '',
    },
    cloudFunctionsBaseUrl: process.env.EXPO_PUBLIC_CLOUD_FUNCTIONS_BASE_URL || '',
    functionsRegion: process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION || 'us-central1',
    adminEmails: (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  };
}

export const env = loadEnv();
