# Resumen de casos de prueba — Atenti

> Documento para el equipo. Resume qué se encontró, qué se corrigió en la rama `fix-casos-de-prueba` y qué queda pendiente por credenciales o alcance.
>
> Estado del change: `fix-casos-de-prueba` — 48/59 tareas completadas.
> Verificación: `npm run typecheck`, `npm test` (9/9), `npm run verify:all` y `functions npm run build` pasan.

## 1. Resumen ejecutivo

La app tenía un problema de fondo: **el modo demo y el modo Firebase no eran coherentes**. Varias pantallas confirmaban acciones que no se persistían, el OCR simulado otorgaba puntos, la sesión se perdía al reiniciar y el historial/auditoría vivían solo en memoria. Eso hacía que muchos casos “fallaran” por la misma causa y no por una pantalla aislada.

En esta rama se corrigió la base:

- Persistencia real y errores visibles.
- Idempotencia atómica y códigos de 6 dígitos.
- Historial, auditoría y consulta pública desde Firestore.
- Sesión restaurada, factores persistidos, roles por claims y borrado real de cuenta.
- Validaciones de Alias/teléfono/CBU/Local.
- Semáforo único de 4 colores y scores reales.
- Evidencias con cámara/galería, OCR sin falsos positivos y proyección pública sin URI original.
- Mapas con filtro real por radio, pin exacto y heatmap con datos reales.
- Offline con reintentos por temporizador y cola visible.
- Búsqueda normalizada, filtro léxico y analytics/accessibility básicos.

## 2. Correcciones importantes a las notas del tester

No todas las notas eran exactas. Estas son las diferencias que encontramos leyendo el código:

| Caso | Nota original | Lo que realmente pasaba |
|---|---|---|
| R-012 | “No se guarda nada en Firestore” | Sí se intentaba escribir, pero el `catch` silenciaba el error y había una función legada que escribía en `incidents` en vez de `denuncias`. La UI confirmaba igual. |
| R-021 | “OCR simulado” | Existía un path real a Cloud Vision, pero el fallback devolvía `matched:true` siempre y otorgaba el bono OCR. |
| R-034 | “Faltan 25 puntos de DNI” | El DNI vale 10, no 25. El tope de 75% era DNI (10) + corroboración (15). |
| R-038 | “No existe el gris” | La función de 4 colores existía; el problema era que P2/P13 usaban 3 colores o un círculo fijo. |
| R-052 | “Enmascaramiento funciona” | Solo había `blurRadius` cosmético; la URI original seguía accesible. |
| R-066 | “Falla la lógica de estados” | La transición era correcta; la UI quedaba cargando porque `P22.cargar` no tenía `try/finally`. |
| R-001 | “Es una simulación” | Faltaba restauración de sesión y detección de proveedor; el login real depende de credenciales y development build. |

## 3. Qué se arregló en código

### Autenticación y perfil

- `AuthContext`: restauración con `onAuthStateChanged`, perfil `usuarios/{uid}`, factores persistidos y `isAdmin` por claims.
- `authService`: `googleAuth` se deriva de `providerData`, no de un flag fijo.
- `P3`: la DDJJ/TyC se registra al aceptar; ya no se puede continuar sin aceptarla.
- `P9`: teléfono y DNI reales, sin DNI precargado; validación de formato y DNI bloqueado si está verificado.
- `P20`/`P24`: borrado real vía `eliminarCuenta`; ya no es solo una solicitud.
- `functions/src/index.ts`: callables `eliminarCuenta` y `setRolUsuario`.

### Denuncias

- `registrarDenuncia`: transacción atómica, `denuncias_by_clave`, contador de seguimiento, código `AT-2026-\d{6}`, identidad real y límites de evidencia.
- `getIncidents`: ya no trae solo `PUBLICADA` cuando se piden todos los estados; no pisa el índice en memoria con resultados parciales.
- `actualizarEstadoDenuncia`: lee Firestore si no está en memoria, escribe historial + auditoría e invalida caché.
- `getHistorial`, `obtenerDenuncia`, `consultarAntecedentePublico`: async y con lectura Firestore.
- Edición/borrado: valida dueño y ventana de 24hs en el servicio, no solo en la UI.
- `P10`: filtra por dueño, incluye todos los estados y refresca al foco.
- `P11`: consulta pública async, acepta códigos históricos de 4 dígitos.
- `ReportFlowContext`: limpia borrador y regenera `claveOperacion` después de enviar.
- `syncQueue`: conserva fallidos, reintenta por temporizador/AppState y expone `contarFallidos`.

### Validaciones

- Alias: entre 3 y 30 caracteres, al menos una letra, caracteres permitidos.
- Teléfono: normalización a `+549` + 10 dígitos.
- CBU: 22 dígitos, checksum y `maxLength`.
- Local Físico: dirección/pin confirmado.
- `P12`: revalida relato, dirección y ventana de 24hs.
- `lexiconFilter`: acentos, mayúsculas y letras separadas por espacios/signos.

### Credibilidad

- Fórmula única 40 + 45 + 15.
- `TrafficLightIndicator`, `VeracityBar` y `ScoreBreakdown` usan el semáforo de 4 colores.
- P2/P13 muestran color, etiqueta y score reales.
- P9 dejó de sumar 45+15 ficticios.
- `|| 80` reemplazado por `?? 0`.
- Historial de score se registra al enviar.

### Evidencias y OCR

- P5 ofrece cámara o galería; ya no usa una URL demo inválida.
- `ocrService`: el mock devuelve `simulated:true` y `matched:false`; no otorga puntos.
- `storageService`: sube con `expo-file-system` y `uploadBytes`; ya no silencia el fallo.
- `toPublicProjection`: no incluye la URI original.
- P2 muestra placeholders “Evidencia protegida” en vez de cargar la imagen original.
- Functions: OCR exige autenticación, limita tamaño y valida tipo/valor; extrae también teléfonos.
- Límites de 5 archivos/10MB/MIME en cliente y servicio.

