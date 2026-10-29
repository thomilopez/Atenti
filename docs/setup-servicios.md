# Guía de alta de servicios externos — Atenti

Esta guía explica, paso a paso, cómo crear y configurar cada servicio que Atenti
necesita para dejar de funcionar en modo demo. Seguí el orden: hay dependencias
entre los pasos.

> **Regla de oro:** nunca subas el archivo `.env` con valores reales al repo.
> Usá `.env.example` como plantilla.

---

## 0. Requisitos previos

- Cuenta de Google.
- Una tarjeta de crédito o débito (Firebase Blaze y Google Cloud la piden, aunque
  el consumo inicial suele quedar dentro del free tier).
- Node.js 20+ y `npm`.
- `firebase-tools` instalado: `npm install -g firebase-tools`.
- `eas-cli` para builds: `npm install -g eas-cli` (se usa en el cambio de
  `legal-infraestructura`).

---

## 1. Crear el proyecto de Firebase

1. Entrá a <https://console.firebase.google.com/>.
2. **Agregar proyecto** → nombre `atenti-prod` (o el que prefieras).
3. Desactivá Google Analytics por ahora (se puede activar después).
4. Crear proyecto.

> Un solo proyecto de Google Cloud va a alojar Firebase, Maps, Geocoding y Vision
> (decisión de diseño: una sola billing account y un solo `.env`).

---

## 2. Habilitar Authentication

1. Firebase Console → **Authentication** → **Comenzar**.
2. Pestaña **Sign-in method**:
   - **Google**: habilitar, elegir email de soporte y guardar.
   - **Phone**: habilitar. Agregá números de prueba para desarrollo
     (ej. `+54 9 11 0000-0000` con código `123456`).
3. En **Settings → Authorized domains**, verificá que esté `atenti-prod.firebaseapp.com`.

### Obtener el `webClientId` de Google

1. Google Cloud Console → **APIs & Services → Credentials**.
2. Copiá el **OAuth 2.0 Client ID** de tipo *Web application*.
3. Ese valor va en `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

---

## 3. Crear Firestore

1. Firebase Console → **Firestore Database** → **Create database**.
2. Modo **producción**.
3. Región: `southamerica-east1` (São Paulo, la más cercana a Argentina).
4. Después desplegamos las reglas del repo (paso 8).

---

## 4. Habilitar Cloud Storage

1. Firebase Console → **Storage** → **Get started**.
2. Modo **producción**.
3. Misma región.

---

## 5. Pasar a plan Blaze (necesario para Functions)

1. Firebase Console → engranaje → **Usage and billing**.
2. **Modify plan** → **Blaze**.
3. Configurá una **alert budget** baja al principio (ej. USD 5/mes) y monitoreá.

---

## 6. Google Cloud: Maps, Geocoding y Vision

1. Entrá a <https://console.cloud.google.com/> y seleccioná el **mismo proyecto**
   que creaste para Firebase.
2. **APIs & Services → Library** y habilitá:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Maps JavaScript API** (para web)
   - **Geocoding API** (geocodificación inversa)
   - **Cloud Vision API**
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Restringí la key:
   - *Application restrictions*: Android apps + iOS apps + HTTP referrers.
   - *API restrictions*: solo las APIs habilitadas arriba.
5. Copiá la key en `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.

### Android: huella SHA-1

