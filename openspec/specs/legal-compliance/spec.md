# legal-compliance Specification

## Purpose
Cumple los resguardos legales y de trazabilidad: hash de la declaracion jurada, terminos versionados, privacidad y retencion de datos, derecho al olvido y un log de auditoria consultable.

## Requirements

### Requirement: Hash de la declaracion jurada
El sistema SHALL generar un hash SHA-256 de la DDJJ con IP y timestamp y SHALL guardarlo con la denuncia.

#### Scenario: Denuncia con hash
- **WHEN** se registra una denuncia
- **THEN** la denuncia guarda el hash de la DDJJ junto a los metadatos de auditoria

#### Scenario: Hash visible
- **WHEN** el administrador abre la auditoria de la denuncia
- **THEN** ve el hash de la DDJJ y su timestamp

### Requirement: Terminos y condiciones versionados
El sistema SHALL mantener versiones de los terminos y registrar la version aceptada.

#### Scenario: Version vigente
- **WHEN** el usuario abre la pantalla legal
- **THEN** ve la version vigente de los terminos y la fecha de aprobacion

#### Scenario: Aceptacion registrada
- **WHEN** el usuario acepta los terminos
- **THEN** se registra la version aceptada

### Requirement: Politica de privacidad y retencion
El sistema SHALL mostrar la politica de privacidad conforme a la Ley 25.326 y el plazo de retencion de datos.

#### Scenario: Privacidad visible
- **WHEN** el usuario abre la seccion de privacidad
- **THEN** ve el enlace y el resumen de la Ley 25.326

#### Scenario: Retencion informada
- **WHEN** el usuario consulta la retencion
- **THEN** ve el plazo legal configurado

### Requirement: Derecho al olvido
El sistema SHALL permitir solicitar la eliminacion definitiva de los datos personales.

#### Scenario: Solicitud formal
- **WHEN** el usuario completa el formulario de derecho al olvido
- **THEN** se registra la solicitud de baja con su motivo

#### Scenario: Solicitud incompleta
- **WHEN** el usuario no ingresa el motivo
- **THEN** el sistema bloquea el envio

### Requirement: Log de auditoria
El sistema SHALL mostrar a los administradores un log con uid, email, IP y timestamp de las acciones relevantes.

#### Scenario: Consultar log
- **WHEN** el administrador abre el log de auditoria
- **THEN** ve los eventos ordenados por fecha

#### Scenario: Sin eventos
- **WHEN** no hay eventos registrados
- **THEN** se muestra un estado vacio
