# Proposal

## Why

La Propuesta 1 dejo el backend real y los flujos basicos de denuncias, pero falta cerrar el ciclo operativo: validar RG-02/RG-03, moderar disputas, administrar categorias y usuarios, medir metricas y exportar datos. Sin esto, la denuncia se crea pero no se gobierna ni se puede auditar/exportar, y el administrador no tiene herramientas para resolver disputas.

## What Changes

- Validacion RG-02 en P4/P5: relato minimo de 20 caracteres y al menos 1 evidencia; RG-03: categorias con `requiereUbicacion` exigen pin confirmado.
- **BREAKING (interno)**: `IncidentCategory` pasa de union cerrada a `string` para permitir categorias parametricas.
- Nuevo `services/categoryService.ts` con catalogo persistido (listar/crear/editar/desactivar) y `requiereUbicacion`.
- Nuevo modulo de administracion: P14_AdminDashboardScreen, P15_AdminDisputeScreen, P16_AdminCategoriesScreen, P17_AdminUsersScreen y P18_AdminAuditScreen.
- Nuevo `services/adminService.ts`: listar EN_DISPUTA, resolver disputa (mantener/retirar), auditoria, usuarios, metricas y dataset anonimizado.
- Nuevo `services/exportService.ts`: ficha en PDF/CSV con hash de autenticidad y QR; dataset anonimizado en CSV.
- Autocompletado y tolerancia a errores en P1/P13 (RF-003, RF-061).
- Estado de disputa: `EN_DISPUTA -> PUBLICADA` (mantener) y `EN_DISPUTA -> RESUELTA` (retirar, con nota).
- Acceso admin temporal por `EXPO_PUBLIC_ADMIN_EMAILS` (roles formales quedan pendientes).

## Capabilities

### New Capabilities
- `report-validation`: RG-02 y RG-03 aplicadas en la creacion de denuncias.
- `admin-moderation`: dashboard de disputas, resolucion, auditoria, usuarios, metricas y dataset anonimizado.
- `report-export`: exportacion de la ficha publica a PDF/CSV con autenticidad.
- `search-discovery`: autocompletado y busqueda tolerante en la consulta publica.

### Modified Capabilities

(none)

## Impact

- Codigo: `src/screens/P1`, `P2`, `P4`, `P5`, `P14..P18`, `P20`, `src/services/*`, `src/context/ReportFlowContext.tsx`, `src/types/index.ts`, `src/navigation/AppNavigator.tsx`.
- Dependencias: `expo-print`, `expo-sharing`, `expo-file-system`, `react-native-qrcode-svg`.
- Datos: colecciones `categorias`, `usuarios`, `eliminaciones` y `solicitudes_baja`.
- Config: `EXPO_PUBLIC_ADMIN_EMAILS`.

## Out of scope

- Roles U0-U4 formales con custom claims (RF-015) -> pendiente.
- Impugnaciones (RF-073 a RF-076) -> cambio `impugnaciones`.
- Notificaciones (RF-077 a RF-080) -> cambio `notificaciones`.
- Mapas reales con clusters/heatmap (RF-035 a RF-041) -> cambio `evidencias-mapa-real`.
- Legal profundo, CI/CD y accesibilidad (RF-081 a RF-086, RF-098 a RF-101) -> cambio `legal-infraestructura`.
