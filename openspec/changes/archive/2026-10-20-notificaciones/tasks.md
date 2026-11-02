# Tasks

## 1. Push y tokens

- [x] 1.1 Crear `src/services/pushService.ts` con canal Android, handler y registro de token; verificar que sin projectId no rompe
- [x] 1.2 Integrar el registro de token en `AuthContext.tsx` al iniciar sesion; verificar que guarda el token o lo omite
- [x] 1.3 Configurar el handler de notificaciones en `App.tsx`; verificar que la app arranca sin errores
- [x] 1.4 Agregar `projectId` de EAS en `app.json` (extra.eas) y documentarlo; verificar que el JSON es valido

## 2. Cloud Function de push

- [x] 2.1 Crear `notificationPreferences.ts` con carga/guardado y valores por defecto; verificar con `scripts/verify-notificaciones.js`
- [x] 2.2 Agregar la Function `enviarPushNotificacion` (onDocumentCreated) en `functions/src/index.ts`; verificar `npm run build`
- [x] 2.3 Consultar token y preferencias antes de enviar; verificar que un tipo deshabilitado no envia
- [x] 2.4 Manejar errores de envio con log sin romper el flujo

## 3. Centro y preferencias

- [x] 3.1 Crear `P19_NotificationCenterScreen.tsx` con listado, marcar leida y marcar todas; verificar el estado vacio
- [x] 3.2 Crear `P26_NotificationPreferencesScreen.tsx` con tres switches; verificar que guarda las preferencias
- [x] 3.3 Agregar campana de acceso en `P1_HomeScreen.tsx` y acceso desde `P20_SettingsScreen.tsx`; verificar navegacion
- [x] 3.4 Registrar P19 y P26 en `AppNavigator.tsx` y `RootStackParamList`; verificar que compila

## 4. Disparadores e integracion

- [x] 4.1 Notificar "PUBLICADA" al crear la denuncia en `ReportFlowContext.tsx`; verificar que se crea la notificacion
- [x] 4.2 Crear `corroborationService.ts` y notificar a denunciantes previos; verificar sin duplicados
- [x] 4.3 Agregar tipos `CAMBIO_ESTADO` y `CORROBORACION` a `notificationService.ts`; verificar `npx tsc --noEmit`
- [x] 4.4 Crear `scripts/verify-notificaciones.js` y agregarlo a `verify:all`; verificar `npm run verify:all`
- [x] 4.5 Actualizar `docs/setup-servicios.md` con push/Expo y desplegar la function; verificar los pasos
- [x] 4.6 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
