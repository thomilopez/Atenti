# Design

## Context

Ver `proposal.md` - Why. El MVP simula Auth, OCR, geolocalizacion y persistencia con `setTimeout` y Maps en memoria (`src/services/firebase.ts`, `src/context/AuthContext.tsx`). Los servicios ya tienen la forma correcta (idempotencia, maquina de estados, normalizacion, enmascaramiento) pero operan sobre datos en memoria. Este cambio reemplaza las fuentes de datos por servicios gestionados reales sin cambiar el contrato interno de los servicios.

## Goals / Non-Goals

**Goals:**
- Autenticacion real (Google + Phone OTP + DNI/RENAPER) integrada con `AuthContext`.
- Persistencia real en Firestore con fallback offline intacto.
- Cloud Functions para OCR, rate limiting, spam y validaciones.
- Offline-first con autosave, NetInfo y cola de sincronizacion.
- Consulta publica anonima funcional.
- Entorno y reglas de seguridad por rol/estado.

**Non-Goals:**
- Mapa real con clusters/heatmap (cambio `evidencias-mapa-real`).
- Impugnaciones y notificaciones (cambios `impugnaciones` y `notificaciones`).
- Legal profundo, CI/CD, E2E, accesibilidad (cambio `legal-infraestructura`).

## Decisions

**Decision 1: Un solo proyecto de Google Cloud.** Firebase, Maps, Geocoding y Vision conviven en el mismo proyecto y billing. Alternativa: separar Maps en otro proyecto; se descarta por la friccion de dos billing accounts y dos conjuntos de credenciales. Consecuencia: un solo `.env` y un solo `firebaseConfig`.

**Decision 2: Mantener el fallback en memoria.** Los servicios actuales hacen `try/catch` y caen al fallback. Se conserva como modo offline y de demo, pero Firestore pasa a ser la fuente de verdad. Alternativa: eliminar el fallback; se descarta porque romperia la demo sin credenciales.

**Decision 3: Cloud Functions para OCR y reglas sensibles.** El OCR y el rate limiting viven en el servidor para no exponer la API key de Vision ni permitir que el cliente se auto-otorgue puntaje. Alternativa: llamar Vision desde el cliente; se descarta por seguridad y por el requisito de RNF-009.

**Decision 4: Cola de sincronizacion en el cliente.** Los borradores se encolan en AsyncStorage con su `claveOperacion` y se sincronizan con backoff exponencial al recuperar red. Alternativa: depender de la cola offline de Firestore; se descarta porque Firestore offline no expone reintentos con backoff configurables ni estado de cola observable.

**Decision 5: Pantalla P6 reutiliza P4.** En vez de duplicar 388 lineas, P6 pasa a ser un prop de error de P4. Alternativa: dejar el duplicado; se descarta por deuda tecnica.

**Decision 6: RENAPER con estado "verificando".** Mientras no haya credenciales de RENAPER, el flujo de DNI muestra verificacion en curso y reintenta en segundo plano. Alternativa: bloquear el alta; se descarta porque fricciona el onboarding.

## Risks / Trade-offs

- [Costo del plan Blaze] -> Empezar con alertas de presupuesto bajas y monitorear el uso de Functions y Reads.
- [Bloqueo por falta de credenciales de RENAPER] -> Mantener DNI en estado "verificando" y no impedir el alta.
- [Reglas de Firestore restrictivas rompen flujos nuevos] -> Probar cada regla en el emulador antes de desplegar y versionar `firestore.rules`.
- [Latencia de OCR en red 4G] -> Procesar evidencias de forma asincrona y mostrar estado "procesando" (RNF-005).
- [Duplicacion de logica en scripts de verify] -> Los scripts continuaran duplicando logica; documentarlo como deuda conocida.

## Migration Plan

1. Crear proyecto Firebase y habilitar Auth (Google + Phone), Firestore, Storage y Functions.
2. Habilitar Maps, Geocoding y Vision en el mismo proyecto; generar API keys y dejarlas en `.env`.
3. Instalar dependencias y `firebase-tools`; inicializar Functions con TypeScript.
4. Desplegar reglas e indices; probar en el emulador.
5. Reemplazar fuentes de datos en servicios, conservando el fallback.
6. Desplegar Functions y verificar los flujos criticos en staging.

**Rollback:** revertir los cambios de servicios y restaurar el fallback en memoria como fuente principal; las reglas se restauran desde la version anterior del archivo.

## Open Questions

- Cual es el limite diario exacto de denuncias por usuario para el rate limiting (RF-090)?
- El plan de RENAPER esta en tramite o se mantiene "verificando" por tiempo indeterminado?
