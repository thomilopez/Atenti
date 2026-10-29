/**
 * Bloque A · T03 — Normalización de identificadores y catálogo de categorías.
 * Etapa 3 §3: valor_normalizado como índice de agrupación comunitaria.
 *
 * - Alias: minúsculas, sin espacios externos ni puntos ornamentales internos.
 * - CBU/CVU: solo dígitos (sin guiones/espacios).
 * - Tel: formato E.164 AR (+54 + dígitos). Tolera 0, 15, +54, espacios y guiones.
 * - Local: minúsculas, espacios colapsados.
 */
import type { IdentifierType } from '../types';

export function normalizeIdentifier(type: IdentifierType, rawValue: string): string {
  const raw = (rawValue ?? '').trim();
  switch (type) {
    case 'Alias':
      return raw.toLowerCase().replace(/\s+/g, '');
    case 'CBU':
      return raw.replace(/\D/g, '');
    case 'CUIT':
      return raw.replace(/\D/g, '');
    case 'Tel': {
      let digits = raw.replace(/\D/g, '');
      // Normalizar prefijos locales AR: 0 + 15 -> móvil sin 0/15
      if (digits.startsWith('0')) digits = digits.slice(1);
      // Quitar el 15 intermedio típico: 11 15 XXXX-XXXX -> 11 XXXX-XXXX
      digits = digits.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
      if (digits.startsWith('54')) return `+${digits}`;
      if (digits.startsWith('549')) return `+${digits}`;
      return `+54${digits}`;
    }
    case 'Local':
      return raw.toLowerCase().replace(/\s+/g, ' ').trim();
    default:
      return raw.toLowerCase().trim();
  }
}

/** Corroboración comunitaria RG-07: MIN(15, 5 * coincidencias históricas). */
export function corroborationScoreFor(countHistoricMatches: number): number {
  if (countHistoricMatches >= 3) return 15;
  if (countHistoricMatches === 2) return 10;
  if (countHistoricMatches === 1) return 5;
  return 0;
}

/**
 * RF-088: valida el checksum del CBU (22 dígitos en dos bloques de 8 y 14).
 */
export function validarCbu(valor: string): boolean {
  const digitos = (valor ?? '').replace(/\D/g, '');
  if (digitos.length !== 22) return false;

  const bloque1 = digitos.slice(0, 8);
  const bloque2 = digitos.slice(8);

  return (
    validarBloqueCbu(bloque1, [7, 1, 3, 9, 7, 1, 3]) &&
    validarBloqueCbu(bloque2, [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3])
  );
}

function validarBloqueCbu(bloque: string, pesos: number[]): boolean {
  let suma = 0;
  for (let i = 0; i < pesos.length; i++) {
    suma += Number(bloque[i]) * pesos[i];
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === Number(bloque[pesos.length]);
}

/** RF-089: valida que un teléfono argentino quede en formato E.164. */
export function validarTelefonoE164(valor: string): boolean {
  const normalizado = normalizeIdentifier('Tel', valor);
  return /^\+54\d{10,11}$/.test(normalizado);
}

export const PREFIJOS_CUIT = ['20', '23', '24', '27', '30', '33', '34'];

/**
 * RF-088b: valida un CUIT/CUIL argentino (11 digitos, prefijo conocido y
 * digito verificador por modulo 11).
 */
export function validarCuit(valor: string): boolean {
  const digitos = (valor ?? '').replace(/\D/g, '');
  if (digitos.length !== 11) return false;
  if (!PREFIJOS_CUIT.includes(digitos.slice(0, 2))) return false;

  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += Number(digitos[i]) * pesos[i];
  }
  const resto = suma % 11;
  let verificador = 11 - resto;
  if (verificador === 11) verificador = 0;
  else if (verificador === 10) verificador = 9;

  return verificador === Number(digitos[10]);
}