1. Generá la huella:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore \
     -alias androiddebugkey -storepass android -keypass android
   ```
2. Firebase Console → **Project settings → Your apps → Android** → agregá el
   SHA-1.
3. Descargá `google-services.json` y colocalo en `android/app/` cuando generes el
   proyecto nativo (`npx expo prebuild`).

> `react-native-maps` usa la key de Maps. En Expo Go podés ver el mapa de demo;
> para Google Maps real necesitás un **development build** (`npx expo run:android`
> o un build de EAS).

---

## 7. Cloud Functions (OCR, OTP, rate limiting, spam)

1. Iniciá sesión en Firebase:
   ```bash
   firebase login
   ```
2. Verificá el proyecto activo:
   ```bash
   firebase use --add
   ```
3. Instalá dependencias y compilá:
   ```bash
   cd functions
   npm install
   npm run build
   ```
4. Desplegá:
   ```bash
   cd ..
   firebase deploy --only functions
   ```
5. Copiá la región usada (por defecto `us-central1`) en
   `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION`.

### Variables de entorno de Functions

El límite diario de denuncias (RF-090) se configura en el backend:

```bash
firebase functions:config:set rate_limit.daily=10
```

O definí `RATE_LIMIT_DAILY` en el entorno de despliegue.

### Permisos de Cloud Vision

La cuenta de servicio de Functions necesita el rol **Cloud Vision API User**.
Google Cloud Console → **IAM** → buscá la service account de App Engine/Functions
y asigná ese rol.

---

## 8. Desplegar reglas e índices

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Si preferís probar antes en local:

```bash
firebase emulators:start --only firestore,functions,auth
```

Las reglas del repo ya definen roles U0/U1/U3/U4 y la visibilidad por estado.

---

## 9. RENAPER (verificación de DNI)

1. El acceso oficial se solicita en <https://www.argentina.gob.ar/renaper>
   (formulario institucional; la aprobación puede demorar días).
2. Mientras tanto, **dejá `EXPO_PUBLIC_RENAPER_ENABLED=false`**. El DNI queda en
   estado **"Verificando"** y la app reintenta en segundo plano, sin bloquear el
   alta (decisión de diseño).
3. Cuando tengas credenciales, completá:
   ```env
   EXPO_PUBLIC_RENAPER_ENABLED=true
   EXPO_PUBLIC_RENAPER_ENDPOINT=https://...
   EXPO_PUBLIC_RENAPER_API_KEY=...
   ```
   El provider real está en `src/services/renaperProvider.ts`.

---

## 10. Configurar el archivo `.env`

1. Copiá la plantilla:
   ```bash
   cp .env.example .env
   ```
2. Completá los valores de Firebase (paso 11), Maps, Functions, RENAPER y
   `EXPO_PUBLIC_ADMIN_EMAILS` (lista separada por comas de cuentas con acceso al
   panel de administración).
3. Verificá que no falte nada:
   ```bash
   node scripts/check-env.js
   ```
   Si falta una variable, el script sale con código 1 y te dice cuál.

---

## 11. Obtener la configuración web de Firebase

1. Firebase Console → **Project settings → General → Your apps**.
2. **Agregar app → Web** (`</>`), nombre `atenti-web`.
3. Copiá el objeto `firebaseConfig` y mapealo al `.env`:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```

---

## 12. Correr la app

```bash
npm install
npx expo start
```

- Con `.env` completo, la app usa Firebase y Functions reales.
- Sin `.env`, arranca en **modo demo** con el fallback en memoria (no rompe la
  navegación ni los flujos).

Para un build nativo con Google Maps y Google Sign-In:

```bash
npx expo prebuild
npx expo run:android   # o run:ios
```

---

## 13. Verificación

```bash
npm run verify:all
```

Debe pasar:
- `verify-mvp.js` — RG-07 y flujo.
- `verify-block-a.js` — idempotencia, estados, normalización, checksum CBU/E.164.
- `verify-backend.js` — archivos, fuzzy search, ventana 24hs, backoff, hash DDJJ.

---

## 14. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Missing or insufficient permissions` | Reglas no desplegadas o rol mal seteado | `firebase deploy --only firestore:rules`; seteá `role` en el token |
| `auth/operation-not-allowed` | Proveedor no habilitado | Habilitá Google/Phone en Authentication |
| `functions/internal` en OCR | Vision API no habilitada o sin permisos | Habilitá la API y asigná el rol a la service account |
| Google Sign-In no abre | Falta configurar SHA-1 / URL scheme | Completá paso 6 y usá un development build |
| Mapa gris en Android | Falta `google-services.json` o key restringida | Agregá el archivo y revisá restricciones de la key |
| DNI queda "Verificando" | RENAPER no configurado | Es el comportamiento esperado hasta tener credenciales |

