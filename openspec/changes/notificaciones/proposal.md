# Proposal

## Why

Las notificaciones in-app y el cierre de disputas ya funcionan, pero no hay push real, no existe un centro de notificaciones completo y el usuario no puede elegir que avisos recibir. Sin esto, el denunciante solo se entera de los cambios si abre la app (RF-077 a RF-080).

## What Changes

- Registro de token de push de Expo por usuario (`push_tokens`).
- Cloud Function que, al crear una notificacion, envia el push via Expo respetando las preferencias.
- Centro de notificaciones (P19) con estado leido/no leido y "marcar todas como leidas".
- Preferencias por tipo: cambio de estado, corroboracion y resolucion (P26).
- Nuevos disparadores: denuncia PUBLICADA al crear, EN_DISPUTA al impugnar, RESUELTA al resolver y CORROBORACION cuando otro reporte coincide con el mismo objetivo.
- Campana de acceso al centro en P1.

## Capabilities

### New Capabilities
- `push-notifications`: token de Expo, envio por trigger y respeto de preferencias.
- `notification-center`: centro de notificaciones, lectura y preferencias por tipo.

### Modified Capabilities

(none)

## Impact

- Codigo: `src/services/pushService.ts`, `notificationPreferences.ts`, `notificationService.ts`, `corroborationService.ts`, `functions/src/index.ts`, `src/context/AuthContext.tsx`, `src/screens/P1`, `P19_NotificationCenter`, `P26_NotificationPreferences`, `P20`, `AppNavigator`, `types`, `App.tsx`.
- Datos: `push_tokens`, `notification_prefs`, `notificaciones`.
- Dependencias: `expo-notifications`, `expo-constants`.
- Config: projectId de EAS para obtener el token de push.

## Out of scope

- Integracion directa con FCM (se usa Expo Push).
- Deep links avanzados desde la notificacion.
- Roles U0-U4 formales.
