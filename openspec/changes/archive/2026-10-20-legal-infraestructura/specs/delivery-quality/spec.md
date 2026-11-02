# Spec Delta

## Purpose

Prepara el proyecto para operar en produccion: perfiles de build, integracion continua, pruebas E2E, monitoreo de errores, analytics con consentimiento, cache de busqueda y accesibilidad de los controles clave.

## ADDED Requirements

### Requirement: Perfiles de build
El sistema SHALL definir perfiles de desarrollo, staging y produccion para EAS.

#### Scenario: Build por entorno
- **WHEN** se ejecuta un build con un perfil
- **THEN** usa las variables y el canal correspondientes al entorno

### Requirement: Integracion continua
El repositorio SHALL ejecutar typecheck y verificaciones en cada push o pull request.

#### Scenario: CI exitoso
- **WHEN** se hace push de codigo valido
- **THEN** el workflow corre typecheck y `verify:all` y termina en verde

#### Scenario: CI fallido
- **WHEN** el codigo rompe tipos o pruebas
- **THEN** el workflow falla y bloquea el merge

### Requirement: Pruebas E2E
El sistema SHALL contar con un flujo E2E del recorrido critico.

#### Scenario: Flujo critico
- **WHEN** se ejecuta el flujo de Maestro
- **THEN** recorre inicio, busqueda, detalle y creacion de denuncia

### Requirement: Monitoreo de errores
El sistema SHALL capturar errores no controlados y enviarlos al servicio configurado.

#### Scenario: Error capturado
- **WHEN** ocurre un error no controlado
- **THEN** se registra en el servicio de observabilidad si esta configurado

#### Scenario: Sin servicio
- **WHEN** no hay DSN configurado
- **THEN** el error se registra localmente sin romper la app

### Requirement: Analytics con consentimiento
El sistema SHALL registrar eventos de uso solo si el usuario dio su consentimiento.

#### Scenario: Con consentimiento
- **WHEN** el usuario acepta la telemetria
- **THEN** los eventos de pantalla se registran de forma anonima

#### Scenario: Sin consentimiento
- **WHEN** el usuario rechaza la telemetria
- **THEN** no se registran eventos

### Requirement: Cache de busqueda
El sistema SHALL cachear resultados de busqueda para responder en menos de 2 segundos.

#### Scenario: Segunda busqueda
- **WHEN** se repite una busqueda dentro del TTL
- **THEN** se responde desde cache sin volver a consultar

### Requirement: Accesibilidad
Los controles principales SHALL tener etiquetas y roles accesibles.

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre la barra inferior y los botones
- **THEN** anuncia una etiqueta descriptiva para cada control
