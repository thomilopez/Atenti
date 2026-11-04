/**
 * Parche de Alert.alert para react-native-web.
 *
 * react-native-web 0.21.0 exporta un `Alert.alert()` vacío (no-op): los 40+
 * mensajes de la app (validaciones, errores de login, confirmaciones)
 * simplemente no aparecerían en el navegador. Este módulo lo reemplaza en web
 * por `window.alert` / `window.confirm`, conservando el contrato de la API de
 * React Native (título, mensaje, botones con onPress y style 'cancel').
 *
 * En plataformas nativas no hace nada: se usa el Alert del sistema.
 *
 * Uso: importar este módulo una sola vez, antes de renderizar la app
 * (ver `index.ts`).
 */
import { Alert, Platform, type AlertButton, type AlertOptions } from 'react-native';

type WebAlertButton = AlertButton & { text?: string };

function botonAccionario(buttons: WebAlertButton[]): {
  confirmar?: WebAlertButton;
  cancelar?: WebAlertButton;
} {
  // RN por defecto toma el último botón como acción primaria; el estilo
  // 'cancel' es el de cancelación.
  const cancelar = buttons.find((b) => b.style === 'cancel');
  const confirmar = buttons.find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];
  return { confirmar, cancelar };
}

function alertWeb(
  title: string,
  message?: string,
  buttons?: WebAlertButton[],
  _options?: AlertOptions
): void {
  const texto = [title, message].filter(Boolean).join('\n');

  // Sin botones o sin callbacks: alert simple.
  if (!buttons || buttons.length === 0 || buttons.every((b) => typeof b.onPress !== 'function')) {
    window.alert(texto);
    buttons?.[0]?.onPress?.();
    return;
  }

  // Un solo botón con acción: alert + callback.
  if (buttons.length === 1) {
    window.alert(texto);
    buttons[0].onPress?.();
    return;
  }

  // Dos o más botones: confirm (primario) vs cancelar.
  const { confirmar, cancelar } = botonAccionario(buttons);
  const aceptado = window.confirm(texto);
  if (aceptado) {
    confirmar?.onPress?.();
  } else {
    cancelar?.onPress?.();
  }
}

/**
 * Instala el reemplazo de Alert.alert en web. Idempotente.
 */
export function patchAlertForWeb(): void {
  if (Platform.OS !== 'web') return;
  (Alert as unknown as { alert: typeof alertWeb }).alert = alertWeb;
}
