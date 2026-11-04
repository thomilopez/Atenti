import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface BottomNavBarProps {
  activeTab?: 'home' | 'map' | 'report' | 'stories' | 'profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'home' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.container, webContainer]}>
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
        onPress={() => navigation.navigate('P31_FullMap')}
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
        onPress={() => navigation.navigate('P27_StoriesFeed')}
        accessibilityRole="button"
        accessibilityLabel="Historias de estafas"
      >
        <Ionicons
          name={activeTab === 'stories' ? 'newspaper' : 'newspaper-outline'}
          size={22}
          color={activeTab === 'stories' ? '#000000' : '#94A3B8'}
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

/**
 * En web el navbar se muestra arriba: `order: -1` lo mueve al inicio del
 * contenedor flex (react-native-web sí compila la propiedad CSS `order`,
 * verificado en createReactDOMStyle). El borde pasa a ser inferior para
 * quedar hacia el contenido. En nativo es `null` y no tiene efecto.
 */
const webContainer = (
  Platform.OS === 'web'
    ? {
        order: -1,
        borderTopWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
      }
    : null
) as ViewStyle | null;

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
