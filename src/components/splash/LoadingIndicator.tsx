import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { COLORS } from '../../theme/splash';

type LoadingIndicatorProps = {
  /** Tamaño del indicador en píxeles. */
  size?: number;
};

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/**
 * Indicador circular de carga: anillo gris azulado con un segmento
 * verde turquesa en rotación continua (Sección 5 del plan).
 */
export function LoadingIndicator({ size = 48 }: LoadingIndicatorProps) {
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const stroke = Math.max(4, size * 0.11);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.28;

  return (
    <AnimatedSvg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: [{ rotate }] }}
    >
      {/* Anillo base — gris azulado */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={COLORS.ringGray}
        strokeWidth={stroke}
        fill="none"
      />
      {/* Segmento animado — verde turquesa */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={COLORS.green}
        strokeWidth={stroke}
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </AnimatedSvg>
  );
}
