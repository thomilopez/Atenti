# Tasks

## 1. Presentacion de impugnaciones

- [x] 1.1 Crear `src/services/notificationService.ts` con crear/listar/marcar leida y fallback en memoria; verificar con `scripts/verify-impugnaciones.js`
- [x] 1.2 Crear `src/services/impugnationService.ts` con validacion, take-down y creacion de impugnacion; verificar que la denuncia pasa a EN_DISPUTA
- [x] 1.3 Crear `P21_ImpugnacionScreen.tsx` con CUIT/DNI y descargo; verificar que bloquea datos invalidos
- [x] 1.4 Agregar el boton "Impugnar esta denuncia" en `P2_ReportDetailScreen.tsx`; verificar la navegacion a P21
- [x] 1.5 Notificar al denunciante original al registrar la impugnacion; verificar que se crea la notificacion

## 2. Plazo y escalacion

- [x] 2.1 Calcular el `deadline` de 72hs y el tiempo restante en `impugnationService.ts`; verificar con `scripts/verify-impugnaciones.js`
- [x] 2.2 Crear `P22_DisputeStatusScreen.tsx` con countdown y respuesta del denunciante; verificar que muestra el tiempo restante
- [x] 2.3 Navegar a P22 desde P10 cuando la denuncia esta EN_DISPUTA; verificar el acceso del denunciante
- [x] 2.4 Implementar `escalarImpugnacionesVencidas()` idempotente; verificar que no duplica la escalada
- [x] 2.5 Agregar la Cloud Function programada `escalarImpugnaciones` en `functions/src/index.ts`; verificar `npm run build` en functions

## 3. Cierre e integracion

- [x] 3.1 Cerrar la impugnacion y notificar al resolver la disputa en `adminService.ts`; verificar que pasa a RESUELTA
- [x] 3.2 Mostrar notificaciones in-app en `P20_SettingsScreen.tsx`; verificar que el denunciante ve el aviso
- [x] 3.3 Registrar P21 y P22 en `AppNavigator.tsx` y `RootStackParamList`; verificar navegacion
- [x] 3.4 Crear `scripts/verify-impugnaciones.js` y agregarlo a `verify:all`; verificar `npm run verify:all`
- [x] 3.5 Actualizar `docs/setup-servicios.md` con la function programada; verificar que los pasos se siguen en orden
- [x] 3.6 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
