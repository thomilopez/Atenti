# notification-center Specification

## Purpose
Ofrece un centro de notificaciones con historial, estado de lectura y preferencias por tipo, para que el usuario gestione sus avisos.

## Requirements

### Requirement: Centro de notificaciones
El sistema SHALL mostrar el historial de notificaciones del usuario.

#### Scenario: Listado
- **WHEN** el usuario abre P19_NotificationCenter
- **THEN** ve sus notificaciones ordenadas por fecha

#### Scenario: Sin notificaciones
- **WHEN** no hay notificaciones
- **THEN** se muestra un estado vacio

### Requirement: Marcar como leida
El sistema SHALL permitir marcar una notificacion como leida.

#### Scenario: Leer una
- **WHEN** el usuario toca una notificacion
- **THEN** queda marcada como leida

#### Scenario: Leer todas
- **WHEN** el usuario toca "Marcar todas como leidas"
- **THEN** todas sus notificaciones quedan leidas

### Requirement: Preferencias por tipo
El sistema SHALL permitir activar o desactivar los avisos por tipo.

#### Scenario: Cambiar preferencia
- **WHEN** el usuario desactiva un tipo en P26_NotificationPreferences
- **THEN** la preferencia se guarda y se aplica al envio de push

#### Scenario: Valores por defecto
- **WHEN** el usuario nunca configuro preferencias
- **THEN** todos los tipos quedan habilitados

### Requirement: Acceso al centro
El sistema SHALL ofrecer acceso al centro desde el inicio y desde ajustes.

#### Scenario: Campana
- **WHEN** el usuario toca la campana en P1_HomeScreen
- **THEN** se abre el centro de notificaciones
