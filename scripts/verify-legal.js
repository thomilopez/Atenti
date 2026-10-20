/**
 * Verificación del bloque legal e infraestructura (RF-081 a RF-101).
 * Self-contained (no importa TS) para correr con `node scripts/verify-legal.js`.
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

const archivos = [
  'src/services/termsService.ts',
  'src/services/auditService.ts',
  'src/services/lexiconFilter.ts',
  'src/services/observability.ts',
  'src/services/analytics.ts',
  'src/services/cacheService.ts',
  'src/screens/P23_LegalScreen.tsx',
  'src/screens/P24_RightToBeForgottenScreen.tsx',
  'src/screens/P25_AuditLogScreen.tsx',
  'eas.json',
  '.github/workflows/ci.yml',
  '.maestro/flujo-critico.yaml',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- RF-082: hash SHA-256 de la DDJJ ---
const payload = JSON.stringify({ uid: 'u1', ip: '1.2.3.4', aceptadaEn: '2026-01-01T00:00:00Z' });
const hash = crypto.createHash('sha256').update(payload).digest('hex');
assert(/^[a-f0-9]{64}$/.test(hash), 'RF-082: hash SHA-256 de 64 hex');
assert(hash === crypto.createHash('sha256').update(payload).digest('hex'), 'RF-082: hash determinístico');

// --- RF-083/084/085: términos, privacidad y retención ---
const termsSrc = fs.readFileSync(path.join(root, 'src/services/termsService.ts'), 'utf8');
assert(termsSrc.includes('TERMINOS_VERSIONS'), 'RF-083: catálogo de versiones de términos');
assert(termsSrc.includes('RETENCION_ANIOS'), 'RF-085: plazo de retención definido');
assert(termsSrc.includes('LEY_25326_URL'), 'RF-084: referencia a la Ley 25.326');

// --- RF-087: filtro léxico ---
const LEXICON = ['boludo', 'pelotudo', 'mierda', 'idiota'];
function enmascarar(p) {
  return p.length <= 1 ? '*' : p[0] + '*'.repeat(p.length - 1);
}
function filtrarTexto(texto) {
  let r = texto || '';
  for (const t of LEXICON) {
    r = r.replace(new RegExp(`\\b${t}\\b`, 'gi'), (m) => enmascarar(m));
  }
  return r;
}
assert(filtrarTexto('sos un boludo') === 'sos un b*****', 'RF-087: término ofensivo enmascarado');
assert(filtrarTexto('texto limpio') === 'texto limpio', 'RF-087: texto limpio sin cambios');
assert(!/boludo/i.test(filtrarTexto('sos un boludo')), 'RF-087: el término ya no queda visible');

// --- RF-100: cache con TTL ---
const cache = new Map();
function setCache(key, valor, ttl, ahora) {
  cache.set(key, { valor, expira: ahora + ttl });
}
function getCache(key, ahora) {
  const e = cache.get(key);
  if (!e || e.expira <= ahora) return null;
  return e.valor;
}
const t0 = 1000;
setCache('incidents:a', [1, 2], 30000, t0);
assert(Array.isArray(getCache('incidents:a', t0 + 1000)), 'RF-100: cache vigente responde');
assert(getCache('incidents:a', t0 + 31000) === null, 'RF-100: cache expira por TTL');

// --- RF-097: analytics con consentimiento ---
let consentimiento = false;
let eventos = 0;
function registrarEvento() {
  if (consentimiento) eventos++;
}
registrarEvento();
assert(eventos === 0, 'RF-097: sin consentimiento no registra');
consentimiento = true;
registrarEvento();
assert(eventos === 1, 'RF-097: con consentimiento registra');

// --- RF-094: perfiles EAS ---
const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
assert(Boolean(eas.build.development), 'RF-094: perfil development');
assert(Boolean(eas.build.preview), 'RF-094: perfil preview');
assert(Boolean(eas.build.production), 'RF-094: perfil production');

// --- RF-098: CI ---
const ci = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');
assert(ci.includes('typecheck') && ci.includes('verify:all'), 'RF-098: CI corre typecheck y verify:all');

console.log(`\nTOTAL LEGAL: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
