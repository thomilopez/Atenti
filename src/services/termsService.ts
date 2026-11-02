/**
 * Terminos y condiciones versionados, privacidad y retencion (RF-083, RF-084, RF-085).
 */
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface TerminosVersion {
  version: string;
  aprobadaEn: string;
  resumen: string;
}

export const TERMINOS_VERSIONS: TerminosVersion[] = [
  {
    version: 'v1.0',
    aprobadaEn: '2026-01-15',
    resumen:
      'Version inicial de los terminos de uso de Atenti: uso responsable, veracidad de los datos y aceptacion de la declaracion jurada.',
  },
  {
    version: 'v1.1',
    aprobadaEn: '2026-06-01',
    resumen:
      'Se agregan clausulas de privacidad, tratamiento de evidencias y derecho al olvido conforme a la Ley 25.326.',
  },
];

export const VERSION_TERMINOS_ACTUAL = TERMINOS_VERSIONS[TERMINOS_VERSIONS.length - 1].version;

/** RF-085: plazo de retencion de datos. */
export const RETENCION_ANIOS = 5;

export const LEY_25326_URL =
  'https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790';

export const PRIVACIDAD_RESUMEN =
  'Atenti trata datos personales conforme a la Ley 25.326. Los datos de auditoria ' +
  '(uid, IP, timestamp) se conservan por el plazo legal para responder requerimientos ' +
  'judiciales. Las evidencias publicas se muestran enmascaradas.';

/** Registra la version de terminos aceptada por el usuario. */
export async function registrarAceptacionTerminos(uid: string, version: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(
      doc(db, 'terminos_aceptados', `${uid}_${version}`),
      { uid, version, aceptadaEn: new Date().toISOString(), _serverTimestamp: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.warn('registrarAceptacionTerminos: Firestore no disponible:', e);
  }
}