---

## 15. Administración y categorías

1. Definí las cuentas administradoras en `.env`:
   ```env
   EXPO_PUBLIC_ADMIN_EMAILS=admin@atenti.com,moderador@atenti.com
   ```
   En modo demo (sin Firebase) el panel admin queda abierto para poder probar.
2. El catálogo de categorías se siembra automáticamente la primera vez que se abre
   el panel o el formulario. También podés sembrarlo desde Firestore creando la
   colección `categorias` con documentos:
   ```json
   { "nombre": "Estafa Bancaria", "requiereUbicacion": false, "activa": true }
   ```
3. Desde **Ajustes → Panel de administración** podés:
   - Resolver disputas (mantener publicada o retirar).
   - Ver la auditoría completa de una denuncia.
   - Crear, editar y activar/desactivar categorías.
   - Suspender usuarios.
   - Exportar el dataset anonimizado (CSV).
4. Las reglas de Firestore ya permiten escritura de `categorias` solo a admin y
   protegen `usuarios`, `eliminaciones` y `solicitudes_baja`.

> Los roles formales U0/U1/U3/U4 (RF-015) siguen pendientes: hoy el acceso se
> controla por `EXPO_PUBLIC_ADMIN_EMAILS` en el cliente. Cuando se implementen los
> custom claims, reemplazar `isAdmin` en `AuthContext` por el claim del token.

---

## 16. Seguridad y costos

- **Nunca** loguees ni commitees claves. `.env` está en `.gitignore`.
- Restringí las API keys por aplicación y por API.
- Configurá alertas de presupuesto en Google Cloud.
- Revisá periódicamente el uso de Cloud Vision y Functions (son los que más
  consumen).

---

## 17. Mapas reales, ubicación y evidencias

### Google Maps con development build

`react-native-maps` usa el proveedor nativo. **Expo Go no renderiza Google Maps
real**; para verlo necesitás un development build:

1. Completá `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` en `.env`.
2. Reemplazá los placeholders de `app.json`:
   ```json
   "android": { "config": { "googleMaps": { "apiKey": "TU_API_KEY" } } },
   "ios": { "config": { "googleMapsApiKey": "TU_API_KEY" } }
   ```
3. Generá el proyecto nativo y corré:
   ```bash
   npx expo prebuild
   npx expo run:android   # o run:ios
   ```
4. En Android, asociá la huella SHA-1 (paso 6) para que la key funcione.

> En web/Expo Go se usa el fallback visual del mapa (`MapViewWrapper`), así que la
> navegación y los pines siguen funcionando.

### Ubicación

`expo-location` pide permiso en tiempo de ejecución. Los textos de permiso ya
están en `app.json` (`NSLocationWhenInUseUsageDescription`). Si el usuario niega
el permiso, la app mantiene la ubicación por defecto y avisa.

### Cloud Storage para evidencias

1. Habilitá **Storage** (paso 4).
2. Desplegá las reglas:
   ```bash
   firebase deploy --only storage
   ```
   `storage.rules` limita a 10MB y a JPG/PNG/PDF, y exige autenticación.
3. Las evidencias se suben a `evidencias/<timestamp>_<archivo>`. Sin Firebase
   configurado se conserva la URI local (modo demo).

### Límites de evidencias

- Máximo **5 archivos** por denuncia.
- Máximo **10MB** por archivo.
- Formatos: **JPG, PNG y PDF**.
- La vista pública aplica blur; el administrador ve el original en la auditoría.

---

## 18. Impugnaciones y escalación

1. El impugnante entra desde **P2 → "Impugnar esta denuncia"**, ingresa CUIT/DNI
   y descargo. Al confirmar:
   - La denuncia pasa a **EN_DISPUTA** y sale del buscador público.
   - Se registra en la colección `impugnaciones`.
   - El denunciante recibe una notificación in-app (colección `notificaciones`).
2. El denunciante ve el caso en **Mis Denuncias → estado de disputa (P22)** con la
   cuenta regresiva de **72hs** y puede responder.
