# Proposal

## Why

El MVP actual funciona de forma enteramente simulada: la autenticacion, el OCR, la geolocalizacion y la persistencia usan `setTimeout` y un fallback en memoria. Esto impide validar los requerimientos funcionales reales (RF-001 a RF-101) y deja la plataforma sin base para produccion. Este cambio conecta la app con los servicios gestionados de Firebase y Google Cloud, manteniendo el fallback offline para no romper la demo.

## What Changes

- **BREAKING**: `AuthContext.tsx` reemplaza la sesion simulada por Firebase Auth real (Google Sign-In). `UserProfile` y `UserIdentityFactors` se sincronizan con Firestore.
- **BREAKING**: `firebase.ts` deja de usar el fallback en memoria como fuente principal; la lectura/escritura usa Firestore y el fallback queda solo para offline.
- Nuevo `services/authService.ts` (Google, Phone OTP, DNI/RENAPER) y `services/cloudFunctions.ts` (OCR Cloud Vision, rate limiting, spam).
- Nuevo `services/env.ts` para cargar variables de entorno validadas.
- `draftStorage.ts` gana autosave cada 10s, deteccion de red (NetInfo) y cola de sincronizacion con backoff exponencial.
- Nuevas pantallas P10_MisDenuncias, P11_TrackingCode, P12_EditReport, P13_AdminDashboard, P20_Settings.
- Reglas de Firestore por rol (U0/U1/U3/U4) y estado; indices compuestos actualizados.

## Capabilities

### New Capabilities
- `user-auth`: Autenticacion real (Google, telefono OTP, DNI/RENAPER), DDJJ, perfil y borrado de datos (RF-009 a RF-014).
- `report-lifecycle`: Creacion, edicion 24hs, borrado logico, maquina de estados, historial, idempotencia, codigo de seguimiento y categorias (RF-016 a RF-027).
- `offline-sync`: Borradores con autosave, deteccion de conectividad y sincronizacion con reintentos (RF-050 a RF-057).
- `public-consultation`: Busqueda publica, resultados con semaforo, detalle enmascarado, filtros, paginacion y consulta por codigo (RF-058 a RF-065).
- `server-logic`: Logica de servidor con Cloud Functions (OCR Cloud Vision, rate limiting, deteccion de spam, validaciones CBU/tel) (RF-029, RF-030, RF-088 a RF-091).
- `platform-config`: Variables de entorno, reglas por rol, indices y rendimiento (RF-092 a RF-096, RNF-001, RNF-004).

### Modified Capabilities

(none)

## Impact

- Codigo: `src/services/*`, `src/context/*`, `src/screens/P1..P20`, `src/navigation/AppNavigator.tsx`, `firestore.rules`, `firestore.indexes.json`, `package.json`.
- Dependencias: `expo-location`, `expo-image-picker`, `@react-native-community/netinfo`, `react-native-maps`.
- Servicios externos: proyecto Firebase (Auth, Firestore, Storage, Functions) + Google Cloud (Maps, Geocoding, Vision).
- Entorno: requiere plan Blaze, tarjeta de credito y archivo `.env`.

## Out of scope

- Impugnaciones (RF-073 a RF-076) -> cambio `impugnaciones`.
- Push notifications (RF-077 a RF-080) -> cambio `notificaciones`.
- Legal/compliance profundo (RF-081 a RF-086), accesibilidad (RF-101), CI/CD (RF-098), E2E (RF-099), analytics (RF-097) -> cambio `legal-infraestructura`.
- Sistema de roles U0-U4 completo (RF-015) -> pendiente hasta cerrar la definicion de roles.
- Mapa real con clusters/heatmap (RF-035 a RF-041) -> cambio `evidencias-mapa-real`.
