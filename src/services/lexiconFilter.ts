/**
 * Filtro lexico RF5/CA5 (RF-087).
 *
 * Sustituye terminos ofensivos por asteriscos y permite detectarlos. La lista es
 * deliberadamente acotada y mantenible; se aplica en la UI y en el servicio.
 */

export const LEXICON_OFENSIVO = [
  'boludo',
  'boluda',
  'pelotudo',
  'pelotuda',
  'idiota',
  'imbecil',
  'mierda',
  'forro',
  'forra',
  'puto',
  'puta',
  'conchudo',
  'hijo de puta',
  'la concha de tu madre',
  'estafador de mierda',
];

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function enmascarar(palabra: string): string {
  if (palabra.length <= 1) return '*';
  return palabra[0] + '*'.repeat(palabra.length - 1);
}

/** Indica si el texto contiene algun termino del lexico. */
export function contieneLenguajeOfensivo(texto: string): boolean {
  const t = texto ?? '';
  return LEXICON_OFENSIVO.some((termino) => {
    const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
    return regex.test(t);
  });
}

/** Reemplaza los terminos ofensivos por versiones enmascaradas. */
export function filtrarTexto(texto: string): string {
  let resultado = texto ?? '';
  for (const termino of LEXICON_OFENSIVO) {
    const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
    resultado = resultado.replace(regex, (match) => enmascarar(match));
  }
  return resultado;
}
