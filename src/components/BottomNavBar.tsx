import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';

interface BottomNavBarProps {
  activeTab?: 'home' | 'map' | 'report' | 'profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'home' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const hitSlop = { top: 8, bottom: 8, left: 12, right: 12 };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          hitSlop={hitSlop}
          onPress={() => navigation.navigate('P1_Home')}
          accessibilityRole="button"
          accessibilityLabel="Inicio"
        >
          <Ionicons
            name={activeTab === 'home' ? 'grid' : 'grid-outline'}
            size={22}
            color={activeTab === 'home' ? '#0F172A' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && styles.tabLabelActive,
            ]}
          >
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          hitSlop={hitSlop}
          onPress={() => navigation.navigate('P1_Home')}
          accessibilityRole="button"
          accessibilityLabel="Mapa"
        >
          <Ionicons
            name={activeTab === 'map' ? 'map' : 'map-outline'}
            size={22}
            color={activeTab === 'map' ? '#0F172A' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'map' && styles.tabLabelActive,
            ]}
          >
            Mapa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          hitSlop={hitSlop}
          onPress={() => navigation.navigate('P4_CreateReport')}
          accessibilityRole="button"
          accessibilityLabel="Reportar"
        >
          <Ionicons
            name={activeTab === 'report' ? 'add-circle' : 'add-circle-outline'}
            size={24}
            color={activeTab === 'report' ? '#0F172A' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'report' && styles.tabLabelActive,
            ]}
          >
            Reportar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          hitSlop={hitSlop}
          onPress={() => navigation.navigate('P9_CredibilityPanel')}
          accessibilityRole="button"
          accessibilityLabel="Perfil"
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#0F172A' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
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
