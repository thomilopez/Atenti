import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectivity } from '../context/ConnectivityContext';

/** RF-053: banner superior que aparece al perder conexión. */
export const OfflineBanner: React.FC = () => {
  const { isConnected } = useConnectivity();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#7C2D12" />
      <Text style={styles.text}>Modo fuera de línea activo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FDBA74',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C2D12',
  },
});
