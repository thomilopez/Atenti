import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const PASOS: Array<{ icono: keyof typeof Ionicons.glyphMap; titulo: string; detalle: string }> = [
  {
    icono: 'search-outline',
    titulo: '1. Buscá un identificador',
    detalle: 'Escribí un Alias, CBU, CUIT, teléfono o local para ver antecedentes.',
  },
  {
    icono: 'warning-outline',
    titulo: '2. Reportá una estafa',
    detalle: 'Contá qué pasó, sumá evidencias y fijá la ubicación del hecho.',
  },
  {
    icono: 'people-outline',
    titulo: '3. Sumá a la comunidad',
    detalle: 'Compartí formas de estafar y corroborá reportes de otros usuarios.',
  },
];

/** Modal de ayuda rapida del inicio. */
export const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>¿Cómo funciona?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {PASOS.map((paso) => (
            <View key={paso.titulo} style={styles.step}>
              <View style={styles.iconCircle}>
                <Ionicons name={paso.icono} size={20} color="#0F172A" />
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{paso.titulo}</Text>
                <Text style={styles.stepDetail}>{paso.detalle}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.okBtn} onPress={onClose}>
            <Text style={styles.okBtnText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepDetail: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  okBtn: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  okBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
