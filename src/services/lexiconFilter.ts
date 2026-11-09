/**
 * Filtro lexico RF5/CA5 (RF-087).
 *
 * Sustituye terminos ofensivos por asteriscos y permite detectarlos. Tolera
 * acentos, mayusculas y letras separadas por espacios o signos.
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

const ACENTOS: Record<string, string> = {
  a: '[aá]',
  e: '[eé]',
  i: '[ií]',
  o: '[oó]',
  u: '[uú]',
};

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function enmascarar(palabra: string): string {
  if (palabra.length <= 1) return '*';
  return palabra[0] + '*'.repeat(palabra.length - 1);
}

/** Patron tolerante a acentos y separadores entre letras. */
function patronTermino(termino: string): string {
  return termino
    .split('')
    .map((char) => {
      if (/\s/.test(char)) return '[\\s._-]*';
      const minuscula = char.toLowerCase();
      return ACENTOS[minuscula] ?? escaparRegex(char);
    })
    .join('[\\s._-]*');
}

function crearRegex(termino: string, flags = 'i'): RegExp {
  return new RegExp(
    `(^|[^a-zA-Z0-9áéíóúüñ])(${patronTermino(termino)})(?=$|[^a-zA-Z0-9áéíóúüñ])`,
    flags
  );
}

/** Indica si el texto contiene algun termino del lexico. */
export function contieneLenguajeOfensivo(texto: string): boolean {
  const t = texto ?? '';
  return LEXICON_OFENSIVO.some((termino) => crearRegex(termino).test(t));
}

/** Reemplaza los terminos ofensivos por versiones enmascaradas. */
export function filtrarTexto(texto: string): string {
  let resultado = texto ?? '';
  for (const termino of LEXICON_OFENSIVO) {
    const regex = crearRegex(termino, 'gi');
    resultado = resultado.replace(regex, (_match, prefijo, ofensiva) => {
      return `${prefijo}${enmascarar(ofensiva)}`;
    });
  }
  return resultado;
}
