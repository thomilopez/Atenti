import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationData } from '../types';
import { MapViewWrapper } from './MapViewWrapper';
import {
  componerDireccion,
  geocodificarDireccion,
  ubicacionConDireccion,
} from '../services/locationService';

interface MapPickerModalProps {
  visible: boolean;
  initial?: LocationData;
  onClose: () => void;
  onConfirm: (location: LocationData) => void;
}

/** Modal a pantalla completa para ajustar la ubicacion con buscador interno. */
export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  initial,
  onClose,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<LocationData | undefined>(initial);
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelected(initial);
      setQuery(initial?.address ?? '');
    }
  }, [visible, initial]);

  const handleBuscar = async () => {
    if (!query.trim()) return;
    setBuscando(true);
    const loc = await geocodificarDireccion(query);
    setBuscando(false);
    if (!loc) {
      Alert.alert(
        'Dirección no encontrada',
        'Probá con calle, número y localidad. También podés tocar el mapa.'
      );
      return;
    }
    setSelected(loc);
  };

  const handleMapSelect = async (loc: LocationData) => {
    const conDireccion = await ubicacionConDireccion(loc);
    setSelected(conDireccion);
    setQuery(conDireccion.address);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>Ubicación del reporte</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Calle, número, localidad..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar} disabled={buscando}>
            {buscando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchBtnText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapViewWrapper
            selectedLocation={selected}
            draggablePin
            onSelectLocation={handleMapSelect}
            centerLatitude={selected?.latitude ?? -34.6037}
            centerLongitude={selected?.longitude ?? -58.3816}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.address} numberOfLines={2}>
            {selected ? componerDireccion(selected) : 'Elegí un punto en el mapa o buscá una dirección'}
          </Text>
          <TouchableOpacity
            style={[styles.confirmBtn, !selected && styles.disabled]}
            disabled={!selected}
            onPress={() => selected && onConfirm(selected)}
          >
            <Text style={styles.confirmText}>Confirmar ubicación</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  searchBtn: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  mapContainer: { flex: 1, backgroundColor: '#E2E8F0' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  address: { fontSize: 13, color: '#334155', marginBottom: 10 },
  confirmBtn: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
