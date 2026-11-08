import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { COLORS, SPLASH_DURATION_MS } from '../../theme/splash';

type SplashScreenProps = {
  /** Se invoca cuando la animación de salida terminó: hora de mostrar la app. */
  onFinish: () => void;
  /** Duración visible de la splash en milisegundos. */
  durationMs?: number;
};

/** Dimensiones nativas de la imagen de diseño. */
const SOURCE = { width: 941, height: 1672 };

/**
 * Geometría del indicador de carga, medida por píxeles sobre el PNG original
 * (el spinner fue eliminado del asset para poder animarlo por separado).
 * Si algún día se reemplaza la imagen, re-medir con scripts/splash-tool.ps1.
 */
const SPINNER = {
  cx: 470.5,
  cy: 1180,
  outerR: 57,
  stroke: 11,
  arcRatio: 0.289,
};

/** Ajuste fino en píxeles de la imagen, por si hace calibrar la posición. */
const ALIGN = { dx: 0, dy: 0 };

const SPINNER_ROTATION_MS = 900;

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/**
 * Splash screen de Atenti basada en la imagen aprobada
 * "Pantalla de inicio Atenti en azul marino.png".
 *
 * - Imagen a pantalla completa (cover centrado: sin recortar curvas ni marca de agua).
 * - Entrada: fade + leve ampliación del conjunto.
 * - Spinner: segmento verde girando continuamente sobre el anillo gris azulado.
 * - Salida: fade suave invocando `onFinish` (no bloquea el acceso a la app).
 */
export function SplashScreen({ onFinish, durationMs = SPLASH_DURATION_MS }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();

  // Cover centrado: escala para llenar la pantalla (recorta solo los lados,
  // donde las ondas y el pin de agua ya sangran fuera del lienzo por diseño).
  const scale = Math.max(width / SOURCE.width, height / SOURCE.height);
  const displayWidth = SOURCE.width * scale;
  const displayHeight = SOURCE.height * scale;
  const offsetLeft = (width - displayWidth) / 2;
  const offsetTop = (height - displayHeight) / 2;

  const [intro] = useState(() => new Animated.Value(0));
  const [fadeOut] = useState(() => new Animated.Value(1));
  const [rotation] = useState(() => new Animated.Value(0));

  // Giro continuo del segmento verde (Sección 5 del plan de diseño).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: SPINNER_ROTATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  // Entrada (fade + ampliación) y salida programada.
  useEffect(() => {
    const entry = Animated.timing(intro, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    entry.start();

    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinish();
        }
      });
    }, durationMs);

    return () => {
      clearTimeout(timer);
      entry.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Posición y tamaño del spinner en coordenadas de pantalla.
  const ringRadius = (SPINNER.outerR - SPINNER.stroke / 2) * scale;
  const ringStroke = SPINNER.stroke * scale;
  const spinnerCx = offsetLeft + (SPINNER.cx + ALIGN.dx) * scale;
  const spinnerCy = offsetTop + (SPINNER.cy + ALIGN.dy) * scale;
  const boxSize = (ringRadius + ringStroke / 2) * 2 + 4;
  const boxLeft = spinnerCx - boxSize / 2;
  const boxTop = spinnerCy - boxSize / 2;
  const arcLength = Math.PI * 2 * ringRadius * SPINNER.arcRatio;

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    // Capa base: azul de marca — evita cualquier destello blanco
    // durante el fade de salida, hasta que el Stack esté montado.
    <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.navy }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeOut }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: intro,
              transform: [
                {
                  scale: intro.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/splash-atenti.jpg')}
            style={{
              position: 'absolute',
              left: offsetLeft,
              top: offsetTop,
              width: displayWidth,
              height: displayHeight,
            }}
            resizeMode="cover"
          />

          <AnimatedSvg
            width={boxSize}
            height={boxSize}
            viewBox={`0 0 ${boxSize} ${boxSize}`}
            style={{
              position: 'absolute',
              left: boxLeft,
              top: boxTop,
              transform: [{ rotate }],
            }}
          >
            {/* Anillo base — gris azulado */}
            <Circle
              cx={boxSize / 2}
              cy={boxSize / 2}
              r={ringRadius}
              stroke={COLORS.ringGray}
              strokeWidth={ringStroke}
              fill="none"
            />
            {/* Segmento animado — verde turquesa */}
            <Circle
              cx={boxSize / 2}
              cy={boxSize / 2}
              r={ringRadius}
              stroke={COLORS.green}
              strokeWidth={ringStroke}
              strokeDasharray={`${arcLength} ${Math.PI * 2 * ringRadius - arcLength}`}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${boxSize / 2} ${boxSize / 2})`}
            />
          </AnimatedSvg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
