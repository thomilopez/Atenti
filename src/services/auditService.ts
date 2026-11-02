/**
 * Log de auditoria global (RF-081, RNF-003).
 *
 * Lee `audit_logs` en Firestore; en modo demo deriva los eventos de las
 * denuncias existentes para poder probar la pantalla.
 */
import { collection, getDocs, query } from 'firebase/firestore';
import { db, isFirebaseConfigured, getIncidents } from './firebase';

export interface AuditEvent {
  id: string;
  uid: string;
  email: string;
  ip: string;
  timestamp: string;
  accion: string;
  denunciaId?: string;
}

export async function listarAuditLogs(): Promise<AuditEvent[]> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'audit_logs')));
      if (!snap.empty) {
        return snap.docs
          .map((d) => {
            const data = d.data() as {
              audit?: { uid?: string; userEmail?: string; clientIp?: string; createdAt?: string };
              incidentId?: string;
            };
            const audit = data.audit ?? {};
            return {
              id: d.id,
              uid: audit.uid ?? '',
              email: audit.userEmail ?? '',
              ip: audit.clientIp ?? '',
              timestamp: audit.createdAt ?? '',
              accion: 'CREACION_DENUNCIA',
              denunciaId: data.incidentId,
            } as AuditEvent;
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (e) {
      console.warn('listarAuditLogs: Firestore no disponible:', e);
    }
  }

  // Fallback demo: derivar de las denuncias.
  const incidentes = await getIncidents(undefined, undefined, { incluirEnDisputa: true });
  return incidentes
    .map((i) => ({
      id: `log_${i.id}`,
      uid: i.audit.uid,
      email: i.audit.userEmail,
      ip: i.audit.clientIp,
      timestamp: i.audit.createdAt,
      accion: 'CREACION_DENUNCIA',
      denunciaId: i.id,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
