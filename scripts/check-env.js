/**
 * Verifica que las variables de entorno requeridas estén definidas.
 *
 * Uso: node scripts/check-env.js
 * Sale con código 1 si falta alguna variable obligatoria, 0 si están todas.
 */
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
  'EXPO_PUBLIC_CLOUD_FUNCTIONS_BASE_URL',
  'EXPO_PUBLIC_RENAPER_ENABLED',
  'EXPO_PUBLIC_RENAPER_ENDPOINT',
  'EXPO_PUBLIC_RENAPER_API_KEY',
  'EXPO_PUBLIC_RATE_LIMIT_DAILY',
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
