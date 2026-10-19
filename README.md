# 🛡️ Atenti - MVP Mobile (React Native + Expo & Firebase)

> Plataforma colaborativa y geolocalizada de prevención de fraudes e incidencias comerciales y virtuales en Argentina.

---

## 📱 Tecnologías Utilizadas
- **Framework Móvil:** Expo SDK 57 + React Native 0.86 (TypeScript).
- **Navegación:** React Navigation (`@react-navigation/native-stack`).
- **Backend & DB:** Firebase Auth (Google Sign-In), Cloud Firestore (persistencia atómica con metadatos de auditoría `uid`, `ip`, `timestamp`), Cloud Storage.
- **Geolocalización:** `react-native-maps` con adaptador multiplataforma (`MapViewWrapper`).
- **Almacenamiento Local Offline:** `@react-native-async-storage/async-storage` para resguardo de borradores.
- **Validación y Auditoría Digital:** Regla de Negocio **RG-07** y servicio de OCR para cotejo de identificadores.

---

## 🚀 Cómo Ejecutar el Proyecto

```bash
# 1. Ingresar al directorio del proyecto
Ingresa al directorio en donde alojaste el proyecto

# 2. Iniciar el servidor de desarrollo de Expo
npm start
# o: npx expo start

# Para abrir en emulador Android:
npm run android

# Para abrir en navegador Web:
npm run web
```

> Para conectar los servicios reales (Firebase Auth/Firestore/Storage, Cloud
> Functions, Google Maps, Geocoding, Cloud Vision y RENAPER) seguí
> [`docs/setup-servicios.md`](docs/setup-servicios.md) y completá el archivo
> `.env` usando `.env.example` como base. Sin `.env`, la app funciona en modo
> demo con el fallback en memoria.

---

## 🗺️ Mapa de Pantallas

| Pantalla | Componente | Descripción |
|---|---|---|
| **P1** | `P1_HomeScreen` | **Buscador Anónimo:** Barra de búsqueda unificada, chips `[Alias] [CBU] [Tel] [Local]`, mapa interactivo ocupando el 70% de la pantalla con pines por veracidad, botón flotante (FAB) circular oscuro con `+` (conduce a P3 o P4 según login). Acceso U0 libre. |
| **P2** | `P2_ReportDetailScreen` | **Detalle de Incidencia:** Título (ej. "Alias: ju.mp"), indicador semáforo visual, barra de veracidad al 80%, mapa de ubicación, 2 recuadros de fotos con evidencias enmascaradas y botón "Denunciar mismo objetivo". |
| **P3** | `P3_LegalAuthScreen` | **Gate Login & DDJJ:** Ícono de candado/usuario, *"Para denunciar necesitás identificarte"*, botón *"Continuar con Google"* y checkbox obligatorio de Declaración Jurada y Términos. |
| **P4** | `P4_CreateReportScreen` | **Formulario Paso 1:** Selectores desplegables (Categoría, Tipo de Identificador), valor, relato, mapa para fijar el pin y panel inferior fijo con *"Credibilidad: 20%"* y botón secundario *"Siguiente"*. Incluye el error de validación de CBU (ex P6, ahora unificado). |
| **P5** | `P5_OCRValidationScreen` | **Evidencias Paso 2:** Botones grandes delineados con `+` ("Subir captura", "Subir comprobante"), aviso *"Validando OCR..."*, panel inferior dinámico con *"Credibilidad: 80%"* y botón principal oscuro *"Enviar Reporte"*. |
| **P7** | `P7_OfflineModal` | **Falla Técnica / Offline:** Pantalla P5 oscurecida con modal flotante: *"No hay conexión. Se guardó un borrador"*, botones *"Reintentar"* y *"Ver Mis Borradores"* integrados con `AsyncStorage`. |
| **P8** | `P8_ConfirmationScreen` | **Confirmación de Envío:** Círculo grande con check de éxito, textos informativos *"Código: AT-2026-XXXXXX"* y *"Credibilidad final: 80%"*, botones *"Seguir estado"* y *"Volver al inicio"*. |
| **P9** | `P9_CredibilityPanelScreen` | **Panel "Mi Credibilidad":** Checklist interactivo de 3 ítems (Cuenta Google verificada, Teléfono verificado +15% con SMS OTP, DNI verificado +10% con documento OCR) y gráfico explicativo de la fórmula matemática RG-07. |
| **P10** | `P10_MisDenunciasScreen` | **Mis Denuncias:** Listado con filtros por estado (Todas, Publicadas, En Disputa, Resueltas) y acceso a la edición. |
| **P11** | `P11_TrackingCodeScreen` | **Consulta Pública:** Consulta del estado por código `AT-2026-XXXXXX` sin iniciar sesión. |
| **P12** | `P12_EditReportScreen` | **Editar Denuncia:** Corrección de datos dentro de las 24hs, con cuenta regresiva y eliminación lógica justificada. |
| **P13** | `P13_SearchResultsScreen` | **Resultados:** Búsqueda con filtros avanzados (tipo, categoría, score mínimo, fechas) y scroll infinito. |
| **P20** | `P20_SettingsScreen` | **Ajustes:** Cierre de sesión, factores de identidad y solicitud de baja de datos (Ley 25.326). |

> La antigua **P6 (Error de Validación)** se unificó en `P4_CreateReportScreen`
> mediante el parámetro `validationError`, eliminando la pantalla duplicada.

---

## 🧮 Regla de Negocio RG-07 (Cálculo de Veracidad)

El score de confiabilidad (0 a 100%) se calcula de acuerdo a tres componentes:
1. **Identidad (Hasta 40 pts):** Google Auth (+15 pts), Teléfono verificado (+15 pts), DNI verificado (+10 pts).
2. **Evidencias & OCR (Hasta 45 pts):** Captura de chat (+20 pts), Comprobante de transferencia (+25 pts), coincidencia exacta de OCR con el objetivo (+5 pts bono).
3. **Corroboración Comunitaria (Hasta 15 pts):** Reportes independientes coincidentes sobre el mismo Alias / CBU / Tel / Local (+5 a +15 pts).

### Semáforo de Veracidad:
- 🟢 **Verde (>= 75%):** Alta veracidad.
- 🟡 **Amarillo (40% - 74%):** Sospechoso / En investigación.
- 🔴 **Rojo (< 40%):** Baja veracidad / preliminar.

---

## 🧪 Verificación Automatizada

Para ejecutar las pruebas del algoritmo y persistencia:
```bash
node scripts/verify-mvp.js
```

