# Proposal

## Why

La batería de casos de prueba detectó fallas reales de integridad y coherencia: la app confirma denuncias aunque Firestore falle, la sesión y los factores de identidad se pierden al reiniciar, el código de seguimiento tiene formatos incompatibles, la consulta pública y el historial viven solo en memoria, el OCR simulado otorga puntos falsos y varias pantallas muestran scores o estados que no coinciden con lo persistido. El modo demo y el modo Firebase divergen, por lo que los resultados de QA no son confiables.

## What Changes

- **Fase 1 — Integridad y coherencia**: propagar errores de escritura, idempotencia atómica, códigos `AT-2026-XXXXXX` de 6 dígitos, historial y consulta pública desde Firestore, restauración de sesión, factores de identidad persistidos, borrado real de cuenta, roles por claims y aceptación de DDJJ/TyC.
- **Fase 2 — Casos de prueba**: validaciones de Alias/teléfono/CBU/Local, limpieza de formulario y `claveOperacion`, Mis Denuncias por dueño y todos los estados, edición/eliminación con 24h, semáforo único de 4 colores, score real, mapas con radio Haversine y pin exacto, evidencias con cámara/galería, OCR sin falsos positivos, límites en servidor, enmascaramiento público real, admin/auditoría desde Firestore y notificaciones aisladas por usuario.
- **Fase 3 — Servicios externos**: Google Sign-In real, SMS OTP, RENAPER, Cloud Vision, FCM, Sentry y Analytics. Si falta una credencial, la simulación queda marcada explícitamente y nunca otorga puntos ni muestra datos falsos como reales.
- **Modo prueba**: las reglas de Firestore se mantienen como están; no se endurecen a producción en este change. La seguridad de producción queda documentada como deuda.

## Capabilities

### New Capabilities

Ninguna. El change corrige comportamiento ya especificado.

### Modified Capabilities

- `user-auth`: restauración de sesión, persistencia de factores, borrado real y roles.
- `report-lifecycle`: idempotencia atómica, código de 6 dígitos, historial persistido y ownership.
- `report-validation`: validación de Alias, teléfono E.164, CBU y ubicación exacta.
- `evidence-management`: OCR sin falsos positivos, límites en servidor y enmascaramiento público real.
- `geo-mapping`: filtro por radio efectivo, pin exacto y heatmap con datos reales.
- `credibility-scoring`: semáforo único de 4 colores, identidad real e historial persistido.
- `admin-moderation`: disputas/auditoría/suspensión desde Firestore y con nota obligatoria.
- `public-consultation`: consulta por código async, resultados con semáforo y paginación.
- `search-discovery`: normalización y fuzzy en resultados.
- `offline-sync`: reintentos con temporizador, cola visible y aviso borrador ≠ enviado.
- `content-filtering`: normalización de acentos, espacios y límites Unicode.
- `legal-compliance`: hash DDJJ con IP de servidor, versión unificada y baja real.
- `platform-config`: quitar claves hardcodeadas y declarar plugins de permisos.
- `delivery-quality`: tests reales en CI, Sentry/Analytics y accesibilidad.

## Impact

- Pantallas: `P1_HomeScreen`, `P2_ReportDetailScreen`, `P3_LegalAuthScreen`, `P4_CreateReportScreen`, `P5_OCRValidationScreen`, `P8_ConfirmationScreen`, `P9_CredibilityPanelScreen`, `P10_MisDenunciasScreen`, `P11_TrackingCodeScreen`, `P12_EditReportScreen`, `P13_SearchResultsScreen`, `P14`–`P19`, `P20_SettingsScreen`, `P21`–`P26`, `P31_FullMapScreen`.
- Servicios: `firebase.ts`, `authService.ts`, `accountService.ts`, `ocrService.ts`, `storageService.ts`, `masking.ts`, `credibility.ts`, `scoreHistory.ts`, `syncQueue.ts`, `locationService.ts`, `adminService.ts`, `auditService.ts`, `notificationService.ts`, `pushService.ts`, `termsService.ts`, `ddjjService.ts`.
- Backend: `functions/src/index.ts` y `firestore.rules` (sin endurecer reglas en este change).
- Tests: `scripts/verify-*` pasan a importar módulos reales; se agregan tests de servicios puros y Maestro en CI.

## Out of Scope

- Endurecer `firestore.rules` para producción; se mantiene “modo prueba” por decisión del proyecto.
- Credenciales productivas de Google, SMS, RENAPER, Cloud Vision, FCM, Sentry y Analytics (Fase 3).
- Cambios de diseño visual fuera de los necesarios para semáforo, evidencias y accesibilidad.
