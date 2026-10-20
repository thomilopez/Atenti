import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface BottomNavBarProps {
  activeTab?: 'home' | 'map' | 'report' | 'profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'home' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('P1_Home')}
        accessibilityRole="button"
        accessibilityLabel="Inicio"
      >
        <Ionicons
          name={activeTab === 'home' ? 'grid' : 'grid-outline'}
          size={22}
          color={activeTab === 'home' ? '#000000' : '#94A3B8'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('P1_Home')}
        accessibilityRole="button"
        accessibilityLabel="Mapa de denuncias"
      >
        <Ionicons
          name={activeTab === 'map' ? 'map' : 'map-outline'}
          size={22}
          color={activeTab === 'map' ? '#000000' : '#94A3B8'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('P4_CreateReport')}
        accessibilityRole="button"
        accessibilityLabel="Crear reporte"
      >
        <Ionicons
          name={activeTab === 'report' ? 'add-circle' : 'add-circle-outline'}
          size={24}
          color={activeTab === 'report' ? '#000000' : '#94A3B8'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('P9_CredibilityPanel')}
        accessibilityRole="button"
        accessibilityLabel="Mi credibilidad"
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profile' ? '#000000' : '#94A3B8'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tabItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
