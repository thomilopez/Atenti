/**
 * Almacenamiento de evidencias en Cloud Storage (RF-032).
 *
 * Sube el archivo y devuelve su URL segura. En modo demo (sin Firebase) o ante
 * errores, conserva la URI local para no romper el flujo.
 */
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, isFirebaseConfigured } from './firebase';

export async function subirEvidencia(params: {
  uri: string;
  nombre: string;
  mimeType: string;
}): Promise<string> {
  if (!isFirebaseConfigured) {
    return params.uri;
  }

  try {
    const respuesta = await fetch(params.uri);
    const blob = await respuesta.blob();
    const storage = getStorage(app);
    const destino = ref(storage, `evidencias/${Date.now()}_${params.nombre}`);
    await uploadBytes(destino, blob, { contentType: params.mimeType });
    return await getDownloadURL(destino);
  } catch (e) {
    console.warn('subirEvidencia: fallo la subida, uso URI local:', e);
    return params.uri;
  }
}
