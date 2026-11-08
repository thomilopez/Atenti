import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ViewProps } from 'react-native';

import { COLORS } from '../../theme/splash';

/**
 * Fondo de la splash screen: degradado sutil de azul profundo a azul marino
 * (Sección 3 del plan: "Fondo azul oscuro con degradado sutil").
 * Acepta children para superponer contenido (spinner mientras cargan fuentes).
 */
export function SplashBackground({ children, style, ...rest }: ViewProps) {
  return (
    <LinearGradient
      colors={[COLORS.deepNavy, COLORS.navy]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.container, style]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
