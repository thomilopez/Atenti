/**
 * Observabilidad (RF-096).
 *
 * Inicializa la captura de errores. Si hay DSN configurado, queda lista para
 * conectar Sentry; sin DSN, registra localmente sin romper la app.
 */
import { env } from './env';

let inicializado = false;

export function inicializarObservabilidad(): void {
  if (inicializado) return;
  inicializado = true;

  // Handler global de errores no controlados (React Native).
  const errorUtils = (global as unknown as {
    ErrorUtils?: {
      getGlobalHandler?: () => (error: unknown, isFatal?: boolean) => void;
      setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
    };
  }).ErrorUtils;

  if (errorUtils?.setGlobalHandler) {
    const anterior = errorUtils.getGlobalHandler?.();
    errorUtils.setGlobalHandler((error, isFatal) => {
      capturarError(error, { isFatal: Boolean(isFatal) });
      anterior?.(error, isFatal);
    });
  }

  if (!env.sentryDsn) {
    console.info('Observabilidad: modo local (sin EXPO_PUBLIC_SENTRY_DSN).');
  }
}

export function capturarError(error: unknown, contexto?: Record<string, unknown>): void {
  console.warn('[observability]', error, contexto ?? {});
}
