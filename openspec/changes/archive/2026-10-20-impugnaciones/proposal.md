# Proposal

## Why

Hoy una persona o comercio reportado no tiene forma de defenderse: no existe un flujo de impugnacion, la denuncia queda publica sin take-down y el denunciante no recibe aviso. Esto expone a terceros a reportes falsos y deja el sistema sin el contrapeso legal que exige el PRD (RF-073 a RF-076).

## What Changes

- Formulario de impugnacion (CUIT/DNI + descargo) accesible desde P2 y pensado para comercios (U3).
- Take-down inmediato: al presentar la impugnacion la denuncia pasa a EN_DISPUTA y desaparece del buscador publico.
- Notificacion in-app al denunciante original con el codigo de la denuncia impugnada.
- Plazo de 72hs con cuenta regresiva; escalacion automatica a moderacion si vence sin respuesta.
- Pantalla de estado de disputa para el denunciante (countdown + respuesta).
- Cloud Function programada que escala impugnaciones vencidas.
- Al resolver la disputa desde el panel admin (P15), se cierra la impugnacion y se notifica al denunciante.

## Capabilities

### New Capabilities
- `dispute-filing`: formulario, validacion, take-down automatico y notificacion al denunciante.
- `dispute-escalation`: plazo de 72hs, respuesta, escalacion automatica y cierre al resolver.

### Modified Capabilities

(none)

## Impact

- Codigo: `src/services/impugnationService.ts`, `notificationService.ts`, `adminService.ts`, `functions/src/index.ts`, `src/screens/P2`, `P10`, `P20`, `P21_Impugnacion`, `P22_DisputeStatus`, `AppNavigator`, `types`.
- Datos: colecciones `impugnaciones` y `notificaciones`.
- Config: sin claves nuevas; usa las Cloud Functions ya configuradas.

## Out of scope

- Push notifications y centro completo (RF-077 a RF-080) -> cambio `notificaciones`.
- Roles U0-U4 formales -> pendiente.
- La resolucion de fondo por moderacion ya existe en P15; este cambio la conecta con la impugnacion.
