# Tasks

## 1. Red de seguridad y CI

- [x] 1.1 Configurar Vitest (o `node:test` + `tsx`) y el script `test`; verificar que `npm test` ejecuta al menos un test.
- [x] 1.2 Agregar tests de `credibility.ts`, `normalize.ts`, `stateMachine.ts`, `operationKey.ts`, `masking.ts` y `evidenceService.ts`; verificar que pasan con `npm test`.
- [ ] 1.3 Actualizar `.github/workflows/ci.yml` para correr typecheck, tests y Maestro; verificar el YAML con `npm run typecheck`.

## 2. Integridad de denuncias

- [x] 2.1 Definir errores tipados (`ValidationError`, `FirestoreWriteError`, `OfflineError`) y propagarlos en `src/services/firebase.ts`; verificar con tests de error.
- [x] 2.2 Corregir `getIncidents` para traer todos los estados necesarios según `incluirEnDisputa`, sin pisar `inMemoryIncidents` con resultados parciales; verificar con test de estados.
- [x] 2.3 Reescribir `registrarDenuncia` con transacción atómica sobre `denuncias_by_clave`, contador de seguimiento y código de 6 dígitos; verificar doble envío concurrente.
- [x] 2.4 Eliminar o alinear `saveIncidentReportAtomic` a la colección `denuncias`; verificar que no queden escrituras a `incidents` con `rg`.
- [x] 2.5 Corregir `actualizarEstadoDenuncia` para leer Firestore si no está en memoria, registrar historial/auditoría e invalidar caché; verificar con test de transición.
- [x] 2.6 Convertir `getHistorial`, `obtenerDenuncia` y `consultarAntecedentePublico` a async con lectura Firestore y actualizar P2/P11/P18; verificar typecheck y consulta tras reinicio.
- [x] 2.7 Validar ownership y ventana de 24hs en `actualizarDenuncia` y `softDeleteService`; verificar con tests de actor incorrecto y fuera de plazo.
- [x] 2.8 Ajustar `P10_MisDenunciasScreen` para filtrar por dueño, incluir todos los estados y refrescar al foco; verificar manualmente con datos de dos usuarios.
- [x] 2.9 Corregir `P8_ConfirmationScreen` y `P2_ReportDetailScreen` para usar `score ?? 0` y mensaje según estado real; verificar con score 0 y RECIBIDA.

## 3. Sesión, identidad y cuenta

- [x] 3.1 Agregar `onAuthStateChanged` en `src/context/AuthContext.tsx` y derivar `googleAuth` desde `providerData`; verificar que la sesión sobrevive al reinicio.
- [x] 3.2 Persistir `usuarios/{uid}` con factores de identidad y leer roles desde custom claims; verificar con un usuario de prueba.
- [x] 3.3 Agregar callables `eliminarCuenta` y `setRolUsuario` en `functions/src/index.ts`; verificar `npm run build` en `functions/`.
- [x] 3.4 Conectar `P20_SettingsScreen` y `P24_RightToBeForgottenScreen` al borrado real y limpiar la sesión; verificar que Auth/Firestore/Storage quedan sin datos.
- [x] 3.5 Registrar aceptación de TyC/DDJJ en `P3_LegalAuthScreen` y unificar `VERSION_TERMINOS_ACTUAL` entre `ddjjService` y `termsService`; verificar el documento `terminos_aceptados`.
- [x] 3.6 Reemplazar datos fijos de `P9_CredibilityPanelScreen` por factores y score reales; verificar que coincide con `calculateRG07Score`.

## 4. Formulario, offline y validaciones

- [x] 4.1 En `ReportFlowContext`, limpiar borrador/clave tras éxito, regenerar clave al iniciar un flujo y usar identidad real; verificar dos envíos consecutivos.
- [x] 4.2 Agregar reintento por temporizador/AppState y estado `fallido` visible en `syncQueue`; verificar con red intermitente.
- [x] 4.3 Mapear errores reales en `P5_OCRValidationScreen` y mostrar banner borrador vs enviado; verificar error de permisos y error de red.
- [x] 4.4 Implementar validación de Alias y normalización E.164 en `normalize.ts`; verificar con tests `011 15-...` y alias solo numérico.
- [x] 4.5 Aplicar validaciones de Alias/teléfono/CBU/Local en `P4_CreateReportScreen`; verificar que no se puede avanzar con datos inválidos.
- [x] 4.6 Revalidar relato, dirección y ventana de 24hs en `P12_EditReportScreen`; verificar que no guarda datos inválidos.

## 5. Credibilidad y UI

