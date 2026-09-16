/**
 * Servicio de Almacenamiento Local de Borradores (AsyncStorage)
 * Manejo de contingencia offline y persistencia local (Pantalla P7)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReportDraft } from '../types';

const DRAFTS_STORAGE_KEY = '@atenti_drafts_v1';
// Guarda o actualiza un borrador local usando la clave_operacion como identificador unico
export async function saveDraft(draft: Omit<ReportDraft, 'savedAt'> & { clave_operacion: string }): Promise<ReportDraft> {
  try {
    const existing = await getDrafts();
   const fullDraft: ReportDraft = {
      ...draft,
      id: draft.id || draft.clave_operacion, // Asigna clave_operacion a id para mantener retrocompatibilidad
      clave_operacion: draft.clave_operacion,
      savedAt: Date.now(),
    };

    const filtered = existing.filter((d) => d.clave_operacion !== draft.clave_operacion);
    const updated = [fullDraft, ...filtered];

    await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    return fullDraft;
  } catch (error) {
    console.error('Error al guardar borrador en AsyncStorage:', error);
    throw error;
  }
}

export async function getDrafts(): Promise<ReportDraft[]> {
  try {
    const data = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as ReportDraft[];
  } catch (error) {
    console.error('Error al obtener borradores de AsyncStorage:', error);
    return [];
  }
}

export async function getDraftByClaveOperacion(clave_operacion: string): Promise<ReportDraft | null> {
  try {
    const drafts = await getDrafts();
    return drafts.find((d) => d.clave_operacion === clave_operacion) || null;
  } catch (error) {
  console.error('Error al buscar borrador por clave_operacion:', error);
    return null;
  }
}

export async function deleteDraftByClaveOperacion(clave_operacion: string): Promise<void> {
  try {
    const existing = await getDrafts();
    const updated = existing.filter((d) => d.clave_operacion !== clave_operacion);
    await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error al eliminar borrador de AsyncStorage:', error);
    throw error;
  }
}

export async function clearAllDrafts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar borradores:', error);
  }
}
