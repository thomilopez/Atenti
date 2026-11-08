/**
 * Tokens de diseño de marca Atenti.
 * Compartidos por la splash screen y el resto de la app para garantizar
 * consistencia cromática (ver Plan_Diseno_Splash_Atenti.docx — Sección 4).
 */
export const COLORS = {
  /** Fondo principal — azul marino */
  navy: '#071653',
  /** Sombras / degradado — azul profundo */
  deepNavy: '#061044',
  /** Acentos y carga — verde turquesa */
  green: '#00E5A0',
  /** Texto y logo — blanco */
  white: '#FFFFFF',
  /** Anillo de carga — gris azulado */
  ringGray: '#60739D',
  /** Texto secundario sobre fondo claro */
  muted: '#6B7280',
} as const;

/** Tipografías de la app (cargadas con expo-font). */
export const FONTS = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  boldItalic: 'Poppins_700Bold_Italic',
} as const;

/** Duración total del splash animado en milisegundos (decisión: tiempo fijo). */
export const SPLASH_DURATION_MS = 2500;

/**
 * Espera máxima del splash antes de disparar el fade-out de seguridad (ms).
 * Garantiza que el spinner "nunca se pare solo": si la carga inicial se
 * cuelga, el splash se retira igual y no bloquea el acceso a la app.
 */
export const SPLASH_MAX_WAIT_MS = 8000;

/**
 * Backdrop desenfocado en pantallas anchas: intensidad del blur (1–100).
 * En web equivale a `blur(intensity * 0.2 px)` (expo-blur/BlurView.web).
 */
export const BACKDROP_BLUR_INTENSITY = 50;

/** Tinte del BlurView sobre el backdrop desenfocado. */
export const BACKDROP_TINT = 'dark';

/** Velo navy superpuesto al backdrop para que el arte nítido resalte. */
export const BACKDROP_OVERLAY = 'rgba(7, 22, 83, 0.35)';
