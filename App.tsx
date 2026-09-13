import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ReportFlowProvider } from './src/context/ReportFlowContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
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
