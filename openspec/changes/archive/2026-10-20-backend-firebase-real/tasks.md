# Tasks

## 1. Entorno y proyecto Firebase

- [x] 1.1 Crear `services/env.ts` que cargue y valide las variables de entorno requeridas; verificar que la app falla al iniciar si falta una variable con `node scripts/check-env.js`
- [x] 1.2 Definir `.env.example` con todas las claves de Firebase, Maps, Geocoding y Vision; verificar que el archivo existe y no contiene secretos reales
- [x] 1.3 Actualizar `package.json` con `expo-location`, `expo-image-picker`, `@react-native-community/netinfo` y `react-native-maps`; verificar con `npm install` sin errores
- [x] 1.4 Reemplazar el `firebaseConfig` hardcodeado de `services/firebase.ts` por los valores de `env.ts`; verificar que la app inicializa Firebase con las variables en modo demo

## 2. Autenticacion real

- [x] 2.1 Crear `services/authService.ts` con `signInWithGoogle`, `verifyPhone` y `verifyDNI`; verificar con pruebas manuales del flujo en P3_LegalAuthScreen
- [x] 2.2 Reemplazar `loginWithGoogle`, `verifyPhone` y `verifyDNI` de `AuthContext.tsx` por llamadas reales a `authService`; verificar que el login real deja `googleAuth = true`
- [x] 2.3 Crear `services/ddjjService.ts` que genere el hash de la DDJJ con IP y timestamp; verificar el hash SHA-256 en una prueba unitaria
- [x] 2.4 Crear P20_Settings con cierre de sesion y solicitud de borrado; verificar que el borrado pide confirmacion y registra la solicitud

## 3. Persistencia Firestore real

- [x] 3.1 Adaptar `getIncidents` de `services/firebase.ts` para leer de Firestore como fuente principal y usar el fallback solo en error; verificar que el listado carga sin semilla en memoria
- [x] 3.2 Adaptar `registrarDenuncia` para persistir en Firestore y mantener la escritura atomica de 6 colecciones; verificar con el emulador que se crean todos los documentos
- [x] 3.3 Crear `services/editWindow.ts` con la validacion de 24hs y cuenta regresiva; verificar que fuera de la ventana bloquea la edicion
- [x] 3.4 Crear `services/softDeleteService.ts` con borrado logico y justificacion; verificar que la denuncia desaparece del listado publico
- [x] 3.5 Unificar P6_ValidationErrorScreen en P4_CreateReportScreen mediante un prop de error; verificar que el borde y el texto de error se muestran segun el prop

## 4. Cloud Functions

- [x] 4.1 Inicializar `functions/` con TypeScript y crear la function `processEvidenceOCR` con Cloud Vision; verificar con una imagen de prueba que devuelve el texto detectado
- [x] 4.2 Crear `services/cloudFunctions.ts` con el cliente de OCR; verificar que P5_OCRValidationScreen muestra el resultado real
- [x] 4.3 Crear la function de rate limiting por usuario y dia; verificar que al superar el limite se bloquea el envio
- [x] 4.4 Crear el detector de spam por contenido similar; verificar que un duplicado reciente dispara la alerta previa
- [x] 4.5 Agregar validacion de checksum de CBU y normalizacion E.164 en `services/normalize.ts`; verificar con los casos de `scripts/verify-block-a.js`

## 5. Offline-first

- [x] 5.1 Agregar autosave cada 10s en `ReportFlowContext.tsx`; verificar que el borrador se persiste sin intervencion del usuario
- [x] 5.2 Integrar `@react-native-community/netinfo` para detectar conectividad y mostrar el banner offline; verificar el banner al activar modo avion
- [x] 5.3 Crear `services/syncQueue.ts` con backoff exponencial; verificar que los borradores pendientes se sincronizan al recuperar red
- [x] 5.4 Agregar el aviso permanente de "borrador no enviado"; verificar que aparece en la pantalla de borradores

## 6. Consulta publica

- [x] 6.1 Crear P10_MisDenunciasScreen con filtros por estado; verificar que el listado filtra correctamente
- [x] 6.2 Crear P11_TrackingCodeScreen para consulta publica por codigo; verificar que un codigo valido muestra la ficha y uno invalido muestra error
- [x] 6.3 Crear `services/fuzzySearch.ts` para busqueda tolerante; verificar que un error de tipeo sugiere la coincidencia cercana
- [x] 6.4 Agregar paginacion y filtros avanzados a la busqueda; verificar que el scroll infinito carga mas resultados
- [x] 6.5 Verificar que las denuncias EN_DISPUTA no aparecen en resultados publicos

## 7. Reglas, indices y verificacion

- [x] 7.1 Actualizar `firestore.rules` con reglas por rol (U0/U1/U3/U4) y estado; verificar con el emulador que un anonimo no puede escribir
- [x] 7.2 Actualizar `firestore.indexes.json` con los indices compuestos necesarios; verificar que el deploy de indices es exitoso
- [x] 7.3 Ejecutar `npm run verify:all` y confirmar que todas las pruebas pasan; verificar que los scripts corren sin errores
- [x] 7.4 Documentar el alta de servicios externos en `docs/setup-servicios.md` (Firebase, Maps, Vision, RENAPER); verificar que los pasos descritos se pueden seguir en orden
