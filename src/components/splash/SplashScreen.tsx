import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';

import {
  BACKDROP_BLUR_INTENSITY,
  BACKDROP_OVERLAY,
  BACKDROP_TINT,
  COLORS,
  SPLASH_DURATION_MS,
  SPLASH_MAX_WAIT_MS,
} from '../../theme/splash';
import { computeSplashBackdrop, computeSplashLayout } from './layout';
import { SplashBackground } from './SplashBackground';

type SplashScreenProps = {
  /** Se invoca cuando la animación de salida terminó: hora de mostrar la app. */
  onFinish: () => void;
  /** Duración visible mínima de la splash en milisegundos. */
  durationMs?: number;
  /**
   * `true` cuando terminó todo lo asíncrono (fuentes, etc.). El fade-out
   * solo se dispara con `ready` → el spinner gira sin cortes desde el
   * primer frame hasta que la app realmente está lista. Red de seguridad:
   * `maxWaitMs` retira el splash aunque `ready` nunca llegue.
   */
  ready?: boolean;
  /** Espera máxima antes del fade-out si `ready` nunca llega (ms). */
  maxWaitMs?: number;
};

const SPINNER_ROTATION_MS = 900;

/**
 * Web NO tiene el módulo de Animated nativo: con `useNativeDriver: true`
 * `Animated.loop()` delega en un driver que nunca arranca, la animación
 * corre UNA sola vez (900 ms) y el spinner queda congelado para siempre.
 * Con driver JS el loop usa la rama de reinicio → bucle infinito real;
 * en nativo se conserva el driver nativo (60 fps, sin re-renders).
 * De paso elimina el warning "useNativeDriver is not supported" en web.
 */
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/**
 * Splash screen de Atenti basada en la imagen aprobada
 * "Pantalla de inicio Atenti en azul marino.png".
 *
 * - Responsive: en móviles la imagen cubre la pantalla completa (cover);
 *   en pantallas anchas (tablets apaisadas, web, escritorio) se muestra
 *   completa y centrada (contain) sobre un backdrop desenfocado del
 *   mismo arte que llena TODOS los bordes de la página.
 * - Entrada: fade + leve ampliación del conjunto.
 * - Spinner: segmento verde girando continuamente (sin pararse) hasta que
 *   `ready` indique que todo cargó.
 * - Salida: fade suave invocando `onFinish` (no bloquea el acceso a la app).
 */
export function SplashScreen({
  onFinish,
  durationMs = SPLASH_DURATION_MS,
  ready = true,
  maxWaitMs = SPLASH_MAX_WAIT_MS,
}: SplashScreenProps) {
  const { width, height } = useWindowDimensions();

  // Geometría responsive: cover en móviles (pantalla completa) y
  // contain en pantallas anchas (imagen completa centrada, ver layout.ts).
  const layout = computeSplashLayout(width, height);
  const {
    mode,
    displayWidth,
    displayHeight,
    offsetLeft,
    offsetTop,
    boxSize,
    ringRadius,
    ringStroke,
    spinnerCx,
    spinnerCy,
    arcLength,
  } = layout;

  // Backdrop desenfocado solo en modo contain: en cover la imagen ya
  // llena la pantalla y no hay costados que rellenar.
  const backdrop = mode === 'contain' ? computeSplashBackdrop(width, height) : null;

  const [intro] = useState(() => new Animated.Value(0));
  const [fadeOut] = useState(() => new Animated.Value(1));
  const [rotation] = useState(() => new Animated.Value(0));

  const startedAtRef = useRef(Date.now());
  const exitStartedRef = useRef(false);

  // Giro continuo del segmento verde (Sección 5 del plan de diseño).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: SPINNER_ROTATION_MS,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  // Entrada: fade + leve ampliación del conjunto.
  useEffect(() => {
    const entry = Animated.timing(intro, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    entry.start();
    return () => entry.stop();
  }, [intro]);

  const startExit = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 350,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });
  }, [fadeOut, onFinish]);

  // Salida programada: el spinner NUNCA se para solo. El fade recién se
  // dispara cuando transcurrió `durationMs` Y `ready` es true (todo cargó);
  // si `ready` nunca llega, la red de seguridad `maxWaitMs` lo retira igual.
  useEffect(() => {
    if (exitStartedRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    const wait = Math.max(0, (ready ? durationMs : maxWaitMs) - elapsed);
    const timer = setTimeout(startExit, wait);
    return () => clearTimeout(timer);
  }, [ready, durationMs, maxWaitMs, startExit]);

  // Posición de la caja del spinner (la geometría viene del layout).
  const boxLeft = spinnerCx - boxSize / 2;
  const boxTop = spinnerCy - boxSize / 2;

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    // Capa base: azul de marca — evita cualquier destello blanco
    // durante el fade de salida, hasta que el Stack esté montado.
    // `overflow: hidden` recorta el backdrop (que sobresale a propósito
    // por el overscan) para que no desborde el documento en web.
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: COLORS.navy, overflow: 'hidden' },
      ]}
    >
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
          {/* Letterbox en modo contain (tablets apaisadas, web, escritorio):
              degradado de marca como base mientras carga la imagen. */}
          {mode === 'contain' && <SplashBackground style={StyleSheet.absoluteFill} />}

          {/* Backdrop en modo contain: el mismo arte en cover × overscan
              llena el 100% de los bordes de la página, se desenfoca y se
              oscurece para que el arte nítido centrado resalte. Sin él,
              los costados quedan como paneles planos "cortados". */}
          {backdrop && (
            <>
              <Image
                source={require('../../../assets/splash-atenti.jpg')}
                style={{
                  position: 'absolute',
                  left: backdrop.offsetLeft,
                  top: backdrop.offsetTop,
                  width: backdrop.displayWidth,
                  height: backdrop.displayHeight,
                }}
                resizeMode="cover"
              />
              {/* Desenfoque uniforme: web usa CSS backdrop-filter,
                  iOS el blur nativo, Android una capa semitransparente. */}
              <BlurView
                intensity={BACKDROP_BLUR_INTENSITY}
                tint={BACKDROP_TINT}
                style={StyleSheet.absoluteFill}
              />
              {/* Velo navy para bajar el contraste del backdrop. */}
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: BACKDROP_OVERLAY }]}
              />
            </>
          )}

          {/* Arte nítido centrado (arriba de todo el backdrop). */}
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
