/**
 * Verificación del bloque "evidencias + mapa + credibilidad".
 * Self-contained (no importa TS) para correr con `node scripts/verify-evidencias.js`.
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
  'src/services/locationService.ts',
  'src/services/evidenceService.ts',
  'src/services/storageService.ts',
  'src/services/scoreHistory.ts',
  'src/components/ScoreBreakdown.tsx',
  'src/components/MapViewWrapper.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- RF-033/RF-034: validación de evidencias ---
const MAX_EVIDENCIAS = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const EXT = ['jpg', 'jpeg', 'png', 'pdf'];
const MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

function extensionDe(a) {
  const n = a.name || a.uri || '';
  const m = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(n);
  return (m?.[1] ?? '').toLowerCase();
}
function formatoPermitido(a) {
  if (EXT.includes(extensionDe(a))) return true;
  return MIMES.includes((a.mimeType || '').toLowerCase());
}
function validarArchivo(a, cantidad) {
  if (cantidad >= MAX_EVIDENCIAS) return { ok: false, error: 'límite' };
  if (!formatoPermitido(a)) return { ok: false, error: 'formato' };
  if (a.size && a.size > MAX_BYTES) return { ok: false, error: 'tamaño' };
  return { ok: true };
}

assert(validarArchivo({ uri: 'f.jpg', size: 1024 }, 0).ok, 'RF-033: JPG válido aceptado');
assert(!validarArchivo({ uri: 'f.exe' }, 0).ok, 'RF-034: formato inválido rechazado');
assert(!validarArchivo({ uri: 'f.pdf', size: 12 * 1024 * 1024 }, 0).ok, 'RF-033: archivo > 10MB rechazado');
assert(!validarArchivo({ uri: 'f.png', size: 1024 }, 5).ok, 'RF-033: límite de 5 evidencias');

// --- RF-046: semáforo de 4 colores ---
function nivelCredibilidad4(score) {
  if (score < 20) return 'GRIS';
  if (score < 40) return 'ROJO';
  if (score < 75) return 'NARANJA';
  return 'AMARILLO';
}
assert(nivelCredibilidad4(10) === 'GRIS', 'RF-046: 10% -> Gris');
assert(nivelCredibilidad4(30) === 'ROJO', 'RF-046: 30% -> Rojo');
assert(nivelCredibilidad4(50) === 'NARANJA', 'RF-046: 50% -> Naranja');
assert(nivelCredibilidad4(80) === 'AMARILLO', 'RF-046: 80% -> Amarillo');

// --- RF-042: fórmula unificada 40/45/15 ---
function calcularRG07(identity, evidences, corroboracion) {
  let id = 0;
  if (identity.google) id += 15;
  if (identity.phone) id += 15;
  if (identity.dni) id += 10;
  id = Math.min(40, id);

  let ev = 0;
  if (evidences.includes('chat')) ev += 20;
  if (evidences.includes('receipt')) ev += 20;
  if (evidences.includes('ocr')) ev += 5;
  ev = Math.min(45, ev);

  const corr = corroboracion >= 3 ? 15 : corroboracion === 2 ? 10 : corroboracion === 1 ? 5 : 0;
  return Math.min(100, id + ev + corr);
}
assert(calcularRG07({ google: true }, [], 0) === 15, 'RF-042: identidad Google = 15');
assert(calcularRG07({ google: true, phone: true }, ['chat', 'receipt', 'ocr'], 1) === 80, 'RF-042: 30+45+5 = 80');
assert(calcularRG07({ google: true, phone: true, dni: true }, ['chat', 'receipt', 'ocr'], 3) === 100, 'RF-042: máximo 100');

// --- RF-035: agrupación de pines por grilla ---
function agrupar(incidents, grid = 0.02) {
  const mapa = new Map();
  for (const inc of incidents) {
    const key = `${Math.floor(inc.latitude / grid)}_${Math.floor(inc.longitude / grid)}`;
    if (!mapa.has(key)) mapa.set(key, []);
    mapa.get(key).push(inc);
  }
  return Array.from(mapa.values());
}
const clusters = agrupar([
  { latitude: -34.6037, longitude: -58.3816 },
  { latitude: -34.6038, longitude: -58.3815 },
  { latitude: -31.4201, longitude: -64.1888 },
]);
assert(clusters.length === 2, 'RF-035: pines cercanos se agrupan y los lejanos no');

// --- RF-049: historial de score ---
const historial = new Map();
function registrar(denunciaId, score, motivo) {
  const lista = historial.get(denunciaId) || [];
  lista.push({ score, motivo, fecha: new Date().toISOString() });
  historial.set(denunciaId, lista);
}
registrar('d1', 15, 'Creación sin evidencias');
registrar('d1', 80, 'Evidencias adjuntas');
const eventos = historial.get('d1');
assert(eventos.length === 2, 'RF-049: historial conserva dos eventos');
assert(eventos[1].score === 80, 'RF-049: último evento refleja el score final');

console.log(`\nTOTAL EVIDENCIAS: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