3. Al vencer el plazo sin resolución, la Cloud Function programada
   `escalarImpugnaciones` (cada 15 minutos) marca la impugnación como escalada y
   notifica a moderación.
4. Desde el **Panel de administración (P15)** el moderador mantiene o retira la
   denuncia; la impugnación se cierra y se notifica al denunciante.

Desplegar la función programada:

```bash
firebase deploy --only functions
```

> Las notificaciones son in-app por ahora. El push y el centro completo se
> implementan en el cambio `notificaciones`.

---

## 19. Legal y trazabilidad

1. **Hash de la DDJJ (RF-082):** al enviar una denuncia se genera un SHA-256 con
   uid, IP y timestamp, y se guarda en `audit.ddjjHash`. Se ve en la auditoría
   del administrador (P18).
2. **Términos versionados (RF-083):** `src/services/termsService.ts` define las
   versiones. La pantalla **Ajustes → Términos, privacidad y retención** permite
   ver cada versión y su fecha.
3. **Privacidad y retención (RF-084/RF-085):** la misma pantalla muestra la Ley
   25.326 y el plazo de retención de datos.
4. **Derecho al olvido (RF-086):** botón dentro de la pantalla legal; registra la
   solicitud en `solicitudes_baja` con su motivo.
5. **Log de auditoría (RF-081):** Panel de administración → **Log de auditoría**.
   En demo se deriva de las denuncias; con Firebase lee `audit_logs`.

Colecciones: `audit_logs`, `solicitudes_baja`, `terminos_aceptados`.

---

## 20. Observabilidad, EAS y CI

### Sentry (opcional)

El adaptador `src/services/observability.ts` captura errores globales. Sin DSN
registra en local; para conectarlo:

1. Creá un proyecto en <https://sentry.io>.
2. Agregá el DSN en `.env`:
   ```env
   EXPO_PUBLIC_SENTRY_DSN=https://...
   ```
3. Cuando quieras enviar los eventos, instalá el SDK y llamalo dentro de
   `inicializarObservabilidad()`.

### EAS Build

`eas.json` define tres perfiles (`development`, `preview`, `production`):

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

### CI/CD

`.github/workflows/ci.yml` corre en cada push/PR:
`npm ci` → `npm run typecheck` → `npm run verify:all`.

### E2E con Maestro

```bash
maestro test .maestro/flujo-critico.yaml
```

Requiere un development build instalado en un emulador o dispositivo.

### Analytics

En **Ajustes → Métricas de uso anónimas** el usuario da o revoca el
consentimiento. Sin consentimiento no se registra ningún evento.

---

## 21. Notificaciones push

1. **Project ID de EAS (requerido para el token):**
   ```bash
   npx eas init
   ```
   Copiá el `projectId` en `app.json`:
   ```json
   "extra": { "eas": { "projectId": "TU_PROJECT_ID" } }
   ```
   Sin projectId la app omite el registro del token y sigue funcionando.
2. **Development build:** las notificaciones push remotas no funcionan en Expo
   Go en SDK 57. Generá un build:
   ```bash
   npx expo prebuild
   npx expo run:android
   ```
   El token se registra al iniciar sesión y se guarda en `push_tokens`.
3. **Cloud Function de envío:** al crearse un documento en `notificaciones`, la
   function `enviarPushNotificacion` consulta `notification_prefs` y envía el push
   con Expo Push (`https://exp.host/--/api/v2/push/send`).
   ```bash
   firebase deploy --only functions
   ```
4. **Preferencias:** el usuario las gestiona en
   **Ajustes → Preferencias de notificaciones** (estado, corroboración,
   resolución). El centro completo está en **Notificaciones** (campana en P1).
5. **Tipos de aviso:** cambio de estado (PUBLICADA, EN_DISPUTA, RESUELTA),
   corroboración de un objetivo y resolución de disputa.

> Los avisos in-app se guardan siempre, aunque el push esté deshabilitado o falle.

---

## 22. Cómo obtener cada valor de `.env`

Creá el archivo en la raíz del proyecto copiando la plantilla:

