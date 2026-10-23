/**
 * Verifica que las variables de entorno requeridas estén definidas.
 *
 * Uso: node scripts/check-env.js
 * Sale con código 1 si falta alguna variable obligatoria, 0 si están todas.
 *
 * Nota: `node` no carga .env automáticamente (eso lo hace Expo). Por eso este
 * script lee .env / .env.local del root del proyecto antes de verificar. Las
 * variables ya presentes en el entorno (por ejemplo en CI) tienen prioridad.
 */
const fs = require('fs');
const path = require('path');

function cargarEnv(nombreArchivo) {
  const ruta = path.join(__dirname, '..', nombreArchivo);
  if (!fs.existsSync(ruta)) return;
  const contenido = fs.readFileSync(ruta, 'utf8');
  for (const linea of contenido.split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#')) continue;
    const idx = limpia.indexOf('=');
    if (idx === -1) continue;
    const clave = limpia.slice(0, idx).trim();
    let valor = limpia.slice(idx + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (process.env[clave] === undefined) {
      process.env[clave] = valor;
    }
  }
}

cargarEnv('.env');
cargarEnv('.env.local');

const REQUIRED = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
];

const OPTIONAL = [
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  'EXPO_PUBLIC_CLOUD_FUNCTIONS_BASE_URL',
  'EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION',
  'EXPO_PUBLIC_RENAPER_ENABLED',
  'EXPO_PUBLIC_RENAPER_ENDPOINT',
  'EXPO_PUBLIC_RENAPER_API_KEY',
  'EXPO_PUBLIC_RATE_LIMIT_DAILY',
  'EXPO_PUBLIC_ADMIN_EMAILS',
  'EXPO_PUBLIC_SENTRY_DSN',
];

console.log('=====================================================');
console.log('🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO - ATENTI');
console.log('=====================================================\n');

const missing = REQUIRED.filter((key) => !process.env[key] || !process.env[key].trim());

if (missing.length > 0) {
  console.error('❌ FAIL: faltan variables de entorno requeridas:');
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error('\nDefinilas en el archivo .env (copiá .env.example como base).');
  process.exit(1);
}

const presentOptional = OPTIONAL.filter((key) => process.env[key] && process.env[key].trim());
const missingOptional = OPTIONAL.filter((key) => !process.env[key] || !process.env[key].trim());

console.log('✅ PASS: todas las variables requeridas están presentes');
console.log(`   Opcionales presentes: ${presentOptional.length}/${OPTIONAL.length}`);
if (missingOptional.length > 0) {
  console.log(`   Opcionales ausentes (la app usa valores por defecto): ${missingOptional.join(', ')}`);
}
console.log('\n✅ check-env: OK');