/** Valida el identificador según su tipo (CBU, CUIT, Tel). */
export function validarIdentificador(type: IdentifierType, valor: string): boolean {
  if (!valor.trim()) return false;
  if (type === 'CBU') return validarCbu(valor);
  if (type === 'CUIT') return validarCuit(valor);
  if (type === 'Tel') return validarTelefonoE164(valor);
  return true;
}

export interface CategoriaTipo {
  id: string;
  nombre: string;
  requiereUbicacion: boolean;
  activa: boolean;
  /** Nombre de icono de Ionicons. */
  icono?: string;
  /** Color hex para el icono/indicador. */
  color?: string;
}

/** Catálogo paramétrico por defecto Etapa 3 §3 (CategoriaTipo). */
export const CATEGORIAS: CategoriaTipo[] = [
  { id: 'ESTAFA_BANCARIA', nombre: 'Estafa Bancaria', requiereUbicacion: false, activa: true, icono: 'card-outline', color: '#DC2626' },
  { id: 'PHISHING', nombre: 'Phishing / Suplantación', requiereUbicacion: false, activa: true, icono: 'mail-unread-outline', color: '#7C3AED' },
  { id: 'COMERCIO_VIRTUAL', nombre: 'Comercio Virtual Falso', requiereUbicacion: false, activa: true, icono: 'storefront-outline', color: '#0EA5E9' },
  { id: 'LOCAL_FISICO', nombre: 'Local Físico Ilícito', requiereUbicacion: true, activa: true, icono: 'business-outline', color: '#F59E0B' },
  { id: 'CLONACION_IDENTIDAD', nombre: 'Clonación de Identidad', requiereUbicacion: false, activa: true, icono: 'person-circle-outline', color: '#EF4444' },
  { id: 'VENTA_FRAUDULENTA', nombre: 'Venta Fraudulenta', requiereUbicacion: false, activa: true, icono: 'pricetag-outline', color: '#DC2626' },
  { id: 'FALSA_INVERSION', nombre: 'Falsa Inversión', requiereUbicacion: false, activa: true, icono: 'trending-up-outline', color: '#16A34A' },
  { id: 'PRESTAMO_FRAUDULENTO', nombre: 'Préstamo Fraudulento', requiereUbicacion: false, activa: true, icono: 'cash-outline', color: '#F97316' },
  { id: 'SOPORTE_FALSO', nombre: 'Soporte Técnico Falso', requiereUbicacion: false, activa: true, icono: 'headset-outline', color: '#2563EB' },
  { id: 'FALSO_EMPLEO', nombre: 'Falso Empleo', requiereUbicacion: false, activa: true, icono: 'briefcase-outline', color: '#9333EA' },
  { id: 'ROMANCE_SCAM', nombre: 'Romance Scam', requiereUbicacion: false, activa: true, icono: 'heart-dislike-outline', color: '#DB2777' },
  { id: 'SUSCRIPCION_NO_AUTORIZADA', nombre: 'Suscripción No Autorizada', requiereUbicacion: false, activa: true, icono: 'repeat-outline', color: '#0891B2' },
  { id: 'CRIPTOMONEDAS', nombre: 'Criptomonedas', requiereUbicacion: false, activa: true, icono: 'logo-bitcoin', color: '#F59E0B' },
  { id: 'COMERCIO_NO_ENTREGA', nombre: 'Comercio que No Entrega', requiereUbicacion: false, activa: true, icono: 'cube-outline', color: '#DC2626' },
  { id: 'COBRO_INDEBIDO', nombre: 'Cobro Indebido', requiereUbicacion: false, activa: true, icono: 'receipt-outline', color: '#7C3AED' },
  { id: 'SUPLANTACION', nombre: 'Suplantación de Identidad', requiereUbicacion: false, activa: true, icono: 'finger-print-outline', color: '#EF4444' },
];

export function listarCategorias(): CategoriaTipo[] {
  return CATEGORIAS.filter((c) => c.activa);
}
