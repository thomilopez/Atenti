# Spec Delta

## Purpose

Administra la revision de relatos antes de publicarlos, permitiendo aprobarlos, ocultarlos y dejar registro de la moderacion.

## ADDED Requirements

### Requirement: Estado de revision
El sistema SHALL iniciar todo relato nuevo en estado EN_REVISION y no mostrarlo en el feed publico hasta aprobarlo.

#### Scenario: Relato nuevo
- **WHEN** se crea un relato
- **THEN** queda EN_REVISION y no aparece en P27

### Requirement: Cola de moderacion
El sistema SHALL mostrar al administrador una cola de relatos pendientes.

#### Scenario: Ver cola
- **WHEN** el administrador abre P32_StoryModeration
- **THEN** ve los relatos EN_REVISION con su contenido

### Requirement: Aprobar u ocultar
El sistema SHALL permitir aprobar (PUBLICADA) u ocultar (OCULTA) un relato con una nota.

#### Scenario: Aprobar
- **WHEN** el administrador aprueba un relato
- **THEN** pasa a PUBLICADA y se notifica al autor

#### Scenario: Ocultar
- **WHEN** el administrador oculta un relato
- **THEN** pasa a OCULTA y no aparece en el feed

### Requirement: Auditoria de moderacion
El sistema SHALL registrar quien modero, cuando y con que nota.

#### Scenario: Registro
- **WHEN** se modera un relato
- **THEN** se guarda actor, fecha y nota
