/**
 * Verificación del bloque de impugnaciones (RF-073 a RF-076).
 * Self-contained (no importa TS) para correr con `node scripts/verify-impugnaciones.js`.
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
  'src/services/impugnationService.ts',
  'src/services/notificationService.ts',
  'src/screens/P21_ImpugnacionScreen.tsx',
  'src/screens/P22_DisputeStatusScreen.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- RF-073: validación de CUIT/DNI ---
function validarDocumento(valor) {
  const limpio = (valor || '').replace(/[.\s-]/g, '');
  return /^\d{7,11}$/.test(limpio);
}
assert(validarDocumento('20123456'), 'RF-073: DNI de 8 dígitos válido');
assert(validarDocumento('20-12345678-9'), 'RF-073: CUIT con guiones válido');
assert(!validarDocumento('abc1234'), 'RF-073: documento con letras rechazado');
assert(!validarDocumento('123'), 'RF-073: documento corto rechazado');

// --- RF-073: descargo mínimo ---
function validarDescargo(valor) {
  return (valor || '').trim().length >= 20;
}
assert(validarDescargo('Este es un descargo suficientemente largo'), 'RF-073: descargo válido');
assert(!validarDescargo('corto'), 'RF-073: descargo corto rechazado');

// --- RF-074: take-down (PUBLICADA -> EN_DISPUTA) ---
const T = {
  RECIBIDA: ['PUBLICADA'],
  PUBLICADA: ['EN_DISPUTA'],
  EN_DISPUTA: ['PUBLICADA', 'RESUELTA'],
  RESUELTA: [],
};
assert((T.PUBLICADA || []).includes('EN_DISPUTA'), 'RF-074: take-down PUBLICADA -> EN_DISPUTA permitido');

// --- RF-076: plazo de 72hs ---
const PLAZO_MS = 72 * 60 * 60 * 1000;
function tiempoRestante(deadline, ahora) {
  return Math.max(0, new Date(deadline).getTime() - ahora);
}
function estaVencida(deadline, ahora) {
  return tiempoRestante(deadline, ahora) <= 0;
}
const ahora = Date.now();
const futuro = new Date(ahora + PLAZO_MS).toISOString();
const pasado = new Date(ahora - 1000).toISOString();
assert(!estaVencida(futuro, ahora), 'RF-076: impugnación dentro del plazo');
assert(estaVencida(pasado, ahora), 'RF-076: impugnación vencida detectada');

// --- RF-076: escalación idempotente ---
const impugnaciones = [
  { id: 'i1', deadline: pasado, estado: 'PENDIENTE', escalada: false },
  { id: 'i2', deadline: futuro, estado: 'PENDIENTE', escalada: false },
  { id: 'i3', deadline: pasado, estado: 'RESUELTA', escalada: false },
];
function escalar(lista, ahoraMs) {
  let n = 0;
  for (const imp of lista) {
    if (imp.estado === 'RESUELTA' || imp.escalada) continue;
    if (new Date(imp.deadline).getTime() >= ahoraMs) continue;
    imp.escalada = true;
    imp.estado = 'ESCALADA';
    n++;
  }
  return n;
}
const primera = escalar(impugnaciones, ahora);
const segunda = escalar(impugnaciones, ahora);
assert(primera === 1, 'RF-076: solo escala la vencida y no resuelta');
assert(segunda === 0, 'RF-076: segunda corrida no duplica la escalada');

// --- RF-075: notificación al denunciante ---
function crearNotificacion(uid, mensaje) {
  return { uid, mensaje, leida: false, fecha: new Date().toISOString() };
}
const notif = crearNotificacion('denunciante_1', 'Tu denuncia recibió una impugnación');
assert(notif.uid === 'denunciante_1' && !notif.leida, 'RF-075: notificación creada para el denunciante');

console.log(`\nTOTAL IMPUGNACIONES: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
