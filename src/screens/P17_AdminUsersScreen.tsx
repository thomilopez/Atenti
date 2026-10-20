import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { listarUsuarios, cambiarSuspension, UsuarioAdmin } from '../services/adminService';

type Props = NativeStackScreenProps<RootStackParamList, 'P17_AdminUsers'>;

export const P17_AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    setUsuarios(await listarUsuarios());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const toggle = async (u: UsuarioAdmin) => {
    await cambiarSuspension(u.uid, !u.suspendido);
    await cargar();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Usuarios</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#0F172A" />
        ) : usuarios.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay usuarios con denuncias</Text>
          </View>
        ) : (
          usuarios.map((u) => (
            <View key={u.uid} style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{u.email || u.uid}</Text>
                <Text style={styles.rowSubtitle}>
                  {u.denuncias} denuncia{u.denuncias === 1 ? '' : 's'}
                  {u.suspendido ? ' · Suspendido' : ''}
                </Text>
              </View>
              <Switch
                value={u.suspendido}
                onValueChange={() => toggle(u)}
                trackColor={{ false: '#CBD5E1', true: '#FCA5A5' }}
                thumbColor={u.suspendido ? '#DC2626' : '#F8FAFC'}
              />
            </View>
          ))
        )}
      </ScrollView>
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
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  rowSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
