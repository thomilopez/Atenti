# 🛡️ Atenti - Red Argentina de Prevención de Fraudes e Incidencias

**Código de Referencia:** [https://github.com/thomilopez/Atenti](https://github.com/thomilopez/Atenti)  
**Repositorio Remoto (.git):** `https://github.com/thomilopez/Atenti.git`

---

## 👥 Cuentas y Accesos de Prueba Preconfigurados

Para ingresar y evaluar la aplicación puedes utilizar cualquiera de estos correos de prueba preconfigurados en el sistema (el flujo institucional y de auditoría está simplificado para el prototipo):

* 👤 **Perfil de Ciudadano / Denunciante (Para crear reportes y consultar el mapa):**
  * **Correo:** `denunciante@atenti.com.ar` *(o mediante Google Sign-In directo)*
* 👤👤 **Perfil de Operador / Gestión (Auditoría y Validación RG-07):**
  * **Correo:** `operador@atenti.com.ar`

> **Nota:** El sistema está configurado para permitir el acceso con cualquier correo con formato válido. Si ingresas un correo nuevo que no está en la lista, el sistema creará automáticamente un usuario con perfil de Denunciante y calculará su factor de identidad base conforme a la regla RG-07.

---

## 📖 Guía Paso a Paso: Configuración y Control de Versiones

### Paso 1: Repositorio Remoto en GitHub
El proyecto se encuentra alojado y versionado en la plataforma GitHub:
* **URL:** `https://github.com/thomilopez/Atenti`
* **Rama principal:** `main`

### Paso 2: Estructura de Directorios Local y Ejecución
Ejecuta tu terminal de preferencia (PowerShell, Símbolo del Sistema o la terminal integrada de VS Code) para iniciar el entorno de desarrollo:

```bash
# 1. Navega al directorio del proyecto
cd C:\Users\agula\.gemini\antigravity\scratch\atenti

# 2. Instalar dependencias (en caso de clonar por primera vez)
npm install

# 3. Iniciar el servidor de desarrollo de Expo
npm.cmd start
# (o: npx.cmd expo start)

# Para previsualizar en navegador web: presiona 'w'
# Para ejecutar en Android (emulador o Expo Go): presiona 'a'
```

### Paso 3: Inicialización del Control de Versiones
El proyecto cuenta con Git habilitado en su raíz para el rastreo y auditoría de cambios:
```bash
git init
```

### Paso 4: Sincronización con el Backend Remoto (GitHub)
Conexión establecida con el repositorio remoto de GitHub:
```bash
git remote add origin https://github.com/thomilopez/Atenti.git
```

### Paso 5: Ciclo de Persistencia de Datos (Add, Commit y Push)
Para cada actualización de código o documentación que desees sincronizar con la nube, aplica el siguiente ciclo de comandos:

1. **Indexación de modificaciones:**
   ```bash
   git add .
   ```
2. **Generación del Commit (Snapshot):**
   ```bash
   git commit -m "feat: actualizacion de modulos y pantallas del MVP Atenti"
   ```
3. **Definición de la rama principal:**
   ```bash
   git branch -M main
   ```
4. **Despliegue de datos (Push) a GitHub:**
   ```bash
   git push origin main
   ```

---

## 🏗️ Especificación Técnica y Arquitectura del MVP

### 1. Arquitectura y Stack Tecnológico
* **Frontend Mobile-First:** Desarrollado en **React Native + Expo SDK 57 (TypeScript)**, utilizando diseño modular con `StyleSheet` y componentes adaptados a la guía de estilos de Figma.
* **Navegación:** Implementada con `@react-navigation/native-stack` conectando de forma fluida y tipada las 9 pantallas del flujo.
* **Backend y Persistencia en la Nube:** Integración con **Firebase Auth** (Google Sign-In), **Cloud Firestore** para persistencia atómica de incidencias con metadatos de auditoría (`UID`, `IP` de origen, plataforma y `serverTimestamp`), y **Cloud Storage** para almacenamiento de evidencias probatorias.
* **Geolocalización Multiplataforma:** Uso de `react-native-maps` para dispositivos móviles nativos y un adaptador georreferenciado (`MapViewWrapper`) para ejecución fluida en navegadores web.

### 2. Resiliencia de Datos (Estrategia Offline-First)
* **Gestión de Contingencia Local:** Si ocurre una pérdida de conectividad o falla de red al enviar el reporte en el Paso 2 (P5), el sistema activa automáticamente la **Pantalla P7 (OfflineModal)** y resguarda la denuncia completa (categoría, identificador, relato, coordenadas y fotos) como un **Borrador Local** mediante `@react-native-async-storage/async-storage`.
* **Idempotencia y Trazabilidad:** Cada denuncia genera un identificador único y un código de seguimiento con formato legal **`AT-2026-XXXX`** antes de persistirse, evitando duplicados ante reconexiones inestables.
* **Recuperación:** El usuario puede inspeccionar, retomar o eliminar sus borradores en cualquier momento desde el modal central de borradores.

### 3. Vistas y Flujo de las 9 Pantallas (Figma Reference)

| Pantalla | Módulo | Descripción y Casos de Uso |
|---|---|---|
| **P1** | `P1_HomeScreen` | **Buscador Anónimo (Home):** Barra de búsqueda superior, 4 filtros en chips `[Alias] [CBU] [Tel] [Local]`, visualización del mapa en el 70% de pantalla con pines según veracidad y botón flotante (FAB) circular oscuro con `+`. Acceso anónimo U0. |
| **P2** | `P2_ReportDetailScreen` | **Detalle de Incidencia:** Título (ej. *"Alias: ju.mp"*), semáforo visual (círculo gris oscuro), **Barra de Veracidad al 80%** en verde vibrante (`#00E676`), mapa de ubicación, 2 cuadrados para evidencias enmascaradas y botón ancho *"Denunciar mismo objetivo"*. |
| **P3** | `P3_LegalAuthScreen` | **Gate Login & DDJJ:** Ícono de candado/usuario, texto central *"Para denunciar necesitás identificarte"*, botón *"Continuar con Google"* y checkbox interactivo obligatorio con la Declaración Jurada (DDJJ) y Términos de Servicio. |
| **P4** | `P4_CreateReportScreen` | **Formulario de Denuncia (Paso 1):** Dos cajas desplegables (*Categoría*, *Tipo de Identificador*), campo del identificador, caja grande de relato, mapa interactivo para fijar el pin y panel fijo inferior con *"Credibilidad: 20%"* y botón secundario *"Siguiente"*. |
| **P5** | `P5_OCRValidationScreen` | **Evidencias y Procesamiento (Paso 2):** Botones grandes delineados con ícono `+` (*"Subir captura"*, *"Subir comprobante"*), indicador dinámico *"Validando OCR..."*, panel fijo inferior con *"Credibilidad: 80%"* y botón principal oscuro *"Enviar Reporte"*. |
| **P6** | `P6_ValidationErrorScreen` | **Error de Validación:** Duplica la interfaz de P4, resaltando con un borde grueso oscuro el campo del CBU inválido y texto de advertencia debajo: *"Ingresá un CBU válido. Tus demás datos se guardaron"*. |
| **P7** | `P7_OfflineModal` | **Falla Técnica (Offline):** Pantalla P5 oscurecida con modal flotante central: ícono de alerta, texto *"No hay conexión. Se guardó un borrador"*, botón *"Reintentar"* y botón *"Ver Mis Borradores"* (gestión con `AsyncStorage`). |
| **P8** | `P8_ConfirmationScreen` | **Confirmación de Envío:** Banner verde, círculo grande con check de éxito, textos informativos *"Código: AT-2026-XXXX"* y *"Credibilidad final: 80%"*, botones *"Seguir estado"* y *"Volver al inicio"*. |
| **P9** | `P9_CredibilityPanelScreen` | **Panel "Mi Credibilidad":** Lista de 3 ítems con checkmarks y botones de verificación (incluyendo modal interactivo para SMS OTP con 4 casilleros de dígitos `[ 1 ] [ 1 ] [ 0 ] [ 0 ]` y verificación DNI) junto con el gráfico explicativo de la fórmula RG-07. |

---

## 🧮 Regla de Negocio RG-07 (Algoritmo de Credibilidad y Veracidad)

La fórmula matemática de credibilidad pondera el puntaje acumulativo (0% a 100%) en base a tres factores clave:

$$\text{Puntaje Total} = \text{Identidad (hasta 40 pts)} + \text{Evidencias \& OCR (hasta 45 pts)} + \text{Corroboración (hasta 15 pts)}$$

1. **Identidad del Denunciante (Hasta 40 pts):**
   * Cuenta Google vinculada / Auth activa: **+15 pts**
   * Teléfono verificado por SMS OTP: **+15 pts**
   * DNI verificado por Renaper / OCR: **+10 pts**
2. **Evidencias Digitales & OCR (Hasta 45 pts):**
   * Captura de pantalla de chat (WhatsApp/Instagram): **+20 pts**
   * Comprobante oficial de transferencia bancaria: **+25 pts**
   * Coincidencia exacta detectada por OCR con el CBU/Alias: **Bono de consistencia**
3. **Corroboración Comunitaria (Hasta 15 pts):**
   * Incidencias previas coincidentes sobre el mismo objetivo (Alias, CBU, Teléfono o Local): **+5 a +15 pts**.

### Estados del Semáforo Visual:
* 🟢 **Verde (>= 75%):** Alta Veracidad (denuncia sustentada con evidencias concluyentes).
* 🟡 **Amarillo (40% - 74%):** Sospechoso / En proceso de investigación comunitaria.
* 🔴 **Rojo (< 40%):** Baja Veracidad (reporte preliminar sin respaldo documental).

---

## 🧪 Verificación Automatizada

El proyecto incluye una suite de pruebas para verificar matemáticamente la regla RG-07 y el flujo de auditoría:

```bash
node scripts/verify-mvp.js
```

**Resultado de ejecución:**
* ✅ `P4: Factor Identidad inicial Google Auth (+15 pts)`
* ✅ `P4: Puntaje inicial sin evidencias (15%)`
* ✅ `P4: Semáforo preliminar rojo`
* ✅ `P5: Identidad con Teléfono alcanza 30 pts`
* ✅ `P5: Evidencias y OCR alcanzan el máximo de 45 pts`
* ✅ `P5: Barra de Veracidad alcanza exactamente 80%`
* ✅ `P5: Semáforo verde (Alta veracidad)`
* ✅ `P5: Clasificación como ALTA veracidad`
* ✅ `P9: Factor Identidad completo alcanza 40 pts`
* ✅ `P9: Máxima veracidad comunitaria 100%`
* ✅ `P8: Código generado válido 'AT-2026-XXXX'`
* **Total: 11 pasadas, 0 fallidas.**
