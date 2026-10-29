# Tasks

## 1. Modelo y servicios

- [x] 1.1 Definir `Relato` y estados en `src/types/index.ts`; verificar `npx tsc --noEmit`
- [x] 1.2 Crear `src/services/storyService.ts` (crear, listar por estado, detalle, mis relatos, corroborar); verificar con `scripts/verify-stories.js`
- [x] 1.3 Crear `storyModerationService.ts` (cola, aprobar/ocultar, auditoria, notificar autor); verificar transiciones
- [x] 1.4 Crear `storyDrafts.ts` (AsyncStorage) e integrarlo en el formulario; verificar guardar/retomar
- [x] 1.5 Implementar vinculacion por identificador (`valorNormalizado`) y busqueda de relatos; verificar con un CUIT/Alias
- [x] 1.6 Crear `storySubscriptions.ts` (seguir/dejar de seguir categorias); verificar persistencia

## 2. Pantallas

- [x] 2.1 Crear `P27_StoriesFeed.tsx` con busqueda, filtros, paginacion y disclaimer; verificar feed y estado vacio
- [x] 2.2 Crear `P28_StoryDetail.tsx` con senales, identificadores, "me paso / lo vi", compartir y reportar abuso; verificar acciones
- [x] 2.3 Crear `P29_CreateStory.tsx` (wizard) con validacion, filtro lexico y aviso de 24hs; verificar que queda EN_REVISION
- [x] 2.4 Crear `P30_MyStories.tsx` con estados y borradores; verificar listado
- [x] 2.5 Crear `P32_StoryModeration.tsx` (admin) con cola, aprobar/ocultar y nota; verificar la cola
- [x] 2.6 Crear `P33_CommunityGuidelines.tsx` y disclaimer en feed/detalle; verificar acceso

## 3. Integracion

- [x] 3.1 Agregar tab "Historias" en `BottomNavBar.tsx`; verificar navegacion
- [x] 3.2 Registrar P27-P30, P32 y P33 en `AppNavigator`/`RootStackParamList`; verificar `npx tsc --noEmit`
- [x] 3.3 Mostrar relatos relacionados en `P13_SearchResults`/`P2`; verificar por identificador
- [x] 3.4 Agregar tipo `RELATO_PUBLICADO` y preferencia `relatos` en notificaciones; verificar envio
- [x] 3.5 Agregar acceso a la cola de relatos desde `P14_AdminDashboard`; verificar navegacion

## 4. Backend y verificacion

- [x] 4.1 Agregar reglas de `relatos`, `story_subscriptions` y `story_reports` en `firestore.rules`; verificar con el emulador
- [x] 4.2 Agregar indices en `firestore.indexes.json` (estado+fecha, categoria+fecha, valorNormalizado); verificar el deploy
- [x] 4.3 Extender `enviarPushNotificacion` para `RELATO_PUBLICADO`; verificar `npm run build` en functions
- [x] 4.4 Crear `scripts/verify-stories.js` y agregarlo a `verify:all`; verificar `npm run verify:all`
- [x] 4.5 Actualizar `README.md` y `docs/setup-servicios.md` con relatos y moderacion; verificar los pasos
- [x] 4.6 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
