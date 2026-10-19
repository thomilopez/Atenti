import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ConnectivityProvider } from './src/context/ConnectivityContext';
import { AuthProvider } from './src/context/AuthContext';
import { ReportFlowProvider } from './src/context/ReportFlowContext';
import { OfflineBanner } from './src/components/OfflineBanner';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ConnectivityProvider>
        <AuthProvider>
          <ReportFlowProvider>
            <View style={styles.root}>
              <OfflineBanner />
              <AppNavigator />
            </View>
            <StatusBar style="dark" />
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
