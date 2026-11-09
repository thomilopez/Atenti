# Design

## Context

Ver `proposal.md - Why`. El estado actual mezcla escrituras directas a Firestore con estado en memoria, silencia errores y mantiene dos modos (demo y Firebase) con comportamientos distintos. La app ya tiene servicios separados (`firebase.ts`, `authService.ts`, `credibility.ts`, `ocrService.ts`, `syncQueue.ts`) y pantallas P1–P33. Firebase Blaze está disponible; las reglas de Firestore se mantienen en modo prueba por decisión del proyecto.

## Goals / Non-Goals

**Goals:**
- Una sola fuente de verdad para denuncias, historial, auditoría y score.
- Que el modo demo y el modo Firebase no otorguen puntos ni confirmen acciones que no ocurrieron.
- Corregir los flujos de QA sin reescribir la arquitectura de navegación.
- Preparar el terreno para servicios externos reales en Fase 3.

**Non-Goals:**
- Endurecer `firestore.rules` para producción en este change.
- Rediseñar la UI fuera de semáforos, evidencias, mapa y accesibilidad.
- Implementar credenciales productivas de Google, SMS, RENAPER, Vision, FCM, Sentry o Analytics en Fase 1–2.

## Decisions

### 1. Cloud Functions para operaciones que el cliente no puede resolver
- **Decisión:** usar callables para borrado de cuenta, custom claims/roles, OTP, OCR, rate limit, spam, push y captura de IP. Las escrituras de denuncias se corrigen primero en cliente y se evalúa migrarlas a callable en Fase 2.
- **Por qué:** Blaze está disponible; `deleteUser`, claims y la IP real requieren Admin SDK. Mantenerlas en el cliente obliga a reglas permisivas y no es confiable.
- **Alternativa descartada:** endurecer reglas y seguir escribiendo desde el cliente. Se descarta porque el proyecto pidió mantener modo prueba y porque el cliente no puede obtener IP ni borrar Auth.

### 2. Errores de persistencia propagados
- **Decisión:** reemplazar los `catch` que solo hacen `console.warn` por errores tipados (`FirestoreWriteError`, `OfflineError`, `ValidationError`) que la UI mapea a mensajes.
- **Por qué:** los casos R-012, R-014, R-073 y R-074 son consecuencia de confirmar éxito sin persistir.
- **Alternativa descartada:** mantener el fallback silencioso a memoria; oculta fallas y produce datos inconsistentes entre dispositivos.

### 3. Idempotencia atómica
- **Decisión:** crear la denuncia y `denuncias_by_clave` dentro de `runTransaction`; el contador de seguimiento se lee y actualiza en la misma transacción.
- **Por qué:** el chequeo actual (`existeDenunciaPorClave` + escritura posterior) tiene carrera.
- **Alternativa descartada:** ID determinístico por clave sin transacción; simplifica duplicados pero no resuelve la secuencia del código.

### 4. Códigos de 6 dígitos con normalización
- **Decisión:** generar `AT-2026-\d{6}` y normalizar/aceptar códigos históricos de 4 dígitos en la consulta.
- **Por qué:** las semillas y el código legado usan 4 dígitos y P11 valida 6; romper la consulta de datos existentes es peor que aceptar ambos.
- **Alternativa descartada:** migrar todas las semillas a 6 dígitos; no cubre datos ya creados.

### 5. Historial, auditoría y consulta pública desde Firestore
- **Decisión:** convertir `getHistorial`, `obtenerDenuncia` y `consultarAntecedentePublico` en operaciones async que leen Firestore, con fallback a memoria solo en modo demo.
- **Por qué:** hoy se pierden al reiniciar y bloquean disputas, auditoría y consulta por código.
- **Alternativa descartada:** persistir todo en AsyncStorage; no es multi-dispositivo ni auditable.

