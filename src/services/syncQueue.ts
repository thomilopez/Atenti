/**
 * Cola de sincronización offline con reintentos exponenciales (RF-056).
 *
 * Los borradores pendientes se encolan en AsyncStorage. Al recuperar conexión
 * se procesan en orden; cada fallo incrementa el intento y programa el próximo
 * con backoff exponencial.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@atenti_sync_queue_v1';
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 5 * 60 * 1000;
const MAX_INTENTOS = 5;

export interface EntradaCola {
  draftId: string;
  intentos: number;
  proximoIntento: number;
  /** `fallido` conserva la entrada agotada para reintento manual. */
  estado?: 'pendiente' | 'fallido';
}

/** Backoff exponencial: 1s, 2s, 4s, 8s... con tope de 5 minutos. */
export function calcularBackoff(intentos: number): number {
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS * Math.pow(2, Math.max(0, intentos)));
}

export async function leerCola(): Promise<EntradaCola[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as EntradaCola[]) : [];
  } catch {
    return [];
  }
}

async function escribirCola(cola: EntradaCola[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(cola));
}

/** Encola un borrador si no está ya en la cola. */
export async function encolarBorrador(draftId: string): Promise<void> {
  const cola = await leerCola();
  if (cola.some((e) => e.draftId === draftId)) return;
  cola.push({ draftId, intentos: 0, proximoIntento: Date.now() });
  await escribirCola(cola);
}

export interface ResultadoProcesamiento {
  exitosos: number;
  fallidos: number;
  pendientes: number;
}

/**
 * Procesa la cola llamando a `enviar` por cada entrada cuyo `proximoIntento`
 * ya venció. Las exitosas se quitan; las fallidas se reprograman.
 */
export async function procesarCola(
  enviar: (draftId: string) => Promise<void>,
  ahora: number = Date.now()
): Promise<ResultadoProcesamiento> {
  const cola = await leerCola();
  let exitosos = 0;
  let fallidos = 0;
  const restantes: EntradaCola[] = [];

  for (const entrada of cola) {
    if (entrada.intentos >= MAX_INTENTOS) {
      restantes.push({ ...entrada, estado: 'fallido' });
      fallidos++;
      continue;
    }
    if (entrada.proximoIntento > ahora) {
      restantes.push(entrada);
      continue;
    }
    try {
      await enviar(entrada.draftId);
      exitosos++;
    } catch {
      const intentos = entrada.intentos + 1;
      restantes.push({
        draftId: entrada.draftId,
        intentos,
        proximoIntento: ahora + calcularBackoff(intentos),
        estado: intentos >= MAX_INTENTOS ? 'fallido' : 'pendiente',
      });
      fallidos++;
    }
  }

  await escribirCola(restantes);
  return { exitosos, fallidos, pendientes: restantes.length };
}

/** Reinicia las entradas agotadas para un reintento manual. */
export async function reintentarFallidos(): Promise<number> {
  const cola = await leerCola();
  let reiniciados = 0;
  const actualizada = cola.map((entrada) => {
    if (entrada.estado !== 'fallido') return entrada;
    reiniciados++;
    return { ...entrada, intentos: 0, proximoIntento: Date.now(), estado: 'pendiente' as const };
  });
  await escribirCola(actualizada);
  return reiniciados;
}

export async function contarFallidos(): Promise<number> {
  const cola = await leerCola();
  return cola.filter((e) => e.estado === 'fallido' || e.intentos >= MAX_INTENTOS).length;
}
