/**
 * Almacenamiento de evidencias en Cloud Storage (RF-032).
 *
 * Sube el archivo y devuelve su URL segura. En modo demo (sin Firebase) o ante
 * errores, conserva la URI local para no romper el flujo.
 */
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { File as FsFile } from 'expo-file-system';
import { app, isFirebaseConfigured } from './firebase';
import { AtentiError } from './errors';
import { MAX_BYTES } from './evidenceService';

export async function subirEvidencia(params: {
  uri: string;
  nombre: string;
  mimeType: string;
}): Promise<string> {
  if (!isFirebaseConfigured) {
    return params.uri;
  }

  try {
    const archivo = new FsFile(params.uri);
    const tamano = (archivo as unknown as { size?: number }).size;
    if (typeof tamano === 'number' && tamano > MAX_BYTES) {
      throw new AtentiError('EVIDENCE_TOO_LARGE', 'La evidencia supera los 10MB');
    }
    const buffer = await archivo.arrayBuffer();
    const storage = getStorage(app);
    const destino = ref(storage, `evidencias/${Date.now()}_${params.nombre}`);
    await uploadBytes(destino, new Uint8Array(buffer), { contentType: params.mimeType });
    return await getDownloadURL(destino);
  } catch (e) {
    if (e instanceof AtentiError) throw e;
    throw new AtentiError('STORAGE_UPLOAD_ERROR', 'No se pudo subir la evidencia', {
      cause: e,
    });
  }
}
