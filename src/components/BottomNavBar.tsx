import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

interface BottomNavBarProps {
  activeTab?: 'home' | 'map' | 'report' | 'stories' | 'profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'home' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const hitSlop = { top: 8, bottom: 8, left: 12, right: 12 };

  const handleReportPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('P3_LegalAuth', { returnTo: 'P4_CreateReport' });
    } else {
      navigation.navigate('P4_CreateReport');
    }
  };

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

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingTop: 6,
  },
  tabItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 44,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
