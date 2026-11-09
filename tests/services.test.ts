import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRG07Score, nivelCredibilidad4 } from '../src/services/credibility';
import {
  normalizeIdentifier,
  validarAlias,
  validarTelefonoE164,
} from '../src/services/normalize';
import {
  IllegalStateTransitionError,
  assertTransition,
  canTransition,
} from '../src/services/stateMachine';
import { maskIdentifier, toPublicProjection } from '../src/services/masking';
import { MAX_EVIDENCIAS, MAX_BYTES, validarArchivo } from '../src/services/evidenceService';
import {
  formatTrackingCode,
  isValidTrackingCode,
  normalizeTrackingCode,
} from '../src/services/trackingCode';
import { puedeEditar } from '../src/services/editWindow';
import type { EvidenceItem, IncidentReport } from '../src/types';

const evidencia = (type: EvidenceItem['type']): EvidenceItem => ({
  id: `ev_${type}`,
  type,
  label: type,
  uri: 'https://example.com/evidencia.jpg',
  timestamp: Date.now(),
});

test('RG-07 suma identidad, evidencias y corroboracion', () => {
  const breakdown = calculateRG07Score({
    identity: { googleAuth: true, phoneVerified: true, dniVerified: true },
    evidences: [
      evidencia('chat_screenshot'),
      { ...evidencia('bank_receipt'), ocrMatched: true },
    ],
    corroborationCount: 3,
  });
  assert.equal(breakdown.identityScore, 40);
  assert.equal(breakdown.evidenceScore, 45);
  assert.equal(breakdown.corroborationScore, 15);
  assert.equal(breakdown.totalScore, 100);
});

test('el semaforo de 4 colores respeta los umbrales', () => {
  assert.equal(nivelCredibilidad4(0), 'GRIS');
  assert.equal(nivelCredibilidad4(19), 'GRIS');
  assert.equal(nivelCredibilidad4(20), 'ROJO');
  assert.equal(nivelCredibilidad4(39), 'ROJO');
  assert.equal(nivelCredibilidad4(40), 'NARANJA');
  assert.equal(nivelCredibilidad4(74), 'NARANJA');
  assert.equal(nivelCredibilidad4(75), 'AMARILLO');
});

test('el telefono argentino se normaliza a E.164 movil', () => {
  assert.equal(normalizeIdentifier('Tel', '011 15-3849-2018'), '+5491138492018');
  assert.equal(normalizeIdentifier('Tel', '+54 9 11 3849 2018'), '+5491138492018');
  assert.equal(validarTelefonoE164('011 15-3849-2018'), true);
  assert.equal(validarTelefonoE164('123'), false);
});

test('el alias exige al menos una letra', () => {
  assert.equal(validarAlias('ju.mp'), true);
  assert.equal(validarAlias('123456'), false);
  assert.equal(validarAlias('ab'), false);
});

test('la maquina de estados bloquea saltos', () => {
  assert.equal(canTransition('PUBLICADA', 'RESUELTA'), false);
  assert.equal(canTransition('EN_DISPUTA', 'PUBLICADA'), true);
  assert.throws(
    () => assertTransition('PUBLICADA', 'RESUELTA'),
    IllegalStateTransitionError
  );
});

test('el enmascaramiento no expone el valor completo', () => {
  const enmascarado = maskIdentifier('CBU', '1234567890123456789012');
  assert.ok(enmascarado.endsWith('9012'));
  assert.ok(!enmascarado.includes('123456789012345678'));

  const reporte = {
    id: 'den_1',
    trackingCode: 'AT-2026-000001',
    identifierType: 'CBU',
    identifierValue: '1234567890123456789012',
    title: 'CBU',
    category: 'Estafa Bancaria',
    story: 'Relato de prueba',
    location: { latitude: -34.6, longitude: -58.4, address: 'Calle 1' },
    evidences: [],
    credibilityScore: 50,
    credibilityBreakdown: {
      identityScore: 15,
      evidenceScore: 20,
      corroborationScore: 15,
      totalScore: 50,
      level: 'SOSPECHOSA',
      trafficLight: 'yellow',
    },
    corroborationCount: 1,
    audit: {
      uid: 'uid-secreto',
      userEmail: 'persona@example.com',
      clientIp: '1.2.3.4',
      platform: 'web',
      createdAt: new Date().toISOString(),
    },
    status: 'publicada',
  } as IncidentReport;

  const proyeccion = JSON.stringify(toPublicProjection(reporte));
  assert.ok(!proyeccion.includes('uid-secreto'));
  assert.ok(!proyeccion.includes('persona@example.com'));
  assert.ok(!proyeccion.includes('1.2.3.4'));
});

test('las evidencias respetan cantidad, tamano y formato', () => {
  assert.equal(validarArchivo({ uri: 'foto.jpg', name: 'foto.jpg', mimeType: 'image/jpeg', size: 1000 }, 0).ok, true);
  assert.equal(validarArchivo({ uri: 'virus.exe', name: 'virus.exe', mimeType: 'application/x-msdownload', size: 1000 }, 0).ok, false);
  assert.equal(validarArchivo({ uri: 'foto.jpg', name: 'foto.jpg', mimeType: 'image/jpeg', size: MAX_BYTES + 1 }, 0).ok, false);
  assert.equal(validarArchivo({ uri: 'foto.jpg', name: 'foto.jpg', mimeType: 'image/jpeg', size: 1000 }, MAX_EVIDENCIAS).ok, false);
});

test('el codigo de seguimiento es de 6 digitos y acepta historicos', () => {
  assert.equal(formatTrackingCode(123456), 'AT-2026-123456');
  assert.equal(normalizeTrackingCode('at 2026 123456'), 'AT-2026-123456');
  assert.equal(isValidTrackingCode('AT-2026-123456'), true);
  assert.equal(isValidTrackingCode('AT-2026-1234'), true);
  assert.equal(isValidTrackingCode('AT-2026-12'), false);
});

test('la ventana de edicion dura 24 horas', () => {
  const ahora = Date.now();
  assert.equal(puedeEditar(new Date(ahora - 60 * 60 * 1000).toISOString(), ahora), true);
  assert.equal(puedeEditar(new Date(ahora - 25 * 60 * 60 * 1000).toISOString(), ahora), false);
});
