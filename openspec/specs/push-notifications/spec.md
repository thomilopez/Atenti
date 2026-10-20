# push-notifications Specification

## Purpose
Envia notificaciones push al dispositivo cuando ocurren eventos relevantes, usando tokens de Expo y respetando las preferencias del usuario.

## Requirements

### Requirement: Registrar token de push
El sistema SHALL registrar el token de push del dispositivo asociado al usuario.

#### Scenario: Token registrado
- **WHEN** el usuario inicia sesion y acepta las notificaciones
- **THEN** el token queda guardado y asociado a su uid

#### Scenario: Permiso denegado
- **WHEN** el usuario niega el permiso de notificaciones
- **THEN** la app sigue funcionando sin push y no registra token

### Requirement: Push al cambiar el estado
El sistema SHALL enviar un push cuando la denuncia del usuario pasa a PUBLICADA, EN_DISPUTA o RESUELTA.

#### Scenario: Cambio de estado
- **WHEN** una denuncia cambia de estado
- **THEN** el denunciante recibe una notificacion push con el nuevo estado

### Requirement: Push por corroboracion
El sistema SHALL avisar al denunciante cuando otro reporte corrobora el mismo objetivo.

#### Scenario: Corroboracion
- **WHEN** se registra una denuncia sobre un objetivo ya reportado
- **THEN** los denunciantes previos reciben un aviso de corroboracion

### Requirement: Respetar preferencias
El sistema SHALL no enviar push de un tipo deshabilitado por el usuario.

#### Scenario: Tipo deshabilitado
- **WHEN** el usuario desactivo las notificaciones de corroboracion
- **THEN** no recibe push de ese tipo, aunque la notificacion in-app se registre

### Requirement: Envio con fallback
El sistema SHALL registrar localmente el error si el envio push falla, sin romper el flujo.

#### Scenario: Falla de envio
- **WHEN** el servicio de push no responde
- **THEN** el evento se conserva como notificacion in-app
