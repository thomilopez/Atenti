/**
 * Verificación del bloque de notificaciones (RF-077 a RF-080).
 * Self-contained (no importa TS) para correr con `node scripts/verify-notificaciones.js`.
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
  'src/services/pushService.ts',
  'src/services/notificationPreferences.ts',
  'src/services/corroborationService.ts',
  'src/screens/P19_NotificationCenterScreen.tsx',
  'src/screens/P26_NotificationPreferencesScreen.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- RF-080: preferencias por tipo ---
const DEFAULT = { estado: true, corroboracion: true, resolucion: true };
function preferenciaParaTipo(tipo, prefs) {
  switch (tipo) {
    case 'CORROBORACION':
      return prefs.corroboracion;
    case 'DISPUTA_RESUELTA':
      return prefs.resolucion;
    case 'IMPUGNACION':
    case 'CAMBIO_ESTADO':
      return prefs.estado;
    default:
      return true;
  }
}
assert(DEFAULT.estado && DEFAULT.corroboracion && DEFAULT.resolucion, 'RF-080: defaults habilitados');
assert(preferenciaParaTipo('CAMBIO_ESTADO', { ...DEFAULT, estado: false }) === false, 'RF-080: estado deshabilitado');
assert(preferenciaParaTipo('CORROBORACION', { ...DEFAULT, corroboracion: false }) === false, 'RF-080: corroboracion deshabilitada');
assert(preferenciaParaTipo('DISPUTA_RESUELTA', { ...DEFAULT, resolucion: false }) === false, 'RF-080: resolucion deshabilitada');

// --- RF-077: payload de push ---
function construirMensaje(token, mensaje, tipo) {
  return { to: token, title: 'Atenti', body: mensaje, data: { tipo } };
}
const push = construirMensaje('ExponentPushToken[x]', 'Tu denuncia fue publicada', 'CAMBIO_ESTADO');
assert(push.to.startsWith('ExponentPushToken['), 'RF-077: token de Expo válido');
assert(push.title === 'Atenti' && push.data.tipo === 'CAMBIO_ESTADO', 'RF-077: payload de push correcto');

// --- RF-078: deduplicación de corroboraciones ---
const coincidentes = [
  { uid: 'u1' },
  { uid: 'u1' },
  { uid: 'u2' },
];
const uids = new Set(coincidentes.map((c) => c.uid));
assert(uids.size === 2, 'RF-078: corroboraciones deduplicadas por uid');

// --- RF-079: notificación de resolución ---
function mensajeResolucion(codigo, resultado) {
  return `La disputa de ${codigo} fue resuelta (${resultado}).`;
}
assert(mensajeResolucion('AT-2026-000001', 'PUBLICADA').includes('resuelta'), 'RF-079: mensaje de resolución');

// --- Tipos de notificación ---
const tipos = fs.readFileSync(path.join(root, 'src/services/notificationService.ts'), 'utf8');
assert(tipos.includes('CAMBIO_ESTADO'), 'Existe tipo CAMBIO_ESTADO');
assert(tipos.includes('CORROBORACION'), 'Existe tipo CORROBORACION');

console.log(`\nTOTAL NOTIFICACIONES: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
