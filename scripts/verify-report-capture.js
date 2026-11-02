/**
 * Verificación del bloque "report-capture" (CUIT, categorias, direccion).
 * Self-contained (no importa TS) para correr con `node scripts/verify-report-capture.js`.
 */
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
function assert(cond, name) {
  if (cond) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    failed++;
  }
}

const root = path.join(__dirname, '..');

const archivos = [
  'src/components/MapPickerModal.tsx',
  'src/services/locationService.ts',
  'src/services/categoryService.ts',
  'src/screens/P16_AdminCategoriesScreen.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- CUIT: normalización y checksum AFIP ---
function normalizarCuit(valor) {
  return (valor || '').replace(/\D/g, '');
}
function validarCuit(valor) {
  const d = normalizarCuit(valor);
  if (d.length !== 11) return false;
  if (!['20', '23', '24', '27', '30', '33', '34'].includes(d.slice(0, 2))) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  for (let i = 0; i < 10; i++) suma += Number(d[i]) * pesos[i];
  let v = 11 - (suma % 11);
  if (v === 11) v = 0;
  else if (v === 10) v = 9;
  return v === Number(d[10]);
}
assert(normalizarCuit('20-12345678-6') === '20123456786', 'CUIT: normaliza a 11 dígitos');
assert(validarCuit('20-12345678-6'), 'CUIT: checksum válido');
assert(!validarCuit('20-12345678-0'), 'CUIT: checksum inválido rechazado');
assert(!validarCuit('123'), 'CUIT: longitud inválida rechazada');
assert(!validarCuit('99-12345678-6'), 'CUIT: prefijo desconocido rechazado');

// --- Enmascaramiento ---
function maskCuit(valor) {
  const d = normalizarCuit(valor);
  return `${d.slice(0, 2)}-******-${d.slice(-1)}`;
}
assert(maskCuit('20123456786') === '20-******-6', 'CUIT: enmascarado 20-******-6');

// --- Dirección: componer y aproximar ---
function componer(loc) {
  const cn = [loc.calle, loc.numero].filter(Boolean).join(' ');
  const p = [cn, loc.localidad, loc.provincia, loc.codigoPostal].filter(Boolean);
  return p.length ? p.join(', ') : loc.address;
}
const loc = { calle: 'Av. Corrientes', numero: '1234', localidad: 'CABA', provincia: 'Buenos Aires', codigoPostal: '1043' };
assert(componer(loc) === 'Av. Corrientes 1234, CABA, Buenos Aires, 1043', 'Dirección: compone los campos');

function approximate(l) {
  const zona = [l.localidad ?? l.city, l.provincia ?? l.province].filter(Boolean).join(', ');
  return zona ? `Zona aproximada: ${zona}` : 'Zona aproximada';
}
const aprox = approximate(loc);
assert(aprox.includes('Zona aproximada'), 'Privacidad: muestra zona aproximada');
assert(!aprox.includes('Corrientes'), 'Privacidad: no expone calle/número');

// --- Archivos y textos ---
const norm = fs.readFileSync(path.join(root, 'src/services/normalize.ts'), 'utf8');
assert(norm.includes("case 'CUIT'"), 'normalize: caso CUIT');
assert(norm.includes('validarCuit'), 'normalize: validarCuit');
assert((norm.match(/\{ id: '/g) || []).length >= 16, 'Categorías: 16 o más por defecto');
assert(norm.includes('VENTA_FRAUDULENTA') && norm.includes('CRIPTOMONEDAS'), 'Categorías nuevas incluidas');
assert(norm.includes('icono:') && norm.includes('color:'), 'Categorías con ícono y color');
assert(/LOCAL_FISICO[^}]*requiereUbicacion: true/.test(norm), 'LOCAL_FISICO requiere ubicación');

const p4 = fs.readFileSync(path.join(root, 'src/screens/P4_CreateReportScreen.tsx'), 'utf8');
assert(p4.includes("'CUIT'"), 'P4: incluye CUIT');
assert(p4.includes('MapPickerModal'), 'P4: usa modal de mapa');
assert(p4.includes('handleBuscarDireccion'), 'P4: buscador de dirección');
assert(p4.includes('Calle') && p4.includes('Localidad') && p4.includes('Provincia'), 'P4: campos de dirección');

const mask = fs.readFileSync(path.join(root, 'src/services/masking.ts'), 'utf8');
assert(mask.includes("type === 'CUIT'"), 'masking: CUIT');
assert(mask.includes('approximateLocation'), 'masking: ubicación aproximada');

const p16 = fs.readFileSync(path.join(root, 'src/screens/P16_AdminCategoriesScreen.tsx'), 'utf8');
assert(p16.includes('ICONOS') && p16.includes('COLORES'), 'P16: selector de ícono y color');

console.log(`\nTOTAL REPORT-CAPTURE: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
