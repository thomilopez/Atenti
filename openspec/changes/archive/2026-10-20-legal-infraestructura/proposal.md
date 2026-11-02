# Proposal

## Why

El producto ya tiene el flujo funcional, pero le faltan los resguardos legales y la base de produccion: no se persiste el hash de la DDJJ, no hay terminos versionados ni derecho al olvido, el contenido ofensivo no se filtra y no existen perfiles de build, CI/CD, monitoreo de errores, analytics con consentimiento, pruebas E2E ni criterios de accesibilidad. Sin esto no se puede operar ni auditar en serio (RF-081 a RF-101).

## What Changes

- DDJJ: se genera el hash SHA-256 con IP y timestamp al enviar y se guarda en la denuncia; se muestra en la auditoria.
- Terminos y condiciones versionados + politica de privacidad y retencion (Ley 25.326) en una pantalla legal.
- Derecho al olvido: formulario formal que registra la solicitud de baja.
- Log de auditoria global (uid, email, IP, timestamp) para administradores.
- Filtro lexico (RF5/CA5): sustituye palabras ofensivas en el relato y valida en el servicio.
- Infra: `eas.json` con perfiles dev/staging/prod, workflow de CI, flujo E2E de Maestro.
- Observabilidad y analytics: adaptadores con fallback no-op, consentimiento de telemetria y captura de errores.
- Cache de busqueda con TTL para sostener busquedas < 2s.
- Accesibilidad: etiquetas y roles en los controles clave.

## Capabilities

### New Capabilities
- `legal-compliance`: DDJJ con hash, terminos versionados, privacidad/retencion, derecho al olvido y log de auditoria.
- `content-filtering`: sustitucion y validacion de terminos ofensivos en el relato.
- `delivery-quality`: EAS, CI/CD, E2E, observabilidad, analytics, cache y accesibilidad.

### Modified Capabilities

(none)

## Impact

- Codigo: `src/services/ddjjService.ts`, `termsService.ts`, `lexiconFilter.ts`, `observability.ts`, `analytics.ts`, `cacheService.ts`, `src/screens/P4`, `P18`, `P20`, `P23_Legal`, `P24_RightToBeForgotten`, `P25_AuditLog`, `AppNavigator`, `types`.
- Config: `eas.json`, `.github/workflows/ci.yml`, `.maestro/`, `.env.example` (DSN de Sentry), `package.json`.
- Datos: `audit_logs`, `solicitudes_baja`, `terminos`.

## Out of scope

- Push notifications y centro (cambio `notificaciones`).
- Roles U0-U4 formales.
- Instalacion obligatoria de Sentry: el adaptador funciona con fallback y se activa al configurar el DSN.
