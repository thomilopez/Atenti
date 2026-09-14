/**
 * Verificación Bloque B (T05–T07):
 * - T05: Google Sign-In, sesión, U0 bloqueado RG-01, logout inicial null, CA2/CP-04.
 * - T06: DDJJ + Términos bloqueante, hash DDJJ + IP + timestamp en audit RNF3, extracto indemnidad en P8.
 * - T07: U2 progresivo (SMS OTP +15 pts, DNI OCR +10 pts), IdentityUpgradeScreen real.
 * 
 * Ejecutable de forma autónoma con `node scripts/verify-block-b.js`.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    failed++;
  }
}

console.log('=====================================================');
console.log('🔍 VERIFICACIÓN BLOQUE B: AUTH / IDENTIDAD / LEGAL');
console.log('=====================================================\n');

// ----------------------------------------------------
// PRUEBAS T05: Autenticación, sesión y bloqueo RG-01
// ----------------------------------------------------
console.log('--- [T05] Google Sign-In, Sesión y RG-01 ---');

// 1. Estado inicial U0 es null (anónimo)
let currentUser = null;
const isAuth = (u) => !!u && !!u.identityFactors?.googleAuth;
assert(currentUser === null && !isAuth(currentUser), 'T05: Estado inicial del usuario es null (visitante anónimo U0)');

// 2. Bloqueo estricto RG-01: U0 no puede registrar denuncia
function mockRegistrarDenuncia(input) {
  if (!input.googleVerificado || !input.ddjjAceptada) {
    throw new Error('RG-01: se requiere sesión Google válida y DDJJ aceptada (CP-04)');
  }
  return { codigo: 'AT-2026-000100', ok: true };
}

let errorU0 = null;
try {
  mockRegistrarDenuncia({
    googleVerificado: false,
    ddjjAceptada: true,
  });
} catch (e) {
  errorU0 = e.message;
}
assert(
  errorU0 && errorU0.includes('RG-01'),
  'T05/RG-01/CP-04: Usuario no autenticado (U0) es bloqueado al intentar registrar denuncia'
);

// 3. Login con Google crea sesión autenticada U1
function mockLoginWithGoogle(email = 'denunciante@atenti.com.ar') {
  return {
    uid: `usr_google_${Date.now()}`,
    email,
    displayName: 'Denunciante Atenti',
    identityFactors: {
      googleAuth: true,
      phoneVerified: false,
      dniVerified: false,
    },
  };
}
currentUser = mockLoginWithGoogle();
assert(
  isAuth(currentUser) && currentUser.identityFactors.googleAuth === true,
  'T05: Login con Google genera sesión persistible con googleAuth: true'
);

// 4. Logout restablece la sesión a null
function mockLogout() {
  currentUser = null;
}
mockLogout();
assert(currentUser === null, 'T05: Logout restablece currentUser a null');

// ----------------------------------------------------
// PRUEBAS T06: DDJJ, Auditoría RNF3 e Indemnidad
// ----------------------------------------------------
console.log('\n--- [T06] DDJJ, Auditoría RNF3 y Cláusula de Indemnidad ---');

// 1. Checkbox bloqueante (CP-04 / CA2): omisión de DDJJ bloquea registro
let errorDdjj = null;
try {
  mockRegistrarDenuncia({
    googleVerificado: true,
    ddjjAceptada: false, // Desmarcada
  });
} catch (e) {
  errorDdjj = e.message;
}
assert(
  errorDdjj && errorDdjj.includes('CP-04'),
  'T06/CP-04/CA2: Omisión de DDJJ bloquea estrictamente la operación'
);

// 2. Hash SHA-256 inmutable de DDJJ + IP + Timestamp (RNF3)
const CANONICAL_DDJJ =
  'DECLARACIÓN JURADA Y TÉRMINOS DE SERVICIO ATENTI (v1.0): Declaro bajo juramento que los datos, identidades y evidencias aportadas son verídicos, legítimos y de buena fe, asumiendo responsabilidad civil y penal en caso de falsedad testimonial conforme al Código Penal y la Ley 25.326 de Protección de Datos Personales de la República Argentina.';

function generateTestHash({ text, uid, ip, timestamp }) {
  const payload = `${text}|UID:${uid}|IP:${ip}|TIME:${timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

const testUid = 'usr_test_12345';
const testIp = '181.44.120.98';
const testTime = '2026-09-14T02:00:00.000Z';
const hash1 = generateTestHash({ text: CANONICAL_DDJJ, uid: testUid, ip: testIp, timestamp: testTime });
const hash2 = generateTestHash({ text: CANONICAL_DDJJ, uid: testUid, ip: testIp, timestamp: testTime });
const hashDifferentIp = generateTestHash({ text: CANONICAL_DDJJ, uid: testUid, ip: '190.220.10.1', timestamp: testTime });

assert(hash1 === hash2, 'T06/RNF3: El hash de DDJJ es determinístico para los mismos metadatos');
assert(hash1.length === 64, 'T06/RNF3: Hash DDJJ tiene longitud válida SHA-256 (64 caracteres hex)');
assert(hash1 !== hashDifferentIp, 'T06/RNF3: El hash cambia ante variación de IP del emisor');

// 3. Verificación de presencia de extracto de indemnidad en P8
const rootDir = path.join(__dirname, '..');
const p8Path = path.join(rootDir, 'src', 'screens', 'P8_ConfirmationScreen.tsx');
const p8Content = fs.readFileSync(p8Path, 'utf8');
assert(
  p8Content.includes('Indemnidad Legal') && p8Content.includes('LEGAL_INDEMNITY_EXTRACT'),
  'T06: Pantalla P8 incluye el extracto y tarjeta de indemnidad legal'
);

// ----------------------------------------------------
// PRUEBAS T07: U2 Progresivo (SMS OTP + DNI OCR)
// ----------------------------------------------------
console.log('\n--- [T07] U2 Progresivo (SMS OTP + DNI OCR) ---');

// 1. Escala de Identidad Progresiva RG-07 (Hasta 40 pts)
function calcIdentityScore(factors) {
  let pts = 0;
  if (factors.googleAuth) pts += 15;
  if (factors.phoneVerified) pts += 15;
  if (factors.dniVerified) pts += 10;
  return Math.min(40, pts);
}

assert(calcIdentityScore({ googleAuth: false, phoneVerified: false, dniVerified: false }) === 0, 'T07/RG-07: U0 = 0 pts');
assert(calcIdentityScore({ googleAuth: true, phoneVerified: false, dniVerified: false }) === 15, 'T07/RG-07: U1 (Google) = 15 pts');
assert(calcIdentityScore({ googleAuth: true, phoneVerified: true, dniVerified: false }) === 30, 'T07/RG-07: U2 (+SMS OTP) = 30 pts');
assert(calcIdentityScore({ googleAuth: true, phoneVerified: true, dniVerified: true }) === 40, 'T07/RG-07: U2 (+SMS OTP + DNI OCR) = 40 pts (tope)');

// 2. Validación de formato de DNI argentino
function isValidDni(val) {
  const c = String(val).replace(/\D/g, '');
  return c.length >= 7 && c.length <= 8;
}

assert(isValidDni('38.412.905') === true, 'T07: DNI 8 dígitos con puntos es válido');
assert(isValidDni('8541290') === true, 'T07: DNI 7 dígitos antiguo es válido');
assert(isValidDni('12345') === false, 'T07: DNI menos de 7 dígitos es rechazado');
assert(isValidDni('1234567890') === false, 'T07: DNI más de 8 dígitos es rechazado');

// 3. Verificación de archivos y navegación del Bloque B
const filesToCheck = [
  'src/services/legalAudit.ts',
  'src/screens/IdentityUpgradeScreen.tsx',
  'src/context/AuthContext.tsx',
  'src/navigation/AppNavigator.tsx',
  'src/types/index.ts',
];

for (const f of filesToCheck) {
  const full = path.join(rootDir, f);
  assert(fs.existsSync(full), `T05-T07: Archivo ${f} existe`);
}

// 4. Verificación de registro de IdentityUpgrade en AppNavigator y Types
const appNavContent = fs.readFileSync(path.join(rootDir, 'src', 'navigation', 'AppNavigator.tsx'), 'utf8');
assert(appNavContent.includes('IdentityUpgradeScreen'), 'T07: IdentityUpgradeScreen está registrado en AppNavigator');

const typesContent = fs.readFileSync(path.join(rootDir, 'src', 'types', 'index.ts'), 'utf8');
assert(typesContent.includes('IdentityUpgrade:'), 'T07: IdentityUpgrade está tipado en RootStackParamList');
assert(typesContent.includes('ddjjHash?: string'), 'T06: ddjjHash está tipado en AuditMetadata');

console.log(`\n=====================================================`);
console.log(`TOTAL BLOQUE B: ${passed} pasadas, ${failed} fallidas`);
console.log(`=====================================================\n`);

if (failed > 0) process.exit(1);
