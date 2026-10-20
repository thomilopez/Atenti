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
