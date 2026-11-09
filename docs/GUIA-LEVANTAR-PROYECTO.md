# Guía para levantar Atenti

> Rama de trabajo: `fix-casos-de-prueba` (incluye `feat/web-navegacion` + últimos cambios de `main`).

## 1. Requisitos

- Node.js 22 LTS (las Cloud Functions usan `nodejs22`).
- npm 10+.
- Cuenta de Expo/EAS y Firebase con plan Blaze (necesario para Functions, Storage y Vision).
- Android Studio con un emulador, o un dispositivo físico.
- Para probar Google Sign-In y push: **development build**, no Expo Go.

## 2. Clonar y preparar el proyecto

```bash
git clone https://github.com/thomilopez/Atenti.git
cd Atenti
git fetch origin
git switch fix-casos-de-prueba
npm ci
cd functions && npm ci && cd ..
```

## 3. Variables de entorno

```bash
cp .env.example .env
```

Completar en `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION=us-central1
EXPO_PUBLIC_RATE_LIMIT_DAILY=10
```

Opcionales:

- `EXPO_PUBLIC_RENAPER_ENABLED=true` + endpoint/key solo si hay credenciales.
- `EXPO_PUBLIC_SENTRY_DSN` cuando se integre Sentry.
- `EXPO_PUBLIC_ADMIN_EMAILS` como fallback temporal de admin.

Importante:

- `.env` no se commitea.
- `google-services.json` debe estar en la raíz para Android; tampoco se commitea.
- La API key de Maps ya no está hardcodeada: sale de `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` y `app.config.js`. Si venías usando el `android/` nativo, corré `npx expo prebuild --clean` o un development build nuevo para regenerar el manifest.

Verificar configuración:

```bash
npm run check-env
```

## 4. Firebase

1. Habilitar Authentication: Google, Phone (si se probará OTP) y Anonymous (fallback de Expo Go).
2. Crear Firestore y Storage.
3. Aplicar reglas e índices:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

> Las reglas están en **modo prueba**: permiten escritura a usuarios autenticados. No son reglas de producción. Está documentado como deuda.

4. Desplegar Functions:

```bash
cd functions
npm run build
firebase deploy --only functions
cd ..
```

Functions incluidas: OCR, OTP, rate limit, spam, push, escalación, `eliminarCuenta` y `setRolUsuario`.

## 5. Correr la app

```bash
npm start
```

Atajos:

```bash
npm run android      # build nativo Android
npm run ios          # build nativo iOS (macOS)
npm run web          # Expo Web
```

Para development build:

```bash
eas build --profile development --platform android
# instalar el APK y luego:
npx expo start --dev-client
```

## 6. Verificaciones

```bash
npm run typecheck
npm test
npm run verify:all
cd functions && npm run build
```

Al cierre de esta rama:

- `typecheck`: OK.
- `npm test`: 9 tests OK.
- `verify:all`: OK.
- `functions build`: OK.

## 7. Problemas comunes

- **Google Sign-In no abre el selector**: estás en Expo Go o falta SHA-1/webClientId. Usá development build y configurá el SHA-1 en Firebase.
- **El mapa aparece gris**: falta `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, no se regeneró el manifest, o la key no tiene restricciones correctas.
- **Push no llega**: Expo Go no soporta push; además hay que desplegar Functions y tener `projectId` de EAS.
- **“No se pudo guardar”**: revisá Functions desplegadas, reglas y conexión. Ahora los errores ya no se silencian.
- **Error de Metro**: borrá caché con `npx expo start -c`.
- **Functions fallan al deployar**: verificá Node 22 y plan Blaze.

## 8. Flujo de trabajo

- Rama actual: `fix-casos-de-prueba`.
- Change de OpenSpec: `openspec/changes/fix-casos-de-prueba`.
- Ver progreso: `openspec list` o `openspec status --change fix-casos-de-prueba`.
- Validar artefactos: `openspec validate fix-casos-de-prueba --strict`.
- Cuando termine la revisión: `/opsx:archive`.
