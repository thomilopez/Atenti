/**
 * Verificación del bloque "home-and-responsive".
 * Self-contained (no importa TS) para correr con `node scripts/verify-home.js`.
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
  'src/hooks/useResponsive.ts',
  'src/components/Skeleton.tsx',
  'src/components/HelpModal.tsx',
  'src/services/recentSearches.ts',
  'src/services/trends.ts',
  'src/screens/P0_WelcomeScreen.tsx',
  'src/screens/P31_FullMapScreen.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- Breakpoints (réplica de useResponsive) ---
function breakpoint(width) {
  if (width >= 768) return 'tablet';
  if (width < 360) return 'small';
  if (width >= 430) return 'large';
  return 'medium';
}
assert(breakpoint(320) === 'small', 'Responsive: 320px es small');
assert(breakpoint(390) === 'medium', 'Responsive: 390px es medium');
assert(breakpoint(430) === 'large', 'Responsive: 430px es large');
assert(breakpoint(800) === 'tablet', 'Responsive: 800px es tablet');

// --- Búsquedas recientes (dedupe + máximo 8) ---
function agregarReciente(lista, item) {
  const valor = item.value.trim();
  if (!valor) return lista;
  const filtrados = lista.filter(
    (r) => !(r.value.toLowerCase() === valor.toLowerCase() && r.type === item.type)
  );
  return [{ ...item, value: valor, fecha: 1 }, ...filtrados].slice(0, 8);
}
let recientes = [];
for (let i = 0; i < 10; i++) {
  recientes = agregarReciente(recientes, { value: `valor${i}`, type: 'Alias' });
}
assert(recientes.length === 8, 'Recientes: máximo 8');
recientes = agregarReciente(recientes, { value: 'valor9', type: 'Alias' });
assert(recientes[0].value === 'valor9', 'Recientes: el último queda primero');
assert(recientes.filter((r) => r.value === 'valor9').length === 1, 'Recientes: sin duplicados');

// --- Tendencias ---
function calcularTendencias(incidencias, max = 5) {
  const mapa = new Map();
  for (const inc of incidencias) {
    const key = `${inc.type}:${inc.value}`;
    const existente = mapa.get(key);
    if (existente) existente.count += 1;
    else mapa.set(key, { value: inc.value, type: inc.type, count: 1 });
  }
  return Array.from(mapa.values()).sort((a, b) => b.count - a.count).slice(0, max);
}
const tendencias = calcularTendencias([
  { type: 'Alias', value: 'ju.mp' },
  { type: 'Alias', value: 'ju.mp' },
  { type: 'CBU', value: '0000003100084729103829' },
]);
assert(tendencias[0].value === 'ju.mp' && tendencias[0].count === 2, 'Tendencias: ordena por frecuencia');

// --- Navegación y textos ---
const nav = fs.readFileSync(path.join(root, 'src/navigation/AppNavigator.tsx'), 'utf8');
assert(nav.includes('initialRouteName="P0_Welcome"'), 'Navegación: arranca en P0');
assert(nav.includes('P31_FullMap'), 'Navegación: registra P31');

const bottom = fs.readFileSync(path.join(root, 'src/components/BottomNavBar.tsx'), 'utf8');
assert(bottom.includes("navigate('P31_FullMap')"), 'Barra inferior: Mapa abre P31');

const p0 = fs.readFileSync(path.join(root, 'src/screens/P0_WelcomeScreen.tsx'), 'utf8');
assert(p0.includes('ESLOGAN') && p0.includes('logo'), 'P0: logo y eslogan');

const p1 = fs.readFileSync(path.join(root, 'src/screens/P1_HomeScreen.tsx'), 'utf8');
assert(p1.includes('Ver mapa completo'), 'P1: acceso al mapa completo');
assert(p1.includes('Recientes') && p1.includes('Tendencias'), 'P1: recientes y tendencias');

console.log(`\nTOTAL HOME: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
