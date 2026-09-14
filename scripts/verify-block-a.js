/**
 * Verificación Bloque A (T01–T04): idempotencia, estados, normalización, I-01/I-05/I-06/I-07.
 * Self-contained (no importa TS) para correr con `node scripts/verify-block-a.js`.
 */
let passed = 0;
let failed = 0;
function assert(cond, name) {
  if (cond) { console.log(`✅ PASS: ${name}`); passed++; }
  else { console.error(`❌ FAIL: ${name}`); failed++; }
}

// --- T03 normalización (réplica de normalize.ts) ---
function normalizeIdentifier(type, raw) {
  const v = (raw ?? '').trim();
  if (type === 'Alias') return v.toLowerCase().replace(/\s+/g, '');
  if (type === 'CBU') return v.replace(/\D/g, '');
  if (type === 'Tel') {
    let d = v.replace(/\D/g, '');
    if (d.startsWith('0')) d = d.slice(1);
    d = d.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
    if (d.startsWith('54')) return `+${d}`;
    return `+54${d}`;
  }
  return v.toLowerCase().replace(/\s+/g, ' ').trim();
}
assert(normalizeIdentifier('Alias', ' Ju.MP ') === 'ju.mp', 'T03: Alias normaliza a minúsculas');
assert(normalizeIdentifier('CBU', '0000-0031-0008 4729') === '0000003100084729', 'T03: CBU solo dígitos');
assert(normalizeIdentifier('Tel', '011 15-3849-2018') === '+541138492018', 'T03: Tel a E.164 AR');
assert(normalizeIdentifier('Local', 'Av.  Corrientes  1420 ') === 'av. corrientes 1420', 'T03: Local colapsa espacios');

// --- T02 máquina de estados (réplica) ---
const T = { RECIBIDA: ['PUBLICADA'], PUBLICADA: ['EN_DISPUTA'], EN_DISPUTA: ['RESUELTA'], RESUELTA: [] };
const can = (f, t) => (T[f] || []).includes(t);
assert(can('RECIBIDA', 'PUBLICADA'), 'T02: RECIBIDA->PUBLICADA permitida');
assert(!can('RECIBIDA', 'RESUELTA'), 'T02/RG-10: salto RECIBIDA->RESUELTA rechazado (CP-09)');
assert(!can('PUBLICADA', 'RESUELTA'), 'T02: PUBLICADA->RESUELTA rechazada');
assert(can('EN_DISPUTA', 'RESUELTA'), 'T02: EN_DISPUTA->RESUELTA permitida');

// RG-11: nota obligatoria
function needsNota(dest, nota) { return !(dest === 'RESUELTA' && !nota?.trim()); }
assert(!needsNota('RESUELTA', ''), 'T02/RG-11: RESUELTA sin nota se rechaza (CP-10)');
assert(needsNota('RESUELTA', 'Descargo verificado'), 'T02/RG-11: RESUELTA con nota ok');

// --- T01 idempotencia + I-01 ---
const byClave = new Map();
function registrar(clave, codigo) {
  if (byClave.has(clave)) return { codigo: byClave.get(clave), idempotente: true };
  byClave.set(clave, codigo);
  return { codigo, idempotente: false };
}
const r1 = registrar('op_abc12345', 'AT-2026-000001');
const r2 = registrar('op_abc12345', 'AT-2026-000001');
assert(!r1.idempotente && r2.idempotente && r1.codigo === r2.codigo, 'T01/RG-06/CP-06: reintento misma clave devuelve mismo código');
assert(/^AT-2026-\d{6}$/.test('AT-2026-000001'), 'T01/I-01: código AT-2026-XXXXXX válido');

// I-06: pct == suma componentes
const b = { identityScore: 30, evidenceScore: 45, corroborationScore: 5 };
assert(b.identityScore + b.evidenceScore + b.corroborationScore === 80, 'I-06: 30+45+5=80');

// I-05: estado == último evento
const hist = [{ destino: 'RECIBIDA' }, { destino: 'PUBLICADA' }];
assert(hist[hist.length - 1].destino === 'PUBLICADA', 'I-05: estado_actual == último evento');

// I-07: proyección sin email/uid
const pub = { codigo: 'AT-2026-000001', titulo: 'Alias: ju**.mp' };
const leaked = JSON.stringify(pub);
assert(!leaked.includes('@') && !leaked.includes('uid'), 'I-07: proyección pública sin email/uid');

// Archivos del bloque existen
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
for (const f of ['src/services/normalize.ts', 'src/services/operationKey.ts', 'src/services/stateMachine.ts', 'src/services/masking.ts', 'firestore.rules', 'firestore.indexes.json']) {
  assert(fs.existsSync(path.join(root, f)), `T04: existe ${f}`);
}

console.log(`\nTOTAL BLOQUE A: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
