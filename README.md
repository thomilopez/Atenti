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
cd C:\Users\tu_user\.gemini\antigravity\scratch\atenti

# 2. Iniciar el servidor de desarrollo de Expo
npm start
# o: npx expo start

# Para abrir en emulador Android:
npm run android

# Para abrir en navegador Web:
npm run web
```

---

## 🗺️ Mapa de las 9 Pantallas Implementadas

| Pantalla | Componente | Descripción |
|---|---|---|
| **P1** | `P1_HomeScreen` | **Buscador Anónimo:** Barra de búsqueda unificada, chips `[Alias] [CBU] [Tel] [Local]`, mapa interactivo ocupando el 70% de la pantalla con pines por veracidad, botón flotante (FAB) circular oscuro con `+` (conduce a P3 o P4 según login). Acceso U0 libre. |
| **P2** | `P2_ReportDetailScreen` | **Detalle de Incidencia:** Título (ej. "Alias: ju.mp"), indicador semáforo visual, barra de veracidad al 80%, mapa de ubicación, 2 recuadros de fotos con evidencias enmascaradas y botón "Denunciar mismo objetivo". |
| **P3** | `P3_LegalAuthScreen` | **Gate Login & DDJJ:** Ícono de candado/usuario, *"Para denunciar necesitás identificarte"*, botón *"Continuar con Google"* y checkbox obligatorio de Declaración Jurada y Términos. |
| **P4** | `P4_CreateReportScreen` | **Formulario Paso 1:** Selectores desplegables (Categoría, Tipo de Identificador), valor, relato, mapa para fijar el pin y panel inferior fijo con *"Credibilidad: 20%"* y botón secundario *"Siguiente"*. |
| **P5** | `P5_OCRValidationScreen` | **Evidencias Paso 2:** Botones grandes delineados con `+` ("Subir captura", "Subir comprobante"), aviso *"Validando OCR..."*, panel inferior dinámico con *"Credibilidad: 80%"* y botón principal oscuro *"Enviar Reporte"*. |
| **P6** | `P6_ValidationErrorScreen` | **Error de Validación:** Duplica la interfaz de P4, resalta con borde grueso y oscuro el campo de CBU inválido con el texto *"Ingresá un CBU válido. Tus demás datos se guardaron"*. |
| **P7** | `P7_OfflineModal` | **Falla Técnica / Offline:** Pantalla P5 oscurecida con modal flotante: *"No hay conexión. Se guardó un borrador"*, botones *"Reintentar"* y *"Ver Mis Borradores"* integrados con `AsyncStorage`. |
| **P8** | `P8_ConfirmationScreen` | **Confirmación de Envío:** Círculo grande con check de éxito, textos informativos *"Código: AT-2026-XXXX"* y *"Credibilidad final: 80%"*, botones *"Seguir estado"* y *"Volver al inicio"*. |
| **P9** | `P9_CredibilityPanelScreen` | **Panel "Mi Credibilidad":** Checklist interactivo de 3 ítems (Cuenta Google verificada, Teléfono verificado +15% con SMS OTP, DNI verificado +10% con documento OCR) y gráfico explicativo de la fórmula matemática RG-07. |

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

