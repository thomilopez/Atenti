# Spec Delta

## ADDED Requirements

### Requirement: Preferencia de relatos
El sistema SHALL permitir activar o desactivar las notificaciones de relatos.

#### Scenario: Desactivar
- **WHEN** el usuario desactiva "Relatos" en preferencias
- **THEN** no recibe push de relatos publicados

### Requirement: Push de relato publicado
El sistema SHALL notificar cuando se publica un relato de una categoria que el usuario sigue.

#### Scenario: Relato publicado
- **WHEN** el administrador publica un relato de una categoria seguida
- **THEN** los seguidores reciben una notificacion
