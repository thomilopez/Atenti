import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { DraftsListModal } from './DraftsListModal';
import { useReportFlow } from '../context/ReportFlowContext';

interface BottomNavBarProps {
  activeTab?: 'home' | 'map' | 'report' | 'stories' | 'profile';
}

/**
 * Estilos extra del navbar solo para **vista de computadora en web**
 * (navegador con ancho >= 768, el breakpoint propio de la app):
 * `order: -1` lo mueve al inicio del contenedor flex (react-native-web sí
 * compila la propiedad CSS `order`, verificado en createReactDOMStyle), el
 * borde pasa a ser inferior y se agrega padding horizontal porque va
 * fusionado con la marca Atenti y los iconos.
 *
 * En celular (nativo o navegador angosto) es `null`: la barra de pestañas
 * queda abajo con su borde superior, tal como siempre.
 */
function estilosEscritorio(): ViewStyle | null {
  if (Platform.OS !== 'web') return null;
  return {
    order: -1,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 16,
  } as ViewStyle;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'home' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loadFromDraft } = useReportFlow();
  const [showDrafts, setShowDrafts] = useState(false);
  const { width } = useWindowDimensions();

  // Vista de computadora en el navegador: barra fusionada arriba.
  // En celular (nativo o web angosto): barra de pestañas original abajo.
  const esEscritorio = Platform.OS === 'web' && width >= 768;

  return (
    <View style={[styles.container, esEscritorio && estilosEscritorio()]}>
      {/* Marca Atenti (solo web; en nativo la muestra el header de P1) */}
      {esEscritorio && (
        <TouchableOpacity
          style={styles.brand}
          onPress={() => navigation.navigate('P1_Home')}
          accessibilityRole="button"
          accessibilityLabel="Atenti - Ir al inicio"
        >
          <View style={styles.brandMini}>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Atenti</Text>
        </TouchableOpacity>
      )}

      <View style={styles.tabs}>
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

      {/* Acciones Atenti (solo web; en nativo están en el header de P1) */}
      {esEscritorio && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('P19_NotificationCenter')}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowDrafts(true)}
            accessibilityRole="button"
            accessibilityLabel="Borradores"
          >
            <Ionicons name="folder-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      )}

      {esEscritorio && (
        <DraftsListModal
          visible={showDrafts}
          onClose={() => setShowDrafts(false)}
          onSelectDraft={(draft) => {
            loadFromDraft(draft);
            setShowDrafts(false);
            navigation.navigate('P4_CreateReport');
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMini: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
