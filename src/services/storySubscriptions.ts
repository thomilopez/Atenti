/**
 * Suscripciones a categorias de relatos.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const memoriaSubs = new Map<string, string[]>();

async function leerDeFirestore(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, 'story_subscriptions', uid));
  if (!snap.exists()) return [];
  const data = snap.data() as { categorias?: string[] };
  return data.categorias ?? [];
}

export async function listarSuscripciones(uid: string): Promise<string[]> {
  if (isFirebaseConfigured) {
    try {
      const cats = await leerDeFirestore(uid);
      return cats;
    } catch (e) {
      console.warn('listarSuscripciones: Firestore no disponible:', e);
    }
  }
  return memoriaSubs.get(uid) ?? [];
}

async function guardar(uid: string, categorias: string[]): Promise<string[]> {
  memoriaSubs.set(uid, categorias);
  if (isFirebaseConfigured) {
    try {
      await setDoc(
        doc(db, 'story_subscriptions', uid),
        { categorias, _serverTimestamp: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.warn('storySubscriptions: Firestore no disponible:', e);
    }
  }
  return categorias;
}

export async function seguirCategoria(uid: string, categoria: string): Promise<string[]> {
  const actuales = await listarSuscripciones(uid);
  if (actuales.includes(categoria)) return actuales;
  return guardar(uid, [...actuales, categoria]);
}

export async function dejarDeSeguirCategoria(uid: string, categoria: string): Promise<string[]> {
  const actuales = await listarSuscripciones(uid);
  return guardar(uid, actuales.filter((c) => c !== categoria));
}

export async function listarSuscriptores(categoria: string): Promise<string[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'story_subscriptions'),
        where('categorias', 'array-contains', categoria)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.id);
      }
    } catch (e) {
      console.warn('listarSuscriptores: Firestore no disponible:', e);
    }
  }
  const uids: string[] = [];
  for (const [uid, cats] of Array.from(memoriaSubs.entries())) {
    if (cats.includes(categoria)) uids.push(uid);
  }
  return uids;
}
