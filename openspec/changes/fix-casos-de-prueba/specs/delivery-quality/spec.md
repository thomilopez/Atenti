# Spec Delta

## Purpose

Prepara el proyecto para operar en produccion: perfiles de build, integracion continua, pruebas E2E, monitoreo de errores, analytics con consentimiento, cache de busqueda y accesibilidad de los controles clave.

## ADDED Requirements

### Requirement: CI con tests reales y Maestro
El repositorio SHALL ejecutar typecheck, tests de servicios reales y el flujo E2E critico en cada push o pull request.

#### Scenario: Pull request
- **WHEN** se abre un pull request
- **THEN** CI corre `tsc`, tests y Maestro, y falla si alguno no pasa

### Requirement: Monitoreo de errores real
El sistema SHALL capturar errores no controlados, incluidos los de Firestore antes silenciados, y SHALL enviarlos al servicio configurado.

#### Scenario: Error de escritura
- **WHEN** una operacion de Firestore falla
- **THEN** se reporta al servicio y se muestra al usuario

### Requirement: Analytics con eventos
El sistema SHALL emitir eventos de busqueda, envio, offline y OCR solo con consentimiento.

#### Scenario: Consentimiento
- **WHEN** el usuario acepta analytics y busca
- **THEN** se registra el evento sin datos personales

### Requirement: Accesibilidad en indicadores
Los controles principales SHALL tener etiquetas, roles y valores accesibles; los indicadores de credibilidad SHALL exponer su valor como `progressbar`.

#### Scenario: Lector de pantalla
- **WHEN** el usuario navega con VoiceOver o TalkBack
- **THEN** pines, barras y semaforos anuncian su estado

### Requirement: Tests de servicios reales
El sistema SHALL probar los modulos TypeScript reales de credibilidad, validacion, estados, enmascaramiento, evidencias y claves de operacion, en lugar de replicar su logica en scripts aislados.

#### Scenario: Divergencia
- **WHEN** cambia una regla de negocio
- **THEN** el test falla si la implementacion no coincide con la especificacion
