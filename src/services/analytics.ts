/**
 * Analytics de uso (RF-097).
 *
 * Solo registra eventos si el usuario dio consentimiento. Sin SDK externo,
 * acumula en memoria y loguea; el adaptador queda listo para conectar el
 * proveedor real cuando se configure.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSENT_KEY = '@atenti_analytics_consent_v1';
const eventos: Array<{ nombre: string; props?: Record<string, unknown>; fecha: string }> = [];

let consentimiento = false;

export async function cargarConsentimiento(): Promise<boolean> {
  try {
    const valor = await AsyncStorage.getItem(CONSENT_KEY);
    consentimiento = valor === 'true';
  } catch {
    consentimiento = false;
  }
  return consentimiento;
}

export async function setConsentimiento(valor: boolean): Promise<void> {
  consentimiento = valor;
  try {
    await AsyncStorage.setItem(CONSENT_KEY, String(valor));
  } catch (e) {
    console.warn('analytics: no se pudo guardar el consentimiento:', e);
  }
}

export function tieneConsentimiento(): boolean {
  return consentimiento;
}

export function registrarEvento(nombre: string, props?: Record<string, unknown>): void {
  if (!consentimiento) return;
  const evento = { nombre, props, fecha: new Date().toISOString() };
  eventos.push(evento);
  if (eventos.length > 200) eventos.shift();
  console.info('[analytics]', nombre, props ?? {});
}

export function obtenerEventos(): ReadonlyArray<{ nombre: string; props?: Record<string, unknown>; fecha: string }> {
  return eventos;
}
