/**
 * Servicio de relatos de estafas (scam-stories).
 *
 * Permite contar nuevas formas de estafar y consultar los relatos publicados,
 * con moderacion previa (EN_REVISION) y vinculacion a identificadores.
 */
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { filtrarTexto } from './lexiconFilter';
import { Relato, EstadoRelato, IdentificadorRelato } from '../types';

const memoria: Relato[] = [];

function sanitizarIdentificadores(
  ids: IdentificadorRelato[]
): IdentificadorRelato[] {
  return ids
    .filter((i) => i.valor.trim())
    .map((i) => ({ ...i, valor: i.valor.trim() }));
}

export async function crearRelato(input: {
  titulo: string;
  categoria: string;
  modusOperandi: string;
  senalesDeAlerta: string[];
  identificadores: IdentificadorRelato[];
  links: string[];
  fueVictima: boolean;
  fuente: string;
  autorUid: string;
}): Promise<Relato> {
  const titulo = filtrarTexto(input.titulo.trim());
  const modusOperandi = filtrarTexto(input.modusOperandi.trim());

  if (!titulo) throw new Error('El título es obligatorio');
  if (!input.categoria) throw new Error('Elegí una categoría');
  if (modusOperandi.length < 20) {
    throw new Error('Contá con al menos 20 caracteres cómo funciona la estafa');
  }

  const duplicado = memoria.some(
    (r) =>
      r.estado !== 'OCULTA' &&
      (r.titulo.toLowerCase() === titulo.toLowerCase() ||
        r.modusOperandi.toLowerCase() === modusOperandi.toLowerCase())
  );
  if (duplicado) {
    throw new Error('Parece un relato duplicado. Revisá antes de enviar.');
  }

  const identificadores = sanitizarIdentificadores(input.identificadores);
  const relato: Relato = {
    id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    titulo,
    categoria: input.categoria,
    modusOperandi,
    senalesDeAlerta: input.senalesDeAlerta.filter((s) => s.trim()),
    identificadores,
    links: input.links.filter((l) => l.trim()),
    fueVictima: input.fueVictima,
    fuente: input.fuente.trim(),
    autorUid: input.autorUid,
    creadoEn: new Date().toISOString(),
    estado: 'EN_REVISION',
    corroboraciones: 0,
    tags: [],
    identificadoresNormalizados: identificadores.map((i) => i.valorNormalizado),
  };

  memoria.unshift(relato);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'relatos', relato.id), {
        ...relato,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('crearRelato: Firestore no disponible:', e);
    }
  }

  return relato;
}

export async function listarRelatos(estado?: EstadoRelato): Promise<Relato[]> {
  if (isFirebaseConfigured) {
    try {
      const referencia = collection(db, 'relatos');
      const q = estado ? query(referencia, where('estado', '==', estado)) : query(referencia);
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Relato, 'id'>) }));
        return docs.sort(
          (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
        );
      }
    } catch (e) {
      console.warn('listarRelatos: Firestore no disponible:', e);
    }
  }
  const filtrados = estado ? memoria.filter((r) => r.estado === estado) : [...memoria];
  return filtrados.sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  );
}

export async function listarMisRelatos(uid: string): Promise<Relato[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'relatos'), where('autorUid', '==', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Relato, 'id'>) }));
      }
    } catch (e) {
      console.warn('listarMisRelatos: Firestore no disponible:', e);
    }
  }
  return memoria.filter((r) => r.autorUid === uid);
}

export async function obtenerRelato(id: string): Promise<Relato | null> {
  return memoria.find((r) => r.id === id) ?? null;
}

export async function actualizarRelato(
  id: string,
  cambios: Partial<Relato>
): Promise<Relato | null> {
  const relato = memoria.find((r) => r.id === id);
  if (!relato) return null;
  Object.assign(relato, cambios);
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'relatos', id), { ...cambios, _serverTimestamp: serverTimestamp() });
    } catch (e) {
      console.warn('actualizarRelato: Firestore no disponible:', e);
    }
  }
  return relato;
}

export async function corroborarRelato(id: string): Promise<Relato | null> {
  const relato = memoria.find((r) => r.id === id);
  if (!relato) return null;
  const nuevo = (relato.corroboraciones ?? 0) + 1;
  relato.corroboraciones = nuevo;
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'relatos', id), { corroboraciones: nuevo });
    } catch (e) {
      console.warn('corroborarRelato: Firestore no disponible:', e);
    }
  }
  return relato;
}

/** Busca relatos publicados vinculados a un identificador normalizado. */
export async function buscarRelatosPorIdentificador(
  valorNormalizado: string
): Promise<Relato[]> {
  const publicados = await listarRelatos('PUBLICADA');
  return publicados.filter((r) =>
    (r.identificadoresNormalizados ?? []).includes(valorNormalizado)
  );
}

/** RF: reportar abuso de un relato. */
export async function registrarReporteContenido(
  relatoId: string,
  uid: string,
  motivo: string
): Promise<void> {
  const reporte = {
    id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    relatoId,
    uid,
    motivo: motivo.trim(),
    creadoEn: new Date().toISOString(),
  };
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'story_reports', reporte.id), {
        ...reporte,
        _serverTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('registrarReporteContenido: Firestore no disponible:', e);
    }
  }
}