```bash
cp .env.example .env
```

> `.env` ya está en `.gitignore`. **No lo commitees** ni compartas sus valores.

### 22.1 Resumen rápido

| Variable | De dónde sale | Obligatoria |
|---|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase → Project settings → Your apps → Web | Sí (backend real) |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | mismo `firebaseConfig` | Sí |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | mismo `firebaseConfig` | Sí |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | mismo `firebaseConfig` | Sí |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | mismo `firebaseConfig` | Sí |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | mismo `firebaseConfig` | Sí |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud → Credentials | Sí (mapa real) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud → OAuth 2.0 Client IDs (Web) | Para Google Sign-In |
| `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION` | Región donde desplegaste Functions | Opcional (default `us-central1`) |
| `EXPO_PUBLIC_CLOUD_FUNCTIONS_BASE_URL` | Solo si usás HTTP directo | Opcional |
| `EXPO_PUBLIC_RENAPER_ENABLED` | `true` cuando tengas credenciales | Opcional |
| `EXPO_PUBLIC_RENAPER_ENDPOINT` | Te lo da RENAPER | Con RENAPER |
| `EXPO_PUBLIC_RENAPER_API_KEY` | Te lo da RENAPER | Con RENAPER |
| `EXPO_PUBLIC_RATE_LIMIT_DAILY` | Política del proyecto | Opcional (default `10`) |
| `EXPO_PUBLIC_ADMIN_EMAILS` | Tus cuentas de Google admin | Opcional |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry → Client Keys | Opcional |

**Sin ninguna variable** la app funciona en **modo demo** (fallback en memoria).
**Para el backend real** alcanza con las 6 de Firebase + la de Maps.

### 22.2 Firebase (6 variables)

1. Entrá a <https://console.firebase.google.com/> y abrí tu proyecto.
2. Engranaje → **Project settings** → pestaña **General**.
3. Bajá hasta **Your apps**. Si no hay ninguna, tocá **Add app → Web**
   (`</>`), poné un nombre (ej. `atenti-web`) y registrá.
4. Aparece un bloque `firebaseConfig`. Copiá cada campo a tu `.env`:

```js
const firebaseConfig = {
  apiKey: "AIza...",                        // EXPO_PUBLIC_FIREBASE_API_KEY
  authDomain: "atenti-prod.firebaseapp.com",// EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "atenti-prod",                 // EXPO_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "atenti-prod.appspot.com", // EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "1234567890",          // EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:1234567890:web:abcdef123456",   // EXPO_PUBLIC_FIREBASE_APP_ID
};
```

> Estos valores son **identificadores públicos del cliente**, no secretos. La
> seguridad real la dan las reglas de Firestore/Storage y Firebase Auth.

### 22.3 Google Maps API key

1. Entrá a <https://console.cloud.google.com/> y seleccioná **el mismo proyecto**
   que el de Firebase.
2. **APIs & Services → Library** y habilitá:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Maps JavaScript API (web)
   - Geocoding API
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Copiá la key a `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. Recomendado: editá la key y restringila por aplicación y por API.
6. Para Android, agregá la huella **SHA-1** en Firebase → Project settings →
   Your apps → Android (necesario para Google Maps y Google Sign-In).

### 22.4 Google Web Client ID (Google Sign-In)

1. Google Cloud Console → **APIs & Services → Credentials**.
2. En **OAuth 2.0 Client IDs**, buscá el cliente de tipo **Web application**
   (Firebase lo crea solo cuando habilitás Google en Authentication).
   Si no existe, creá uno de tipo **Web application**.
3. Copiá el **Client ID** (termina en `.apps.googleusercontent.com`) a
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
4. Verificá que Google esté habilitado en Firebase → Authentication → Sign-in
   method.

### 22.5 Cloud Functions (región y URL)

- `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION`: la región del deploy. Si no la
  cambiaste, es `us-central1`. La app usa el SDK de Firebase
  (`httpsCallable`), así que **no necesitás la URL**.
- `EXPO_PUBLIC_CLOUD_FUNCTIONS_BASE_URL`: solo si llamás functions por HTTP
  directo. Formato: `https://<region>-<projectId>.cloudfunctions.net`.
  Si usás el SDK, dejalo vacío.