- [x] 5.1 Unificar `credibility.ts`, `TrafficLightIndicator`, `VeracityBar` y `ScoreBreakdown` en el semáforo de 4 colores; verificar con tests de umbrales.
- [x] 5.2 Corregir `P2_ReportDetailScreen` para usar el semáforo real, score real y desglose persistido; verificar con score 0 y 80.
- [x] 5.3 Mostrar semáforo y score en `P13_SearchResultsScreen`; verificar que los filtros usan los mismos umbrales.
- [x] 5.4 Quitar el total simulado de `P9_CredibilityPanelScreen` y mostrar el desglose real; verificar con identidad parcial.
- [x] 5.5 Registrar historial de score al agregar evidencia/OCR y persistirlo con `serverTimestamp`; verificar `historialScore` tras reiniciar.

## 6. Evidencias y OCR

- [x] 6.1 Agregar cámara/galería en `P5_OCRValidationScreen` y plugins de permisos en `app.json`; verificar en Android e iOS.
- [x] 6.2 Agregar `simulated` y `matched:false` al mock de `ocrService`; verificar que una evidencia simulada no suma puntos.
- [ ] 6.3 Corregir `storageService` para subir con filesystem, validar 5/10MB/MIME y quitar EXIF; verificar archivo real en Storage.
- [x] 6.4 Implementar enmascaramiento público irreversible y modal de evidencia en `P2_ReportDetailScreen`; verificar que la URI original no se muestra.
- [x] 6.5 Validar límites de evidencia y autenticación del OCR en `functions/src/index.ts`; verificar `npm run build`.

## 7. Mapas

- [x] 7.1 Agregar helper Haversine `distanciaKm` en `locationService.ts`; verificar con tests de distancia.
- [x] 7.2 Filtrar incidentes por radio en `P31_FullMapScreen` antes de renderizar; verificar que un pin lejano desaparece.
- [x] 7.3 Implementar tap/drag del pin, heatmap con datos reales y clusters expansibles en `MapViewWrapper`; verificar nativo y web.
- [x] 7.4 Agregar estado `touched` en `MapPickerModal` y no confirmar un pin precargado en P4; verificar Local Físico.
- [x] 7.5 Quitar la API key hardcodeada de `android/app/src/main/AndroidManifest.xml`; verificar que la clave sale de `app.config.js`.

## 8. Admin, auditoría, notificaciones y búsqueda

- [x] 8.1 Corregir `adminService` para listar disputas, leer auditoría de Firestore y persistir suspensión; verificar con datos reales.
- [x] 8.2 Exigir nota en mantener/retirar y registrar auditoría en `P15_AdminDisputeScreen`; verificar ambos caminos.
- [x] 8.3 Leer auditoría e historial desde Firestore en `P18_AdminAuditScreen` y `P25_AuditLogScreen`; verificar tras reiniciar.
- [x] 8.4 Quitar el fallback a notificaciones globales en `P19_NotificationCenterScreen`; verificar aislamiento por `uid`.
- [x] 8.5 Manejar tap/deep link de push y corroboración en `pushService`/`notificationService`; verificar apertura de P19/P22/P2.
- [x] 8.6 Corregir el estado de carga y el plazo 72h en `P21`/`P22`; verificar impugnación repetida sin doble transición.
- [ ] 8.7 Aplicar normalización y paginación server-side en `firebase.ts`/`P13`; verificar búsqueda con teléfonos y fechas.
- [x] 8.8 Normalizar acentos/espacios en `lexiconFilter.ts` y sanitizar en el servicio; verificar variantes ofensivas.
- [x] 8.9 Anonimizar trackingCode y fechas en `exportService`/`adminService`; verificar el CSV exportado.

## 9. Observabilidad y accesibilidad

- [ ] 9.1 Integrar `@sentry/react-native` en `observability.ts` con DSN de entorno; verificar un error de prueba.
- [x] 9.2 Emitir eventos reales desde `analytics.ts` en búsqueda, envío, offline y OCR; verificar con consentimiento.
- [x] 9.3 Agregar `accessibilityLabel/Role/Value` a pines, barras y semáforos; verificar con VoiceOver/TalkBack.

## 10. Servicios externos (Fase 3)

- [ ] 10.1 Configurar Google Sign-In real (SHA-1, webClientId, build nativo) y verificar selector de cuentas.
- [ ] 10.2 Implementar envío de OTP SMS y verificación real; verificar código incorrecto y correcto.
- [ ] 10.3 Conectar RENAPER con credenciales y reintento en segundo plano; verificar DNI verificado.
- [ ] 10.4 Conectar Cloud Vision en `processEvidenceOCR` y validar coincidencia real; verificar CBU/Alias/Tel/Local.
- [ ] 10.5 Implementar FCM real y preferencias; verificar push al cambiar estado.
- [ ] 10.6 Configurar Sentry/Analytics de producción y verificar reporte de eventos.

## 11. Verificación final

- [x] 11.1 Ejecutar `npm run typecheck`, `npm test` y `npm run verify:all`; verificar que todo pasa.
- [ ] 11.2 Ejecutar el flujo Maestro crítico y los casos de la planilla marcados como fallas reales; registrar resultados.

## Workflow follow-up

- Archivar el change con `/opsx:archive` después de la revisión.
- Verificar el resultado archivado y sincronizar specs.
