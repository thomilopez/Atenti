# Design

## Context

Ver `proposal.md` - Why. La app ya tiene `ddjjService`, un panel de auditoria por denuncia (P18), una solicitud de baja en P20 y reglas de Firestore. Este cambio consolida los resguardos legales, agrega filtrado de contenido y completa la base de entrega/observabilidad sin introducir dependencias nativas pesadas.

## Goals / Non-Goals

**Goals:**
- Persistir y mostrar el hash de la DDJJ.
- Terminos versionados, privacidad, retencion y derecho al olvido.
- Log de auditoria global.
- Filtro lexico en UI y servicio.
- EAS, CI, E2E, observabilidad, analytics, cache y accesibilidad.

**Non-Goals:**
- Push notifications y centro (cambio `notificaciones`).
- Instalar Sentry/Firebase Analytics de forma obligatoria.

## Decisions

**Decision 1: Hash de DDJJ dentro de `audit`.** `ReportFlowContext` genera el hash con `generarHashDDJJ` al enviar y lo pasa a `registrarDenuncia`, que lo guarda en `audit.ddjjHash`. Alternativa: guardarlo en una coleccion aparte; se descarta por simplicidad y porque ya viaja con la denuncia.

**Decision 2: Catalogo de terminos estatico y versionado.** `termsService.ts` expone `TERMINOS_VERSIONS` y `VERSION_ACTUAL`; la aceptacion se registra en `solicitudes_baja`/`terminos`. Alternativa: cargar desde Firestore; se deja para mas adelante.

**Decision 3: Una pantalla legal unificada.** P23_LegalScreen agrupa terminos (con selector de version), privacidad y retencion; el derecho al olvido vive en P24. Alternativa: cuatro pantallas; se descarta para no fragmentar la navegacion.

**Decision 4: Derecho al olvido reutiliza `registrarSolicitudBaja`.** Se agrega un formulario formal con motivo y confirmacion. Alternativa: solo el modal de P20; se descarta porque RF-086 pide un flujo paso a paso.

**Decision 5: Log de auditoria global con fallback.** `auditService.ts` lee `audit_logs` (admin) y, en demo, deriva eventos de las denuncias. Alternativa: exigir Firestore; se descarta para poder probar.

**Decision 6: Filtro lexico en cliente y servicio.** `lexiconFilter.ts` sustituye palabras por asteriscos en P4 y `registrarDenuncia` sanitiza el relato. Alternativa: solo en el servidor; se descarta porque RF-087 pide sustitucion en tiempo real.

**Decision 7: Observabilidad y analytics como adaptadores.** `observability.ts` y `analytics.ts` usan un SDK si esta disponible/DSN configurado y, si no, registran localmente. Alternativa: instalar Sentry ahora; se descarta para no acoplar el build a una dependencia nativa sin DSN.

**Decision 8: Cache de busqueda con TTL corto.** `cacheService.ts` guarda resultados 30s y se invalida al registrar una denuncia nueva. Alternativa: cache persistente; se descarta por datos sensibles y frescura.

**Decision 9: Accesibilidad incremental.** Se agregan `accessibilityRole`/`accessibilityLabel` a la barra inferior, FAB y botones principales; `VeracityBar` ya muestra el porcentaje numerico. Alternativa: auditoria completa WCAG; se documenta como deuda.

## Risks / Trade-offs

- [Sentry/Firebase Analytics no instalados] -> Los adaptadores hacen no-op y quedan listos para activarse con DSN.
- [Maestro requiere dispositivo/emulador] -> El flujo se versiona y se corre en local/CI con emulador.
- [Lexico basico] -> Lista mantenible y ampliable; validacion tambien en el servicio.
- [Cache puede devolver datos viejos] -> TTL de 30s e invalidacion al escribir.
- [Accesibilidad parcial] -> Se cubren los controles clave y se deja checklist para completar.

## Migration Plan

1. Publicar terminos v1.0 y registrar la version en las nuevas aceptaciones.
2. Desplegar la regla de `audit_logs` ya existente; no requiere migracion de datos.
3. Configurar `EAS_PROJECT_ID` y el DSN de Sentry cuando esten disponibles.
4. **Rollback:** desactivar los adaptadores y el cache; las pantallas legales quedan accesibles sin afectar datos.

## Open Questions

(none)
