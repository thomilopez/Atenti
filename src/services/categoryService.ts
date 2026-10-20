/**
 * Catálogo paramétrico de categorías (RF-027, RF-069).
 *
 * Fuente única para el formulario de P4 y el panel de administración. Persiste
 * en Firestore con fallback en memoria, sembrado con las categorías por defecto.
 */
import { collection, doc, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CATEGORIAS, CategoriaTipo } from './normalize';

let memoria: CategoriaTipo[] = CATEGORIAS.map((c) => ({ ...c }));
let sembrado = false;

function slugify(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || `categoria_${Date.now()}`;
}

/** Siembra el catálogo por defecto en Firestore (idempotente). */
export async function sembrarCategorias(): Promise<void> {
  if (!isFirebaseConfigured || sembrado) return;
  try {
    for (const cat of CATEGORIAS) {
      await setDoc(
        doc(db, 'categorias', cat.id),
        { nombre: cat.nombre, requiereUbicacion: cat.requiereUbicacion, activa: cat.activa, _serverTimestamp: serverTimestamp() },
        { merge: true }
      );
    }
    sembrado = true;
  } catch (e) {
    console.warn('sembrarCategorias: Firestore no disponible:', e);
  }
}

export async function listarTodasCategorias(): Promise<CategoriaTipo[]> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'categorias'));
      if (!snap.empty) {
        memoria = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CategoriaTipo, 'id'>) }));
        return memoria.map((c) => ({ ...c }));
      }
      await sembrarCategorias();
    } catch (e) {
      console.warn('listarTodasCategorias: Firestore no disponible, uso memoria:', e);
    }
  }
  return memoria.map((c) => ({ ...c }));
}

export async function listarCategoriasActivas(): Promise<CategoriaTipo[]> {
  const todas = await listarTodasCategorias();
  return todas.filter((c) => c.activa);
}

export async function crearCategoria(input: {
  nombre: string;
  requiereUbicacion: boolean;
}): Promise<CategoriaTipo> {
  const nombre = input.nombre.trim();
  if (!nombre) throw new Error('El nombre de la categoría es obligatorio');

  const baseId = slugify(nombre);
  let id = baseId;
  let n = 1;
  while (memoria.some((c) => c.id === id)) {
    id = `${baseId}_${++n}`;
  }

  const nueva: CategoriaTipo = {
    id,
    nombre,
    requiereUbicacion: input.requiereUbicacion,
    activa: true,
  };
  memoria = [...memoria, nueva];

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'categorias', id), {
        nombre,
        requiereUbicacion: input.requiereUbicacion,
        activa: true,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('crearCategoria: Firestore no disponible:', e);
    }
  }

  return { ...nueva };
}

export async function editarCategoria(
  id: string,
  cambios: Partial<Pick<CategoriaTipo, 'nombre' | 'requiereUbicacion' | 'activa'>>
): Promise<CategoriaTipo> {
  const actual = memoria.find((c) => c.id === id);
  if (!actual) throw new Error('Categoría no encontrada');

  Object.assign(actual, cambios);

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'categorias', id), { ...cambios, _serverTimestamp: serverTimestamp() });
    } catch (e) {
      console.warn('editarCategoria: Firestore no disponible:', e);
    }
  }

  return { ...actual };
}

export async function cambiarEstadoCategoria(id: string, activa: boolean): Promise<CategoriaTipo> {
  return editarCategoria(id, { activa });
}
