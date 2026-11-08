/**
 * Geometría de la splash screen — módulo puro (sin React ni RN).
 *
 * Se extrae a un módulo independiente para que `scripts/verify-splash.js`
 * ejecute EXACTAMENTE la misma fórmula que usa la app (una sola fuente
 * de verdad): el script transpila este archivo con `typescript` y corre
 * la matriz de viewports contra él.
 */

/** Dimensiones nativas de la imagen de diseño. */
export const SOURCE = { width: 941, height: 1672 };

/**
 * Geometría del indicador de carga, medida por píxeles sobre el PNG original
 * (el spinner fue eliminado del asset para poder animarlo por separado).
 * Si algún día se reemplaza la imagen, re-medir con scripts/splash-tool.ps1.
 */
export const SPINNER = {
  cx: 470.5,
  cy: 1180,
  outerR: 57,
  stroke: 11,
  arcRatio: 0.289,
};

/** Ajuste fino en píxeles de la imagen, por si hace calibrar la posición. */
export const ALIGN = { dx: 0, dy: 0 };

/**
 * Tolerancia del modo cover: si la pantalla es como mucho 15% más ancha
 * (proporcionalmente) que la imagen, se usa cover — los móviles incluso
 * ligeramente anchos quedan a pantalla completa sin barras laterales.
 */
export const COVER_TOLERANCE = 1.15;

/**
 * Overscan del backdrop desenfocado: la capa de fondo se dibuja un 15%
 * más grande que el viewport para que el desenfoque (que muestrea los
 * píxeles vecinos) jamás transparente los bordes del lienzo.
 */
export const BACKDROP_OVERSCAN = 1.15;

/** Proporción de la imagen de diseño (ancho / alto). */
const IMAGE_ASPECT = SOURCE.width / SOURCE.height;

export type SplashLayoutMode = 'cover' | 'contain';

export type SplashLayout = {
  /** Estrategia de ajuste elegida para este viewport. */
  mode: SplashLayoutMode;
  /** Factor de escala aplicado a la imagen (y a la geometría del spinner). */
  scale: number;
  /** Tamaño final de la imagen en pantalla. */
  displayWidth: number;
  displayHeight: number;
  /** Posición de la esquina superior izquierda de la imagen. */
  offsetLeft: number;
  offsetTop: number;
  /** Centro del spinner en coordenadas de pantalla. */
  spinnerCx: number;
  spinnerCy: number;
  /** Caja cuadrada que contiene el anillo del spinner. */
  boxSize: number;
  ringRadius: number;
  ringStroke: number;
  /** Longitud del arco verde (segmento animado). */
  arcLength: number;
};

/**
 * Decide si un viewport usa cover (recorte lateral, pantalla completa)
 * o contain (imagen completa centrada con letterbox de marca).
 */
export function isSplashCoverMode(screenWidth: number, screenHeight: number): boolean {
  const screenAspect = screenWidth / screenHeight;
  return screenAspect <= IMAGE_ASPECT * COVER_TOLERANCE;
}

export type SplashBackdrop = {
  /** Factor de escala aplicado a la imagen del backdrop. */
  scale: number;
  /** Tamaño final de la imagen en pantalla. */
  displayWidth: number;
  displayHeight: number;
  /** Esquina superior izquierda (negativa: sobresale por el overscan). */
  offsetLeft: number;
  offsetTop: number;
};

/**
 * Geometría de la capa de fondo desenfocada (solo modo contain).
 *
 * Usa modo **cover** (llena el viewport sin barras) ampliado con
 * `BACKDROP_OVERSCAN` para que el blur nunca muestre transparencias.
 * En pantallas anchas esto rellena el 100% de los bordes de la página
 * y el arte nítido queda centrado encima.
 */
export function computeSplashBackdrop(
  screenWidth: number,
  screenHeight: number,
  source = SOURCE,
  overscan = BACKDROP_OVERSCAN,
): SplashBackdrop {
  const scale =
    Math.max(screenWidth / source.width, screenHeight / source.height) * overscan;
  const displayWidth = source.width * scale;
  const displayHeight = source.height * scale;

  return {
    scale,
    displayWidth,
    displayHeight,
    offsetLeft: (screenWidth - displayWidth) / 2,
    offsetTop: (screenHeight - displayHeight) / 2,
  };
}

/**
 * Calcula toda la geometría de la splash para un viewport dado.
 *
 * - **cover**: la imagen llena la pantalla (recorta solo los lados, donde
 *   las ondas y la marca de agua ya sangran fuera del lienzo por diseño).
 * - **contain**: la pantalla es más ancha que la imagen (tablets apaisadas,
 *   web, escritorio) → se muestra la imagen COMPLETA centrada y el resto
 *   se rellena con el degradado de marca. El spinner, al estar dentro de
 *   la imagen, nunca queda fuera de pantalla.
 */
export function computeSplashLayout(
  screenWidth: number,
  screenHeight: number,
  source = SOURCE,
  spinner = SPINNER,
  align = ALIGN,
): SplashLayout {
  const mode: SplashLayoutMode = isSplashCoverMode(screenWidth, screenHeight)
    ? 'cover'
    : 'contain';

  const scale =
    mode === 'cover'
      ? Math.max(screenWidth / source.width, screenHeight / source.height)
      : Math.min(screenWidth / source.width, screenHeight / source.height);

  const displayWidth = source.width * scale;
  const displayHeight = source.height * scale;
  const offsetLeft = (screenWidth - displayWidth) / 2;
  const offsetTop = (screenHeight - displayHeight) / 2;

  // Spinner: se expresa en coordenadas de la imagen y se proyecta a pantalla.
  const ringRadius = (spinner.outerR - spinner.stroke / 2) * scale;
  const ringStroke = spinner.stroke * scale;
  const spinnerCx = offsetLeft + (spinner.cx + align.dx) * scale;
  const spinnerCy = offsetTop + (spinner.cy + align.dy) * scale;
  const boxSize = (ringRadius + ringStroke / 2) * 2 + 4;
  const arcLength = Math.PI * 2 * ringRadius * spinner.arcRatio;

  return {
    mode,
    scale,
    displayWidth,
    displayHeight,
    offsetLeft,
    offsetTop,
    spinnerCx,
    spinnerCy,
    boxSize,
    ringRadius,
    ringStroke,
    arcLength,
  };
}
