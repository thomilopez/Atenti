/**
 * Búsquedas recientes del inicio (persistidas en AsyncStorage).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IdentifierType } from '../types';

const STORAGE_KEY = '@atenti_recent_searches_v1';
const MAX_RECIENTES = 8;

export interface RecentSearch {
  value: string;
  type: IdentifierType;
  fecha: number;
}

export async function listarRecientes(): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECIENTES) : [];
  } catch {
    return [];
  }
}

export async function agregarReciente(
  item: Omit<RecentSearch, 'fecha'>
): Promise<RecentSearch[]> {
  const valor = item.value.trim();
  if (!valor) return listarRecientes();

  try {
    const actuales = await listarRecientes();
    const filtrados = actuales.filter(
      (r) => !(r.value.toLowerCase() === valor.toLowerCase() && r.type === item.type)
    );
    const nuevos = [{ ...item, value: valor, fecha: Date.now() }, ...filtrados].slice(
      0,
      MAX_RECIENTES
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
    return nuevos;
  } catch {
    return [];
  }
}

export async function limpiarRecientes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
