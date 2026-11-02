/**
 * Notificaciones de corroboración (RF-078).
 *
 * Cuando se registra una denuncia sobre un objetivo ya reportado, avisa a los
 * denunciantes previos (sin duplicar por uid).
 */
import { getIncidents } from './firebase';
import { normalizeIdentifier } from './normalize';
import { crearNotificacion } from './notificationService';

export async function notificarCorroboracion(params: {
  valorNormalizado: string;
  excludeUid: string;
  codigo: string;
}): Promise<number> {
  const todas = await getIncidents(undefined, undefined, { incluirEnDisputa: true });

  const coincidentes = todas.filter((inc) => {
    const normalizado =
      inc.valorNormalizado ?? normalizeIdentifier(inc.identifierType, inc.identifierValue);
    return normalizado === params.valorNormalizado && inc.audit.uid !== params.excludeUid;
  });

  const uids = new Set(coincidentes.map((inc) => inc.audit.uid));
  let enviadas = 0;

  for (const uid of uids) {
    if (!uid) continue;
    await crearNotificacion({
      uid,
      tipo: 'CORROBORACION',
      mensaje: `Un nuevo reporte corrobora el objetivo de ${params.codigo}.`,
      denunciaId: coincidentes[0]?.id,
    });
    enviadas++;
  }

  return enviadas;
}
