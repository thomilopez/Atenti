/**
 * Borradores de relatos de estafas (AsyncStorage).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IdentificadorRelato } from '../types';

const STORAGE_KEY = '@atenti_story_drafts_v1';

export interface BorradorRelato {
  id: string;
  titulo: string;
  categoria: string;
  modusOperandi: string;
  senalesDeAlerta: string[];
  identificadores: IdentificadorRelato[];
  links: string[];
  fueVictima: boolean;
  fuente: string;
  savedAt: number;
}

export async function listarBorradoresRelato(): Promise<BorradorRelato[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BorradorRelato[];
  } catch {
    return [];
  }
}

export async function guardarBorradorRelato(
  draft: Omit<BorradorRelato, 'id' | 'savedAt'> & { id?: string }
): Promise<BorradorRelato> {
  const existing = await listarBorradoresRelato();
  const id = draft.id || `relb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const completo: BorradorRelato = { ...draft, id, savedAt: Date.now() };
  const filtrados = existing.filter((d) => d.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([completo, ...filtrados]));
  return completo;
}

export async function borrarBorradorRelato(id: string): Promise<void> {
  const existing = await listarBorradoresRelato();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existing.filter((d) => d.id !== id))
  );
}
