# Proposal

## Why

La app permite buscar y denunciar, pero no hay un lugar donde la comunidad pueda contar **nuevas formas de estafar** ni aprender de las que ya existen, incluso si no fue victima. Sin esto se pierde el valor preventivo y colaborativo del producto.

## What Changes

- Nueva seccion **Historias de estafas** con feed, detalle, creacion y "mis relatos".
- Relato con: titulo, categoria, modus operandi, **senales de alerta (checklist)**, identificadores vinculados, links, "fui victima / lo vi", fuente y tags.
- **Moderacion previa**: los relatos nuevos quedan en `EN_REVISION` y se avisa que pueden tardar hasta 24hs en publicarse.
- Los relatos se **vinculan a identificadores** (Alias/CBU/CUIT/Tel/Local) y aparecen en la busqueda.
- Contador **"me paso / lo vi"**, compartir por WhatsApp y reportar abuso.
- Disclaimer legal + normas de la comunidad.
- Borradores offline de relatos.
- Notificacion push cuando se publica un relato de una categoria que el usuario sigue.
- Quinta tab **Historias** en la barra inferior y cola de moderacion para admin.

## Capabilities

### New Capabilities
- `scam-stories`: feed, detalle, creacion, mis relatos, senales, vinculacion, compartir y disclaimer.
- `story-moderation`: cola de moderacion, aprobar/ocultar y auditoria.

### Modified Capabilities
- `search-discovery`: relatos relacionados al buscar un identificador.
- `push-notifications`: preferencia de relatos y aviso al publicarse.
- `platform-config`: reglas e indices de relatos, suscripciones y reportes de contenido.

## Impact

- Codigo: `src/services/storyService.ts`, `storyModerationService.ts`, `storyDrafts.ts`, `src/screens/P27-P30`, `P32_StoryModeration`, `P33_CommunityGuidelines`, `BottomNavBar`, `AppNavigator`, `types`, `notificationService`, `notificationPreferences`, `functions/src/index.ts`.
- Datos: `relatos`, `story_subscriptions`, `story_reports`.
- Config: indices nuevos y reglas por estado del relato.
- Sin dependencias nuevas (compartir con `Share`/`Linking`).

## Out of scope

- Rediseno del inicio y responsive base -> cambio `home-and-responsive`.
- CUIT y direccion manual -> cambio `report-capture`.
