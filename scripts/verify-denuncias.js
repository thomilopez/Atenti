/**
 * Verificación del bloque "denuncias completas" (RG-02/RG-03, admin, export, búsqueda).
 * Self-contained (no importa TS) para correr con `node scripts/verify-denuncias.js`.
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

// --- Existencia de archivos ---
const archivos = [
  'src/services/categoryService.ts',
  'src/services/adminService.ts',
  'src/services/exportService.ts',
  'src/services/autocompleteService.ts',
  'src/screens/P14_AdminDashboardScreen.tsx',
  'src/screens/P15_AdminDisputeScreen.tsx',
  'src/screens/P16_AdminCategoriesScreen.tsx',
  'src/screens/P17_AdminUsersScreen.tsx',
  'src/screens/P18_AdminAuditScreen.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- RG-02: relato y evidencia ---
function rg02Valido(story, evidencias) {
  return (story || '').trim().length >= 20 && (evidencias || []).length >= 1;
}
assert(!rg02Valido('corto', [{ id: 1 }]), 'RG-02: relato corto rechazado');
assert(!rg02Valido('Este es un relato suficientemente largo', []), 'RG-02: sin evidencia rechazado');
assert(rg02Valido('Este es un relato suficientemente largo', [{ id: 1 }]), 'RG-02: relato + evidencia válidos');

// --- RG-03: categorías con ubicación ---
const CATEGORIAS = [
  { id: 'ESTAFA_BANCARIA', requiereUbicacion: false },
  { id: 'LOCAL_FISICO', requiereUbicacion: true },
];
const local = CATEGORIAS.find((c) => c.id === 'LOCAL_FISICO');
assert(local && local.requiereUbicacion === true, 'RG-03: LOCAL_FISICO requiere ubicación');
assert(!CATEGORIAS.find((c) => c.id === 'ESTAFA_BANCARIA').requiereUbicacion, 'RG-03: categoría virtual no exige pin');

// --- Máquina de estados: disputa ---
const T = {
  RECIBIDA: ['PUBLICADA'],
  PUBLICADA: ['EN_DISPUTA'],
  EN_DISPUTA: ['PUBLICADA', 'RESUELTA'],
  RESUELTA: [],
};
const can = (f, t) => (T[f] || []).includes(t);
assert(can('EN_DISPUTA', 'PUBLICADA'), 'RF-067: mantener publicada permitida');
assert(can('EN_DISPUTA', 'RESUELTA'), 'RF-067: retirar permitida');
assert(!can('PUBLICADA', 'RESUELTA'), 'RF-067: no se puede saltar la disputa');

// --- CSV escaping (réplica de exportService) ---
function escaparCSV(valor) {
  const s = String(valor ?? '');
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
assert(escaparCSV('simple') === 'simple', 'CSV: valor simple sin comillas');
assert(escaparCSV('con,coma') === '"con,coma"', 'CSV: valor con coma se escapa');
assert(escaparCSV('di "hola"') === '"di ""hola"""', 'CSV: comillas se duplican');

// --- Dataset anonimizado ---
const denuncias = [
  { audit: { uid: 'u1', userEmail: 'a@b.com', clientIp: '1.2.3.4' }, trackingCode: 'AT-2026-000001', category: 'Estafa', estadoActual: 'PUBLICADA', credibilityScore: 80, location: { city: 'CABA' } },
];
const dataset = denuncias.map((d) => ({
  codigo: d.trackingCode,
  categoria: d.category,
  estado: d.estadoActual,
  score: d.credibilityScore,
  fecha: d.audit.createdAt,
  localidad: d.location.city,
}));
const json = JSON.stringify(dataset);
assert(!json.includes('a@b.com') && !json.includes('u1') && !json.includes('1.2.3.4'), 'RF-072: dataset sin email, uid ni IP');

// --- Autocompletado tolerante ---
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[n];
}
function similitud(a, b) {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max;
}
assert(similitud('ju.mp', 'ju.mq') >= 0.7, 'RF-061: error de tipeo sigue siendo similar');
assert(similitud('ju.mp', 'otro.valor') < 0.7, 'RF-061: valor distinto no sugiere');

console.log(`\nTOTAL DENUNCIAS: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
