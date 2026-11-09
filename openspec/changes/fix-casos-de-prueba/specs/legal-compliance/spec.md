# Spec Delta

## Purpose

Cumple los resguardos legales y de trazabilidad: hash de la declaracion jurada, terminos versionados, privacidad y retencion de datos, derecho al olvido y un log de auditoria consultable.

## ADDED Requirements

### Requirement: Hash DDJJ con IP de servidor
El sistema SHALL generar el hash SHA-256 de la DDJJ con IP y timestamp obtenidos en el servidor y SHALL usar una unica version vigente.

#### Scenario: IP real
- **WHEN** se crea una denuncia
- **THEN** el hash usa la IP del request y no `0.0.0.0`

#### Scenario: Version unificada
- **WHEN** se acepta la DDJJ
- **THEN** `ddjjService` y `termsService` reportan la misma version

### Requirement: Aceptacion de terminos en login
El sistema SHALL registrar la version aceptada al iniciar sesion, no solo al enviar una denuncia.

#### Scenario: P3
- **WHEN** el usuario acepta los terminos
- **THEN** se persiste `terminos_aceptados` con uid, version y fecha

### Requirement: Baja definitiva de datos
El sistema SHALL ejecutar la eliminacion o anonimizacion de datos personales en Auth, Firestore y Storage.

#### Scenario: Derecho al olvido
- **WHEN** el usuario confirma la baja
- **THEN** sus datos personales se eliminan o anonimizan

### Requirement: Auditoria de acciones relevantes
El sistema SHALL mostrar a los administradores un log con uid, email, IP y timestamp reales de creaciones, transiciones, impugnaciones y resoluciones.

#### Scenario: P25
- **WHEN** el administrador abre el log
- **THEN** ve los eventos persistidos con sus campos completos
