import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  PreferenciasNotificacion,
  PREFERENCIAS_DEFAULT,
  cargarPreferencias,
  guardarPreferencias,
} from '../services/notificationPreferences';

type Props = NativeStackScreenProps<RootStackParamList, 'P26_NotificationPreferences'>;

export const P26_NotificationPreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PreferenciasNotificacion>(PREFERENCIAS_DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    cargarPreferencias(user?.uid ?? 'anonimo').then((p) => {
      if (activo) {
        setPrefs(p);
        setLoading(false);
      }
    });
    return () => {
      activo = false;
    };
  }, [user?.uid]);

  const cambiar = async (clave: keyof PreferenciasNotificacion, valor: boolean) => {
    const nuevas = { ...prefs, [clave]: valor };
    setPrefs(nuevas);
    await guardarPreferencias(user?.uid ?? 'anonimo', nuevas);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Preferencias</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
      ) : (
        <View style={styles.content}>
          <Fila
            titulo="Cambios de estado"
            descripcion="Publicada, en disputa o resuelta."
            valor={prefs.estado}
            onValueChange={(v) => cambiar('estado', v)}
          />
          <Fila
            titulo="Corroboraciones"
            descripcion="Cuando otro usuario reporta el mismo objetivo."
            valor={prefs.corroboracion}
            onValueChange={(v) => cambiar('corroboracion', v)}
          />
          <Fila
            titulo="Resolución de disputas"
            descripcion="Cuando se resuelve una impugnación."
            valor={prefs.resolucion}
            onValueChange={(v) => cambiar('resolucion', v)}
          />
          <Fila
            titulo="Relatos de estafas"
            descripcion="Cuando se publica un relato de una categoría que seguís."
            valor={prefs.relatos}
            onValueChange={(v) => cambiar('relatos', v)}
          />

          <Text style={styles.note}>
            Las notificaciones in-app siempre se guardan. El push requiere un
            development build y el projectId de EAS configurado.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const Fila: React.FC<{
  titulo: string;
  descripcion: string;
  valor: boolean;
  onValueChange: (v: boolean) => void;
}> = ({ titulo, descripcion, valor, onValueChange }) => (
  <View style={styles.fila}>
    <View style={styles.filaInfo}>
      <Text style={styles.filaTitulo}>{titulo}</Text>
      <Text style={styles.filaDesc}>{descripcion}</Text>
    </View>
    <Switch value={valor} onValueChange={onValueChange} />
  </View>
);

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
  content: { padding: 16 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filaInfo: { flex: 1 },
  filaTitulo: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  filaDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  note: { fontSize: 11, color: '#64748B', lineHeight: 16, marginTop: 16 },
});