### 22.6 RENAPER (DNI)

1. Mientras no tengas acceso, dejá:
   ```env
   EXPO_PUBLIC_RENAPER_ENABLED=false
   ```
   El DNI queda en estado **"Verificando"** y la app sigue funcionando.
2. Cuando RENAPER te habilite el servicio, te entrega un **endpoint** y una
   **API key**. Completá:
   ```env
   EXPO_PUBLIC_RENAPER_ENABLED=true
   EXPO_PUBLIC_RENAPER_ENDPOINT=https://el-endpoint-que-te-dieron
   EXPO_PUBLIC_RENAPER_API_KEY=la-clave-que-te-dieron
   ```

### 22.7 Rate limit y administración

- `EXPO_PUBLIC_RATE_LIMIT_DAILY`: cuántas denuncias por usuario por día. Por
  defecto `10`. Tiene que coincidir con `RATE_LIMIT_DAILY` de Functions.
- `EXPO_PUBLIC_ADMIN_EMAILS`: emails de las cuentas que pueden ver el panel de
  administración, separados por coma. Usá el mismo email con el que iniciás
  sesión con Google. Ejemplo:
  ```env
  EXPO_PUBLIC_ADMIN_EMAILS=admin@atenti.com,moderador@atenti.com
  ```

### 22.8 Sentry (opcional)

1. Entrá a <https://sentry.io> y creá un proyecto (React Native / Expo).
2. **Settings → Client Keys (DSN)** y copiá el DSN:
   ```
   https://<clave>@o<org>.ingest.sentry.io/<proyecto>
   ```
3. Pegalo en `EXPO_PUBLIC_SENTRY_DSN`. Sin DSN, la app registra errores en local.

### 22.9 Project ID de EAS (no va en `.env`)

El token de push necesita el `projectId` de EAS, que va en `app.json`, no en
`.env`:

```bash
npx eas init
```

Copiá el `projectId` que te da en:

```json
"extra": { "eas": { "projectId": "TU_PROJECT_ID" } }
```

### 22.10 Verificar que quedó bien

```bash
node scripts/check-env.js
```

Si falta una variable obligatoria, el script te dice cuál. Después:

```bash
npm run verify:all
```

---

## 23. CUIT, categorías y dirección

### CUIT
- Se acepta como tipo de identificador (chips y autocompletado).
- Normalización a **11 dígitos** y validación con **checksum AFIP** y prefijos
  conocidos (`20`, `23`, `24`, `27`, `30`, `33`, `34`).
- En la vista pública se enmascara: `20-******-*`.
- Es buscable y corroborable; el OCR de la Cloud Function extrae CUIT con o sin
  guiones y lo compara con el denunciado.

### Categorías
- El catálogo por defecto incluye las categorías ampliadas (venta fraudulenta,
  falsa inversión, préstamo, soporte falso, falso empleo, romance scam,
  suscripción, criptomonedas, comercio que no entrega, cobro indebido y
  suplantación).
- Cada categoría tiene **ícono y color**; se editan desde
  **Panel admin → Categorías**.
- La siembra **solo crea las categorías faltantes**, así no pisa cambios del
  administrador.

### Dirección y mapa
- En P4 se puede escribir la dirección (calle, número, localidad, provincia, CP,
  referencia) y buscarla con geocodificación directa (`expo-location`).
- El pin y la dirección se mantienen sincronizados: mover el pin actualiza la
  dirección.
- **Agrandar mapa** abre un modal a pantalla completa con buscador interno.
- Sin red, la dirección se guarda como texto y se marca **“sin verificar”**;
  para categorías con ubicación obligatoria se exige pin o dirección verificada.
- En la vista pública se muestra una **zona aproximada**, no la dirección exacta.

> La geocodificación usa el geocodificador nativo del dispositivo (no requiere
> otra API key). En web puede no estar disponible: se usa la dirección manual.
