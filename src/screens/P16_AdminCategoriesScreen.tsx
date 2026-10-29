import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { CategoriaTipo } from '../services/normalize';
import {
  listarTodasCategorias,
  crearCategoria,
  editarCategoria,
  cambiarEstadoCategoria,
} from '../services/categoryService';

type Props = NativeStackScreenProps<RootStackParamList, 'P16_AdminCategories'>;

const ICONOS = [
  'pricetag-outline',
  'card-outline',
  'mail-unread-outline',
  'storefront-outline',
  'business-outline',
  'person-circle-outline',
  'trending-up-outline',
  'cash-outline',
  'headset-outline',
  'briefcase-outline',
  'heart-dislike-outline',
  'repeat-outline',
  'logo-bitcoin',
  'cube-outline',
  'receipt-outline',
  'finger-print-outline',
  'alert-circle-outline',
];

const COLORES = [
  '#DC2626',
  '#7C3AED',
  '#0EA5E9',
  '#F59E0B',
  '#EF4444',
  '#16A34A',
  '#F97316',
  '#2563EB',
  '#9333EA',
  '#DB2777',
  '#0891B2',
  '#0F172A',
];

export const P16_AdminCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categorias, setCategorias] = useState<CategoriaTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [requiereUbicacion, setRequiereUbicacion] = useState(false);
  const [icono, setIcono] = useState('pricetag-outline');
  const [color, setColor] = useState('#0F172A');

  const cargar = useCallback(async () => {
    setLoading(true);
    setCategorias(await listarTodasCategorias());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const abrirNueva = () => {
    setEditandoId(null);
    setNombre('');
    setRequiereUbicacion(false);
    setIcono('pricetag-outline');
    setColor('#0F172A');
    setModalVisible(true);
  };

  const abrirEdicion = (cat: CategoriaTipo) => {
    setEditandoId(cat.id);
    setNombre(cat.nombre);
    setRequiereUbicacion(cat.requiereUbicacion);
    setIcono(cat.icono ?? 'pricetag-outline');
    setColor(cat.color ?? '#0F172A');
    setModalVisible(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Nombre requerido', 'Ingresá el nombre de la categoría.');
      return;
    }
    try {
      if (editandoId) {
        await editarCategoria(editandoId, {
          nombre: nombre.trim(),
          requiereUbicacion,
          icono,
          color,
        });
      } else {
        await crearCategoria({ nombre: nombre.trim(), requiereUbicacion, icono, color });
      }
      setModalVisible(false);
      await cargar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la categoría.');
    }
  };

  const toggleActiva = async (cat: CategoriaTipo) => {
    await cambiarEstadoCategoria(cat.id, !cat.activa);
    await cargar();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Categorías</Text>
        <TouchableOpacity onPress={abrirNueva} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : (
          categorias.map((cat) => (
            <View key={cat.id} style={styles.row}>
              <TouchableOpacity style={styles.rowInfo} onPress={() => abrirEdicion(cat)}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons
                    name={(cat.icono ?? 'pricetag-outline') as any}
                    size={18}
                    color={cat.color ?? '#0F172A'}
                    style={styles.rowIcon}
                  />
                  <Text style={styles.rowTitle}>{cat.nombre}</Text>
                </View>
                <Text style={styles.rowSubtitle}>
                  {cat.requiereUbicacion ? 'Requiere ubicación' : 'Sin ubicación obligatoria'}
                </Text>
              </TouchableOpacity>
              <Switch
                value={cat.activa}
                onValueChange={() => toggleActiva(cat)}
                trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                thumbColor={cat.activa ? '#059669' : '#F8FAFC'}
              />
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editandoId ? 'Editar categoría' : 'Nueva categoría'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#94A3B8"
              value={nombre}
              onChangeText={setNombre}
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Requiere ubicación obligatoria</Text>
              <Switch value={requiereUbicacion} onValueChange={setRequiereUbicacion} />
            </View>

            <Text style={styles.pickerLabel}>Ícono</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconPickerRow}
            >
              {ICONOS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconOption,
                    icono === ic && { borderColor: color, backgroundColor: `${color}18` },
                  ]}
                  onPress={() => setIcono(ic)}
                >
                  <Ionicons name={ic as any} size={20} color={icono === ic ? color : '#475569'} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.pickerLabel}>Color</Text>
            <View style={styles.colorPickerRow}>
              {COLORES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={guardar}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowInfo: { flex: 1, paddingRight: 12 },
  rowTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 8 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  rowSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  switchLabel: { flex: 1, fontSize: 13, color: '#334155' },
  pickerLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  iconPickerRow: { gap: 8, paddingBottom: 12 },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  colorDotActive: { borderColor: '#0F172A' },
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  cancelBtn: { marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
});