### Mapas

- `locationService.distanciaKm` (Haversine).
- P31 filtra realmente por radio.
- `MapPickerModal` exige interacción (`touched`) antes de confirmar.
- Fallback web: pines por coordenadas, tap para fijar pin y heatmap por denuncia.
- Clusters nativos hacen zoom al área.
- Se quitó la API key hardcodeada de `AndroidManifest.xml`; sale de `app.config.js`.
- Plugins de `expo-location`, `expo-image-picker` y `expo-document-picker` agregados.

### Admin, auditoría y notificaciones

- Disputas se listan desde Firestore.
- Resolver exige nota en mantener y retirar.
- Auditoría e historial se leen de Firestore.
- Suspensión se persiste y se relee.
- P19 ya no muestra notificaciones de otros usuarios.
- Push: se agregó listener de tap para abrir P19 o P22.
- `P22`: `try/finally`, estado “Cargando”, error y reintento.

### Búsqueda, offline e infra

- Búsqueda normalizada por tipo de identificador.
- Fechas “hasta” se interpretan como fin del día.
- Filtro léxico normalizado.
- Analytics emite eventos de búsqueda, envío, OCR y offline.
- Accesibilidad en barras, pines y semáforos.
- CI ejecuta `npm test` además de typecheck y verify.

## 4. Qué queda pendiente

### Pendiente de código (no bloqueante para demo)

- `1.3`: sumar Maestro al CI (hoy el flujo existe pero se corre manual).
- `6.3`: quitar EXIF del archivo antes de subirlo. Hoy se guarda la imagen original y el EXIF queda en el archivo de Storage, aunque no se expone en la vista pública.
- `8.7`: paginación server-side real con `limit`/`startAfter`. Hoy la búsqueda filtra en cliente y pagina con `slice`.
- `9.1`: integrar `@sentry/react-native` con DSN.
- `11.2`: ejecutar Maestro y registrar resultados de la planilla.

### Depende de credenciales / configuración externa

- **Google Sign-In real**: SHA-1, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, proveedor Google habilitado y development build. Sin eso, Expo Go usa sesión anónima.
- **SMS OTP real**: falta proveedor SMS y una Function que envíe/crea el código. Hoy `verificarTelefono` valida contra `otp_codes`, pero no hay emisor.
- **RENAPER**: sin `EXPO_PUBLIC_RENAPER_*`, el DNI queda “verificando”. No se otorgan puntos.
- **Cloud Vision**: requiere service account, API habilitada y Functions desplegadas. Sin eso, el OCR se marca como simulado.
- **FCM/Push real**: requiere development build, `projectId` de EAS y `enviarPushNotificacion` desplegada. En Expo Go se usan notificaciones in-app.
- **Sentry**: requiere dependencia y DSN.
- **Analytics externo**: los eventos se emiten, pero no hay proveedor conectado.
- **Reglas de producción**: se mantienen en modo prueba por decisión del proyecto. No son reglas de producción.
- **Storage**: las reglas y el bucket deben estar desplegados para que las evidencias suban de verdad.

## 5. Qué tener en cuenta al probar

1. Usar **development build** para Google Sign-In, cámara y push. Expo Go no alcanza.
2. Desplegar Functions antes de probar OTP, OCR real, rate limit, spam, borrado de cuenta y roles.
3. Aplicar `firestore.rules`, `firestore.indexes.json` y `storage.rules`.
4. Completar `.env` y `google-services.json`; no commitearlos.
5. Si se prueba en Android con el `android/` nativo, correr `npx expo prebuild --clean` después de quitar la key hardcodeada.
6. El modo demo ya no otorga puntos falsos ni confirma guardados inexistentes; si algo falla, ahora muestra el error.
7. Las reglas de Firestore siguen en modo prueba: cualquier autenticado puede escribir. No usar esto en producción.

## 6. Casos de la planilla: estado orientativo

- **Corregidos en código**: R-002 (formato), R-003 (DNI read-only/validación), R-005, R-006/R-078 (código de borrado), R-008, R-010/R-028 (pin), R-012, R-014, R-015, R-016, R-018, R-023/R-052, R-025, R-031, R-034/R-038/R-039, R-041, R-047/R-048/R-049, R-051, R-057, R-059/R-060, R-064, R-066, R-073/R-074 (persistencia), R-079, R-081, R-082/R-083 (código), R-092, R-093 (parcial).
- **Corregidos, pero requieren credenciales/build para probar el servicio real**: R-001, R-002 (SMS), R-003 (RENAPER), R-007 (claims deploy), R-020/R-024 (Storage deploy), R-021/R-022/R-040 (Vision), R-067/R-069/R-070/R-071 (FCM), R-088/R-089 (Sentry/Analytics).
- **Pendientes de código**: R-026 (EXIF), R-055 (paginación server-side), R-088 (Sentry), R-093 (accesibilidad completa).
- **Datos insuficientes para probar**: R-055 (no hay volumen), R-057 (sin botón de cambio de estado), R-081 (forma de prueba).

## 7. Mensaje corto para el equipo

> La app ya no “miente”: si Firestore falla, se ve el error; si el OCR es simulado, no suma; si una denuncia no se guardó, no navega al éxito. Para probar Google, cámara, OTP y push usen development build y desplieguen Functions. Las reglas siguen en modo prueba; no las llevemos a producción sin revisarlas. Lo que queda pendiente es EXIF, paginación server-side, Sentry y Maestro en CI. El resto depende de credenciales (SMS, RENAPER, Vision, FCM).
