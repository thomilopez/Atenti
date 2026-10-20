import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  Notificacion,
} from '../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'P19_NotificationCenter'>;

export const P19_NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const propias = await listarNotificaciones(user?.uid);
    const todas = propias.length > 0 ? propias : await listarNotificaciones();
    setNotificaciones(todas);
    setLoading(false);
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleLeer = async (id: string) => {
    await marcarNotificacionLeida(id);
    await cargar();
  };

  const handleLeerTodas = async () => {
    const pendientes = notificaciones.filter((n) => !n.leida);
    for (const n of pendientes) {
      await marcarNotificacionLeida(n.id);
    }
    await cargar();
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Notificaciones</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('P26_NotificationPreferences')}
          style={styles.settingsBtn}
        >
          <Ionicons name="options-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.count}>{noLeidas} sin leer</Text>
        {noLeidas > 0 && (
          <TouchableOpacity onPress={handleLeerTodas}>
            <Text style={styles.markAll}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
      ) : notificaciones.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={44} color="#CBD5E1" />
          <Text style={styles.emptyText}>No tenés notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.leida && styles.cardUnread]}
              onPress={() => handleLeer(item.id)}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name={item.leida ? 'mail-open-outline' : 'mail-unread-outline'}
                  size={16}
                  color={item.leida ? '#94A3B8' : '#0F172A'}
                />
                <Text style={styles.tipo}>{item.tipo}</Text>
                <Text style={styles.fecha}>
                  {new Date(item.fecha).toLocaleString('es-AR')}
                </Text>
              </View>
              <Text style={styles.mensaje}>{item.mensaje}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  settingsBtn: { padding: 4 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  count: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  markAll: { fontSize: 12, color: '#3730A3', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#C7D2FE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipo: { fontSize: 10, fontWeight: '800', color: '#3730A3', flex: 1 },
  fecha: { fontSize: 10, color: '#94A3B8' },
  mensaje: { fontSize: 13, color: '#0F172A', lineHeight: 19 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
