/**
 * Cache en memoria con TTL (RF-100).
 *
 * Acelera busquedas repetidas y se invalida al registrar una denuncia nueva.
 */

interface Entrada<T> {
  valor: T;
  expira: number;
}

const cache = new Map<string, Entrada<unknown>>();

export function getCache<T>(key: string, ahora: number = Date.now()): T | null {
  const entrada = cache.get(key);
  if (!entrada) return null;
  if (entrada.expira <= ahora) {
    cache.delete(key);
    return null;
  }
  return entrada.valor as T;
}

export function setCache<T>(key: string, valor: T, ttlMs = 30_000): void {
  cache.set(key, { valor, expira: Date.now() + ttlMs });
}

export function invalidarCache(prefijo?: string): void {
  if (!prefijo) {
    cache.clear();
    return;
  }
  for (const clave of Array.from(cache.keys())) {
    if (clave.startsWith(prefijo)) cache.delete(clave);
  }
}
