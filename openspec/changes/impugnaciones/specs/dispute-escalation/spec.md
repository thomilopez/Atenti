# Spec Delta

## Purpose

Gestiona el plazo de 72 horas de una impugnacion: muestra la cuenta regresiva al denunciante, permite responder, escala automaticamente a moderacion al vencer y cierra la impugnacion cuando el administrador resuelve la disputa.

## ADDED Requirements

### Requirement: Plazo de 72 horas
El sistema SHALL fijar un plazo de 72 horas desde la presentacion de la impugnacion.

#### Scenario: Cuenta regresiva
- **WHEN** el denunciante abre P22_DisputeStatus
- **THEN** ve el tiempo restante del plazo en horas y minutos

### Requirement: Respuesta del denunciante
El sistema SHALL permitir al denunciante responder dentro del plazo.

#### Scenario: Responder
- **WHEN** el denunciante carga una respuesta antes del vencimiento
- **THEN** la impugnacion queda marcada como respondida

### Requirement: Escalacion automatica
El sistema SHALL escalar a moderacion las impugnaciones vencidas sin resolucion.

#### Scenario: Vencimiento
- **WHEN** el plazo vence y la impugnacion sigue pendiente
- **THEN** se marca como escalada y se notifica a moderacion

#### Scenario: Escalacion idempotente
- **WHEN** la escalacion corre mas de una vez
- **THEN** no duplica el estado de escalada

### Requirement: Cierre al resolver la disputa
El sistema SHALL cerrar la impugnacion cuando el administrador resuelve la disputa y notificar al denunciante.

#### Scenario: Disputa resuelta
- **WHEN** el administrador mantiene o retira la denuncia en P15
- **THEN** la impugnacion pasa a RESUELTA y el denunciante recibe una notificacion
