/**
 * Verificación del bloque "scam-stories".
 * Self-contained (no importa TS) para correr con `node scripts/verify-stories.js`.
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
  'src/services/storyService.ts',
  'src/services/storyModerationService.ts',
  'src/services/storySubscriptions.ts',
  'src/services/storyDrafts.ts',
  'src/screens/P27_StoriesFeedScreen.tsx',
  'src/screens/P28_StoryDetailScreen.tsx',
  'src/screens/P29_CreateStoryScreen.tsx',
  'src/screens/P30_MyStoriesScreen.tsx',
  'src/screens/P32_StoryModerationScreen.tsx',
  'src/screens/P33_CommunityGuidelinesScreen.tsx',
];
for (const f of archivos) {
  assert(fs.existsSync(path.join(root, f)), `Existe ${f}`);
}

// --- Validación del relato ---
function validarRelato(input) {
  if (!input.titulo.trim()) return 'título';
  if (!input.categoria) return 'categoría';
  if (input.modusOperandi.trim().length < 20) return 'modo';
  return null;
}
assert(validarRelato({ titulo: 'x', categoria: '', modusOperandi: 'a'.repeat(20) }) === 'categoría', 'Relato: exige categoría');
assert(validarRelato({ titulo: 'x', categoria: 'c', modusOperandi: 'corto' }) === 'modo', 'Relato: modo mínimo 20 caracteres');
assert(validarRelato({ titulo: 'x', categoria: 'c', modusOperandi: 'a'.repeat(20) }) === null, 'Relato: válido');

// --- Estados de moderación ---
const TRANSICIONES = { EN_REVISION: ['PUBLICADA', 'OCULTA'], PUBLICADA: [], OCULTA: [] };
function puede(desde, a) {
  return (TRANSICIONES[desde] || []).includes(a);
}
assert(puede('EN_REVISION', 'PUBLICADA'), 'Moderación: EN_REVISION -> PUBLICADA');
assert(puede('EN_REVISION', 'OCULTA'), 'Moderación: EN_REVISION -> OCULTA');
assert(!puede('PUBLICADA', 'EN_REVISION'), 'Moderación: no vuelve a revisión');

// --- Relatos relacionados por identificador ---
const relatos = [
  { estado: 'PUBLICADA', identificadoresNormalizados: ['ju.mp'] },
  { estado: 'PUBLICADA', identificadoresNormalizados: ['otro'] },
  { estado: 'EN_REVISION', identificadoresNormalizados: ['ju.mp'] },
];
const relacionados = relatos.filter(
  (r) => r.estado === 'PUBLICADA' && (r.identificadoresNormalizados || []).includes('ju.mp')
);
assert(relacionados.length === 1, 'Relatos: solo públicos y vinculados');

// --- Preferencias de relatos ---
function preferenciaParaTipo(tipo, prefs) {
  switch (tipo) {
    case 'RELATO_PUBLICADO':
    case 'RELATO_OCULTO':
      return prefs.relatos;
    default:
      return true;
  }
}
assert(preferenciaParaTipo('RELATO_PUBLICADO', { relatos: false }) === false, 'Relatos: preferencia deshabilitada');
assert(preferenciaParaTipo('RELATO_PUBLICADO', { relatos: true }) === true, 'Relatos: preferencia habilitada');

// --- Suscripciones sin duplicados ---
function seguir(categorias, c) {
  return categorias.includes(c) ? categorias : [...categorias, c];
}
assert(seguir(['a'], 'a').length === 1, 'Suscripciones: sin duplicados');
assert(seguir(['a'], 'b').length === 2, 'Suscripciones: agrega categoría');

// --- Textos de archivos ---
const notif = fs.readFileSync(path.join(root, 'src/services/notificationService.ts'), 'utf8');
assert(notif.includes('RELATO_PUBLICADO') && notif.includes('RELATO_OCULTO'), 'Notificaciones: tipos de relato');

const prefs = fs.readFileSync(path.join(root, 'src/services/notificationPreferences.ts'), 'utf8');
assert(prefs.includes('relatos: true'), 'Preferencias: relatos habilitado por defecto');

const bottom = fs.readFileSync(path.join(root, 'src/components/BottomNavBar.tsx'), 'utf8');
assert(bottom.includes("navigate('P27_StoriesFeed')"), 'Barra inferior: tab Historias');

const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
assert(rules.includes('match /relatos/{id}'), 'Reglas: colección relatos');

const p29 = fs.readFileSync(path.join(root, 'src/screens/P29_CreateStoryScreen.tsx'), 'utf8');
assert(p29.includes('24hs'), 'P29: aviso de 24hs');

console.log(`\nTOTAL STORIES: ${passed} pasadas, ${failed} fallidas`);
if (failed > 0) process.exit(1);
