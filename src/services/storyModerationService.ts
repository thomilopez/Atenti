/**
 * Moderación de relatos (story-moderation).
 *
 * Cola de relatos EN_REVISION, aprobacion (PUBLICADA) u ocultamiento (OCULTA),
 * con auditoria y notificaciones al autor y a los seguidores de la categoria.
 */
import {
  actualizarRelato,
  listarRelatos,
  obtenerRelato,
} from './storyService';
import { crearNotificacion } from './notificationService';
import { listarSuscriptores } from './storySubscriptions';
import { Relato } from '../types';

export async function listarPendientes(): Promise<Relato[]> {
  return listarRelatos('EN_REVISION');
}

export async function aprobarRelato(
  id: string,
  actorId: string,
  nota?: string
): Promise<Relato | null> {
  await actualizarRelato(id, {
    estado: 'PUBLICADA',
    moderadoPor: actorId,
    notaModeracion: nota,
  });
  const relato = await obtenerRelato(id);
  if (relato) {
    await crearNotificacion({
      uid: relato.autorUid,
      tipo: 'RELATO_PUBLICADO',
      mensaje: `Tu relato "${relato.titulo}" fue publicado.`,
    });

    const suscriptores = await listarSuscriptores(relato.categoria);
    for (const uid of suscriptores) {
      if (uid !== relato.autorUid) {
        await crearNotificacion({
          uid,
          tipo: 'RELATO_PUBLICADO',
          mensaje: `Se publicó un relato sobre ${relato.categoria}.`,
        });
      }
    }
  }
  return relato;
}

export async function ocultarRelato(
  id: string,
  actorId: string,
  nota: string
): Promise<Relato | null> {
  if (!nota.trim()) {
    throw new Error('Para ocultar un relato ingresá una nota');
  }
  await actualizarRelato(id, {
    estado: 'OCULTA',
    moderadoPor: actorId,
    notaModeracion: nota.trim(),
  });
  const relato = await obtenerRelato(id);
  if (relato) {
    await crearNotificacion({
      uid: relato.autorUid,
      tipo: 'RELATO_OCULTO',
      mensaje: `Tu relato "${relato.titulo}" fue ocultado por moderación.`,
    });
  }
  return relato;
}
