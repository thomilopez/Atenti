import { useWindowDimensions, type ViewStyle } from 'react-native';

export type Breakpoint = 'small' | 'medium' | 'large' | 'tablet';

export interface Responsive {
  width: number;
  height: number;
  fontScale: number;
  breakpoint: Breakpoint;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  gutter: number;
  contentMaxWidth?: number;
  /** Alto del preview de mapa en el inicio. */
  previewMapHeight: number;
  /** Alto del mapa a pantalla completa. */
  mapHeight: number;
  /** Alto del mapa dentro de formularios. */
  mapPickerHeight: number;
}

/**
 * Breakpoints y medidas compartidas para que la app se adapte a celulares
 * chicos, medianos, grandes y tablets (siempre en vertical).
 */
export function useResponsive(): Responsive {
  const { width, height, fontScale } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmall = width < 360;
  const isLarge = width >= 430 && !isTablet;
  const isMedium = !isSmall && !isLarge && !isTablet;

  const breakpoint: Breakpoint = isTablet
    ? 'tablet'
    : isSmall
    ? 'small'
    : isLarge
    ? 'large'
    : 'medium';

  const gutter = isSmall ? 12 : isTablet ? 24 : 16;
  const contentMaxWidth = isTablet ? 720 : undefined;

  const previewMapHeight = isTablet ? 280 : isSmall ? 150 : isLarge ? 210 : 180;
  const mapHeight = isTablet ? 560 : Math.min(460, Math.max(280, Math.round(height * 0.48)));
  const mapPickerHeight = isTablet ? 320 : isSmall ? 150 : isLarge ? 200 : 170;

  return {
    width,
    height,
    fontScale,
    breakpoint,
    isSmall,
    isMedium,
    isLarge,
    isTablet,
    gutter,
    contentMaxWidth,
    previewMapHeight,
    mapHeight,
    mapPickerHeight,
  };
}

/**
 * Estilo de "columna centrada" para pantalla ancha (computadora o tablet
 * vertical, ancho >= 768px): el contenido pasa a ocupar como maximo
 * `contentMaxWidth` (720px) y queda centrado, en lugar de estirarse hasta los
 * bordes de la ventana.
 *
 * Por debajo de 768px devuelve `maxWidth: undefined`, por lo que el estilo no
 * tiene efecto y el celular queda identico a como estaba siempre.
 *
 * `compensacionHorizontal` son los px que el elemento ya consume en margenes o
 * padding horizontal (por ejemplo 32 si tiene `paddingHorizontal: 16` o
 * `marginHorizontal: 16`); se restan para que su contenido quede alineado
 * exactamente con el de la columna (los campos usan 0 porque su padding vive
 * dentro del ancho maximo).
 *
 * Uso: `style={[styles.algo, centro]}` o `contentContainerStyle={centro}`.
 */
export function useCentro(compensacionHorizontal = 0): ViewStyle {
  const { contentMaxWidth } = useResponsive();

  return {
    width: '100%',
    maxWidth: contentMaxWidth == null ? undefined : contentMaxWidth - compensacionHorizontal,
    alignSelf: 'center',
  };
}