### 6. Semáforo único de 4 colores
- **Decisión:** `nivelCredibilidad4` es la única taxonomía; `getTrafficLightColor` y los componentes se adaptan o se retiran.
- **Por qué:** conviven 3 y 4 colores; P2 usa un círculo gris fijo y P13 no muestra semáforo.
- **Alternativa descartada:** mantener dos taxonomías por compatibilidad; perpetúa la inconsistencia de QA.

### 7. Evidencias: simulación explícita y enmascaramiento real
- **Decisión:** `ocrResult` incluye `simulated`; el mock devuelve `matched:false`; el bono OCR exige validación del servidor. La vista pública usa miniaturas enmascaradas y no la URI original.
- **Por qué:** el mock actual otorga 5 puntos y muestra "OCR validado" sin comparar nada; el blur cosmético no protege la imagen.
- **Alternativa descartada:** ocultar la evidencia pública por completo; se pierde valor informativo. Se prefiere miniatura enmascarada.

### 8. Mapas: Haversine y pin exacto
- **Decisión:** helper `distanciaKm` en `locationService.ts`; P31 filtra antes de renderizar. `MapPickerModal` usa un flag `touched` y `MapViewWrapper` implementa tap/drag también en web.
- **Por qué:** el radio solo dibuja un círculo; el pin web está fijo por índice.
- **Alternativa descartada:** filtrar en `MapViewWrapper`; mantiene el problema de renderizar pines innecesarios y no sirve para listas.

### 9. Offline con temporizador y cola visible
- **Decisión:** `syncQueue` expone `pendientes`, `fallidos` y `intentos`; `ReportFlowContext` procesa la cola con intervalo/AppState además de `isConnected`.
- **Por qué:** hoy los reintentos dependen de una transición de red y las entradas se descartan a los 5 intentos.
- **Alternativa descartada:** usar solo NetInfo; no reintenta si la red nunca cambió de estado.

### 10. Tests sobre módulos reales
- **Decisión:** agregar tests de servicios puros que importen `credibility.ts`, `normalize.ts`, `stateMachine.ts`, `masking.ts`, `evidenceService.ts` y `operationKey.ts`; CI ejecuta tests y Maestro.
- **Por qué:** los `verify-*` replican lógica y pueden pasar con código divergente.
- **Alternativa descartada:** seguir ampliando scripts de strings; no detectan regresiones reales.

## Risks / Trade-offs

- **Migrar escrituras a callables puede romper el modo demo** → mantener un adaptador de servicios y probar ambos modos.
- **Aceptar códigos de 4 y 6 dígitos puede generar ambigüedad** → normalizar a 6 al generar y solo aceptar 4 en lectura histórica.
- **Enmascarar evidencias puede afectar la utilidad del detalle público** → ofrecer miniatura enmascarada y acceso original solo a admin/dueño.
- **Suspensión y roles con claims requieren refresh de token** → forzar `getIdToken(true)` después de cambiar claims y documentar el cierre de sesión.
- **El modo prueba de reglas sigue siendo permisivo** → no es un riesgo nuevo; queda documentado y se mitiga con validaciones de servicio y Functions.
- **Tests de UI en Expo 57 pueden ser costosos** → priorizar tests puros y Maestro para el flujo crítico.

## Migration Plan

1. Crear rama `fix-casos-de-prueba` desde `feat/web-navegacion` + `main`.
2. Implementar Fase 1 en servicios y contexts; mantener compatibilidad con datos en memoria para demo.
3. Implementar Fase 2 por pantalla/servicio, con pruebas después de cada bloque.
4. Desplegar Functions de Fase 1–2 en el proyecto Blaze.
5. Implementar Fase 3 con credenciales reales cuando estén disponibles.
6. Rollback: las escrituras nuevas usan transacciones y campos opcionales; si una Function falla, el cliente conserva el flujo de borrador y muestra error. No se eliminan colecciones existentes.

## Open Questions

Ninguna que cambie el alcance o los specs. Las credenciales de Fase 3 se resuelven al iniciar esa fase.
