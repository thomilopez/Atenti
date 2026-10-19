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

/** Valida el identificador según su tipo (CBU con checksum, Tel E.164). */
export function validarIdentificador(type: IdentifierType, valor: string): boolean {
  if (!valor.trim()) return false;
  if (type === 'CBU') return validarCbu(valor);
  if (type === 'Tel') return validarTelefonoE164(valor);
  return true;
}

export interface CategoriaTipo {
  id: string;
  nombre: string;
  requiereUbicacion: boolean;
  activa: boolean;
}

/** Catálogo paramétrico Etapa 3 §3 (CategoriaTipo). */
export const CATEGORIAS: CategoriaTipo[] = [
  { id: 'VIRTUAL', nombre: 'Incidencia Virtual', requiereUbicacion: false, activa: true },
  { id: 'LOCAL_FISICO', nombre: 'Local Físico', requiereUbicacion: true, activa: true },
  { id: 'FALSO_ALIAS', nombre: 'Alias Falso', requiereUbicacion: false, activa: true },
];

export function listarCategorias(): CategoriaTipo[] {
  return CATEGORIAS.filter((c) => c.activa);
}
