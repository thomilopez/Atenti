# Tasks

## 1. Legal y trazabilidad

- [x] 1.1 Agregar `ddjjHash` a `AuditMetadata` y al input de `registrarDenuncia`; verificar `npx tsc --noEmit`
- [x] 1.2 Generar el hash con `generarHashDDJJ` en `ReportFlowContext.tsx` y pasarlo al registro; verificar que la denuncia guarda el hash
- [x] 1.3 Mostrar el hash y su timestamp en `P18_AdminAuditScreen.tsx`; verificar que se ve en la auditoria
- [x] 1.4 Crear `src/services/termsService.ts` y `P23_LegalScreen.tsx` (terminos versionados, privacidad y retencion); verificar el selector de version
- [x] 1.5 Crear `P24_RightToBeForgottenScreen.tsx` con motivo obligatorio; verificar que registra la solicitud
- [x] 1.6 Crear `src/services/auditService.ts` y `P25_AuditLogScreen.tsx`; verificar el listado y el estado vacio

## 2. Filtro lexico

- [x] 2.1 Crear `src/services/lexiconFilter.ts` con sustitucion por asteriscos; verificar con `scripts/verify-legal.js`
- [x] 2.2 Aplicar el filtro en el relato de `P4_CreateReportScreen.tsx` y sanitizar en `registrarDenuncia`; verificar que el texto guardado queda enmascarado

## 3. Entrega y calidad

- [x] 3.1 Crear `eas.json` con perfiles development, preview y production; verificar que es JSON valido
- [x] 3.2 Crear `.github/workflows/ci.yml` con typecheck y `verify:all`; verificar la sintaxis YAML
- [x] 3.3 Crear `.maestro/flujo-critico.yaml`; verificar que el archivo existe y describe el recorrido
- [x] 3.4 Crear `src/services/observability.ts` y agregar `EXPO_PUBLIC_SENTRY_DSN` a `.env.example`; verificar el fallback sin DSN
- [x] 3.5 Crear `src/services/analytics.ts` y el consentimiento en `P20_SettingsScreen.tsx`; verificar que sin consentimiento no registra
- [x] 3.6 Crear `src/services/cacheService.ts` y usarlo en `getIncidents`; verificar que la segunda busqueda usa cache
- [x] 3.7 Agregar `accessibilityRole`/`accessibilityLabel` a `BottomNavBar.tsx` y al FAB de `P1_HomeScreen.tsx`; verificar con lector de pantalla o inspeccion

## 4. Integracion y verificacion

- [x] 4.1 Registrar P23, P24 y P25 en `AppNavigator.tsx` y `RootStackParamList`; verificar navegacion
- [x] 4.2 Agregar accesos a la pantalla legal y al derecho al olvido desde `P20_SettingsScreen.tsx`; verificar navegacion
- [x] 4.3 Crear `scripts/verify-legal.js` y agregarlo a `verify:all`; verificar `npm run verify:all`
- [x] 4.4 Actualizar `docs/setup-servicios.md` con Sentry, EAS y CI; verificar que los pasos se siguen en orden
- [x] 4.5 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
