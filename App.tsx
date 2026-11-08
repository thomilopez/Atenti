import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NativeSplashScreen from 'expo-splash-screen';
import { ConnectivityProvider } from './src/context/ConnectivityContext';
import { AuthProvider } from './src/context/AuthContext';
import { ReportFlowProvider } from './src/context/ReportFlowContext';
import { OfflineBanner } from './src/components/OfflineBanner';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingIndicator } from './src/components/splash/LoadingIndicator';
import { SplashBackground } from './src/components/splash/SplashBackground';
import { SplashScreen } from './src/components/splash/SplashScreen';
import { useAppReady } from './src/hooks/useAppReady';
import { inicializarObservabilidad } from './src/services/observability';
import { configurarNotificaciones } from './src/services/pushService';

// Mantener la splash nativa (azul marino) visible hasta que el
// primer frame de la app esté pintado → evita destellos blancos.
NativeSplashScreen.preventAutoHideAsync();

export default function App() {
  const { fontsReady, introFinished, finishIntro } = useAppReady();

  useEffect(() => {
    inicializarObservabilidad();
    configurarNotificaciones();
  }, []);

  // Ocultar la splash nativa recién cuando el splash animado ya está dibujado.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      NativeSplashScreen.hide();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // La splash animada se superpone al árbol (overlay opaco): los providers
  // siguen inicializando en paralelo durante la animación, y al terminar el
  // fade la app ya está montada debajo (sin destello blanco).
  const splashVisible = !introFinished || !fontsReady;

  return (
    <SafeAreaProvider>
      <ConnectivityProvider>
        <AuthProvider>
          <ReportFlowProvider>
            <View style={styles.root}>
              <OfflineBanner />
              <AppNavigator />
              {!introFinished && (
                <SplashScreen onFinish={finishIntro} ready={fontsReady} />
              )}
              {introFinished && !fontsReady && (
                <SplashBackground style={StyleSheet.absoluteFill}>
                  <LoadingIndicator />
                </SplashBackground>
              )}
            </View>
            {/* Íconos claros sobre la splash azul marino, oscuros en la app. */}
            <StatusBar style={splashVisible ? 'light' : 'dark'} />
          </ReportFlowProvider>
        </AuthProvider>
      </ConnectivityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
