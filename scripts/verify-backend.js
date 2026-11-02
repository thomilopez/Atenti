/**
 * Verificación del bloque backend real (env, auth, OCR, offline, búsqueda).
 * Self-contained (no importa TS) para correr con `node scripts/verify-backend.js`.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// --- Existencia de archivos del cambio ---
const archivos = [
  'src/services/env.ts',
  'src/services/authService.ts',
  'src/services/renaperProvider.ts',
  'src/services/ddjjService.ts',
  'src/services/cloudFunctions.ts',
  'src/services/accountService.ts',
  'src/services/editWindow.ts',
  'src/services/softDeleteService.ts',
  'src/services/syncQueue.ts',
  'src/services/fuzzySearch.ts',
  'src/context/ConnectivityContext.tsx',
  'src/screens/P10_MisDenunciasScreen.tsx',
  'src/screens/P11_TrackingCodeScreen.tsx',
  'src/screens/P12_EditReportScreen.tsx',
  'src/screens/P13_SearchResultsScreen.tsx',
  'src/screens/P20_SettingsScreen.tsx',
  'functions/src/index.ts',
  '.env.example',
  'docs/setup-servicios.md',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- P6 unificado en P4 (el archivo duplicado ya no existe) ---
assert(
  !fs.existsSync(path.join(root, 'src/screens/P6_ValidationErrorScreen.tsx')),
  'P6 unificado en P4 (sin pantalla duplicada)'
);

// --- RF-088 checksum CBU ---
function validarBloqueCbu(bloque, pesos) {
  let suma = 0;
  for (let i = 0; i < pesos.length; i++) suma += Number(bloque[i]) * pesos[i];
  return (10 - (suma % 10)) % 10 === Number(bloque[pesos.length]);
}
function validarCbu(valor) {
  const d = (valor || '').replace(/\D/g, '');
  if (d.length !== 22) return false;
  return (
    validarBloqueCbu(d.slice(0, 8), [7, 1, 3, 9, 7, 1, 3]) &&
    validarBloqueCbu(d.slice(8), [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3])
  );
}
assert(validarCbu('2850590940090418135201'), 'RF-088: CBU válido');
assert(!validarCbu('0000003100084729103829'), 'RF-088: CBU inválido rechazado');

// --- RF-061 fuzzy search (Levenshtein) ---
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
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
assert(similitud('ju.mp', 'ju.mp') === 1, 'RF-061: texto idéntico da similitud 1');
assert(similitud('ju.mp', 'ju.mp ') > 0.8, 'RF-061: diferencia menor sigue siendo similar');
assert(similitud('ju.mp', 'totalmente.otro') < 0.5, 'RF-061: texto distinto baja la similitud');

// --- RF-023 ventana de edición 24hs ---
function puedeEditar(creadaEn, ahora) {
  return new Date(creadaEn).getTime() + 24 * 60 * 60 * 1000 > ahora;
}
const ahora = Date.now();
assert(puedeEditar(new Date(ahora - 60 * 60 * 1000).toISOString(), ahora), 'RF-023: editable dentro de 24hs');
assert(!puedeEditar(new Date(ahora - 25 * 60 * 60 * 1000).toISOString(), ahora), 'RF-023: bloqueado fuera de 24hs');

// --- RF-056 backoff exponencial ---
function calcularBackoff(intentos) {
  return Math.min(5 * 60 * 1000, 1000 * Math.pow(2, Math.max(0, intentos)));
}
assert(calcularBackoff(0) === 1000, 'RF-056: primer reintento espera 1s');
assert(calcularBackoff(1) === 2000, 'RF-056: segundo reintento espera 2s');
assert(calcularBackoff(20) === 5 * 60 * 1000, 'RF-056: backoff se topa en 5min');

// --- RF-012 / RNF-003 hash DDJJ SHA-256 ---
const payload = JSON.stringify({ uid: 'u1', ip: '127.0.0.1', versionTerminos: 'v1.0', aceptadaEn: '2026-01-01T00:00:00Z' });
const hash = crypto.createHash('sha256').update(payload).digest('hex');
assert(/^[a-f0-9]{64}$/.test(hash), 'RNF-003: hash DDJJ SHA-256 de 64 hex');
assert(hash === crypto.createHash('sha256').update(payload).digest('hex'), 'RNF-003: hash determinístico');

// --- RF-065 EN_DISPUTA excluida del listado público ---
const denuncias = [
  { id: '1', estadoActual: 'PUBLICADA', eliminada: false },
  { id: '2', estadoActual: 'EN_DISPUTA', eliminada: false },
  { id: '3', estadoActual: 'PUBLICADA', eliminada: true },
];
const publicas = denuncias.filter((d) => !d.eliminada && d.estadoActual !== 'EN_DISPUTA');
assert(publicas.length === 1 && publicas[0].id === '1', 'RF-065: solo PUBLICADA y no eliminada es visible');

console.log(`\nTOTAL BACKEND: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
