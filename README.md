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
| **P0** | `P0_WelcomeScreen` | **Bienvenida:** Logo + eslogan, animación de entrada y accesos a Buscar, Reportar e Ingresar. Es la pantalla inicial de la app. |
| **P1** | `P1_HomeScreen` | **Inicio search-first:** buscador protagonico, chips `[Alias] [CBU] [Tel] [Local]`, búsquedas recientes, tendencias, skeleton y preview compacto del mapa con "Ver mapa completo". FAB para reportar. |
| **P2** | `P2_ReportDetailScreen` | **Detalle de Incidencia:** título, semáforo, barra de veracidad, desglose, mapa, evidencias enmascaradas, historial de score y botones para impugnar o denunciar el mismo objetivo. |
| **P3** | `P3_LegalAuthScreen` | **Gate Login & DDJJ:** "Continuar con Google" y checkbox obligatorio de Declaración Jurada. |
| **P4** | `P4_CreateReportScreen` | **Formulario Paso 1:** categoría (con ícono/color), tipo de identificador (Alias/CBU/CUIT/Tel/Local), valor, relato (mín. 20), dirección manual + pin y mapa expandible. Incluye validaciones de CBU/CUIT/Tel (ex P6). |
| **P5** | `P5_OCRValidationScreen` | **Evidencias Paso 2:** captura, comprobante o PDF; OCR; límites 5 archivos/10MB y envío del reporte. |
| **P7** | `P7_OfflineModal` | **Offline:** aviso de borrador guardado, reintento y acceso a borradores. |
| **P8** | `P8_ConfirmationScreen` | **Confirmación:** código de seguimiento y credibilidad final. |
| **P9** | `P9_CredibilityPanelScreen` | **Mi Credibilidad:** factores de identidad, desglose y fórmula RG-07. |
| **P10** | `P10_MisDenunciasScreen` | **Mis Denuncias:** filtros por estado y acceso a edición o estado de disputa. |
| **P11** | `P11_TrackingCodeScreen` | **Consulta Pública:** estado por código `AT-2026-XXXXXX`. |
| **P12** | `P12_EditReportScreen` | **Editar Denuncia:** ventana de 24hs y borrado lógico justificado. |
| **P13** | `P13_SearchResultsScreen` | **Resultados:** filtros avanzados y scroll infinito. |
| **P14** | `P14_AdminDashboardScreen` | **Panel Admin:** KPIs, disputas, métricas y accesos a gestión. |
| **P15** | `P15_AdminDisputeScreen` | **Resolver Disputa:** mantener publicada o retirar. |
| **P16** | `P16_AdminCategoriesScreen` | **Categorías:** alta/edición/activación. |
| **P17** | `P17_AdminUsersScreen` | **Usuarios:** suspender cuentas. |
| **P18** | `P18_AdminAuditScreen` | **Auditoría:** uid, email, IP, hash de DDJJ, evidencias e historial. |
| **P19** | `P19_NotificationCenterScreen` | **Notificaciones:** historial, lectura y preferencias. |
| **P20** | `P20_SettingsScreen` | **Ajustes:** cuenta, privacidad, legal, telemetría y baja de datos. |
| **P21** | `P21_ImpugnacionScreen` | **Impugnar:** CUIT/DNI + descargo y take-down. |
| **P22** | `P22_DisputeStatusScreen` | **Estado de Disputa:** countdown 72hs y respuesta. |
| **P23** | `P23_LegalScreen` | **Legal:** términos versionados, privacidad y retención. |
| **P24** | `P24_RightToBeForgottenScreen` | **Derecho al olvido:** solicitud formal. |
| **P25** | `P25_AuditLogScreen` | **Log de Auditoría:** eventos globales (admin). |
| **P26** | `P26_NotificationPreferencesScreen` | **Preferencias:** por tipo de notificación. |
| **P27** | `P27_StoriesFeedScreen` | **Historias de estafas:** feed con búsqueda, filtros, disclaimer y acceso a normas. |
| **P28** | `P28_StoryDetailScreen` | **Detalle de relato:** señales de alerta, identificadores, "me pasó / lo vi", compartir WhatsApp y reportar abuso. |
| **P29** | `P29_CreateStoryScreen` | **Contar una estafa:** título, categoría, víctima/testigo, cómo funciona, señales, identificadores, enlaces y fuente. |
| **P30** | `P30_MyStoriesScreen` | **Mis relatos:** enviados (con estado) y borradores. |
| **P32** | `P32_StoryModerationScreen` | **Moderar relatos (admin):** cola EN_REVISION, aprobar/ocultar. |
| **P33** | `P33_CommunityGuidelinesScreen` | **Normas de la comunidad:** reglas y disclaimer legal. |
| **P31** | `P31_FullMapScreen` | **Mapa completo:** mapa a pantalla completa con calor, radio y "Mi ubicación". |

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

