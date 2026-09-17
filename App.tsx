import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { ReportFlowProvider } from './src/context/ReportFlowContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Mantener la pantalla de splash visible hasta que la app esté lista
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignora si ya está oculta o no soportado */
});

export default function App() {
  useEffect(() => {
    // Ocultar la pantalla de bienvenida nativa tras la inicialización
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // En web o entornos simulados
      }
    };
    hideSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ReportFlowProvider>
          <AppNavigator />
          <StatusBar style="dark" />
        </ReportFlowProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}