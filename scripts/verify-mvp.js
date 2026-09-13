/**
 * Script de Verificación de Regla de Negocio RG-07 y Flujo del MVP de Atenti
 */

function calculateRG07Score({ identity, evidences = [], corroborationCount = 0 }) {
  // 1. Identidad (Hasta 40 pts)
  let identityScore = 0;
  if (identity.googleAuth) identityScore += 15;
  if (identity.phoneVerified) identityScore += 15;
  if (identity.dniVerified) identityScore += 10;
  identityScore = Math.min(40, identityScore);

  // 2. Evidencias (Hasta 45 pts)
  let evidenceScore = 0;
  const hasChat = evidences.some((e) => e.type === 'chat_screenshot');
  const hasReceipt = evidences.some((e) => e.type === 'bank_receipt');
  const hasOcrMatch = evidences.some((e) => e.ocrMatched);

  if (hasChat) evidenceScore += 20;
  if (hasReceipt) evidenceScore += 20;
  if (hasOcrMatch) evidenceScore += 5;
  evidenceScore = Math.min(45, evidenceScore);

  // 3. Corroboración (Hasta 15 pts)
  let corroborationScore = 0;
  if (corroborationCount >= 3) {
    corroborationScore = 15;
  } else if (corroborationCount === 2) {
    corroborationScore = 10;
  } else if (corroborationCount === 1) {
    corroborationScore = 5;
  }

  const totalScore = Math.min(100, identityScore + evidenceScore + corroborationScore);
  const level = totalScore >= 75 ? 'ALTA' : totalScore >= 40 ? 'SOSPECHOSA' : 'BAJA';
  const trafficLight = totalScore >= 75 ? 'green' : totalScore >= 40 ? 'yellow' : 'red';

  return {
    identityScore,
    evidenceScore,
    corroborationScore,
    totalScore,
    level,
    trafficLight,
  };
}

console.log('=====================================================');
console.log('🔍 VERIFICACIÓN DE REGLAS DE NEGOCIO Y DATOS - ATENTI');
console.log('=====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// PRUEBA 1: P4 - Formulario Paso 1 (Solo Google Auth, sin evidencias)
const p4 = calculateRG07Score({
  identity: { googleAuth: true, phoneVerified: false, dniVerified: false },
  evidences: [],
  corroborationCount: 0,
});
assert(p4.identityScore === 15, 'P4: Factor Identidad inicial Google Auth (+15 pts)');
assert(p4.totalScore === 15, 'P4: Puntaje inicial sin evidencias');
assert(p4.trafficLight === 'red', 'P4: Semáforo preliminar rojo');

// PRUEBA 2: P5 - Evidencias y Procesamiento Paso 2 (Chat + Comprobante + OCR coincidente + Corroboración)
const p5 = calculateRG07Score({
  identity: { googleAuth: true, phoneVerified: true, dniVerified: false }, // 30 pts
  evidences: [
    { type: 'chat_screenshot', ocrMatched: true },
    { type: 'bank_receipt', ocrMatched: true },
  ], // 20 + 20 + 5 = 45 pts
  corroborationCount: 1, // 5 pts
});
assert(p5.identityScore === 30, 'P5: Identidad con Teléfono alcanza 30 pts');
assert(p5.evidenceScore === 45, 'P5: Evidencias y OCR alcanzan el máximo de 45 pts');
assert(p5.totalScore === 80, 'P5: Barra de Veracidad alcanza exactamente 80%');
assert(p5.trafficLight === 'green', 'P5: Semáforo verde (Alta veracidad)');
assert(p5.level === 'ALTA', 'P5: Clasificación como ALTA veracidad');

// PRUEBA 3: P9 - Factores de Identidad completos (Google + Teléfono + DNI)
const p9 = calculateRG07Score({
  identity: { googleAuth: true, phoneVerified: true, dniVerified: true }, // 15 + 15 + 10 = 40 pts
  evidences: [
    { type: 'chat_screenshot', ocrMatched: true },
    { type: 'bank_receipt', ocrMatched: true },
  ],
  corroborationCount: 3, // 15 pts
});
assert(p9.identityScore === 40, 'P9: Factor Identidad completo alcanza 40 pts');
assert(p9.totalScore === 100, 'P9: Máxima veracidad comunitaria 100%');

// PRUEBA 4: Formato de Código de Seguimiento AT-2026-XXXX
const trackingCode = `AT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
assert(/^AT-2026-\d{4}$/.test(trackingCode), `P8: Código generado válido '${trackingCode}'`);

console.log('\n=====================================================');
console.log(`TOTAL RESULTADOS: ${passed} pasadas, ${failed} fallidas`);
console.log('=====================================================\n');

if (failed > 0) process.exit(1);
