# Tasks

## 1. Mapas y geolocalizacion

- [x] 1.1 Crear `src/services/locationService.ts` con ubicacion actual y geocodificacion inversa; verificar que devuelve direccion para coordenadas de CABA
- [x] 1.2 Extender `src/components/MapViewWrapper.tsx` con `draggablePin`, `onLocationChange`, `radioKm` y `showHeatmap`; verificar `npx tsc --noEmit`
- [x] 1.3 Implementar clusters por grilla en `MapViewWrapper.tsx`; verificar que pines cercanos se agrupan
- [x] 1.4 Agregar boton "Mi ubicacion" y pin arrastrable en `P4_CreateReportScreen.tsx`; verificar que la direccion se actualiza al mover el pin
- [x] 1.5 Agregar toggle de heatmap y control de radio en `P1_HomeScreen.tsx`; verificar que el radio redibuja el circulo
- [x] 1.6 Configurar `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` en `.env.example` y `app.json`; verificar que el bundle exporta sin errores

## 2. Evidencias

- [x] 2.1 Crear `src/services/evidenceService.ts` con validacion de 5 archivos, 10MB y formatos JPG/PNG/PDF; verificar con `scripts/verify-evidencias.js`
- [x] 2.2 Crear `src/services/storageService.ts` para subir a Firebase Storage con fallback demo; verificar que devuelve una URL o la URI local
- [x] 2.3 Integrar validacion y limites en `P5_OCRValidationScreen.tsx` (contador y rechazo); verificar que el boton se deshabilita a las 5 evidencias
- [x] 2.4 Leer EXIF con `expo-image-picker` y guardarlo sin exponerlo; verificar que el campo queda en la evidencia
- [x] 2.5 Aplicar blur en la vista publica de evidencias en `P2_ReportDetailScreen.tsx`; verificar que las imagenes se ven difuminadas

## 3. Credibilidad

- [x] 3.1 Agregar `nivelCredibilidad4` y colores a `src/services/credibility.ts`; verificar con `scripts/verify-evidencias.js` los cuatro umbrales
- [x] 3.2 Quitar `Math.max(80, ...)` y usar `identityFactors` reales en `ReportFlowContext.tsx`; verificar que el score mostrado coincide con `calculateRG07Score`
- [x] 3.3 Mostrar el score real en los pies de `P4_CreateReportScreen.tsx` y `P5_OCRValidationScreen.tsx`; verificar que no hay valores fijos
- [x] 3.4 Crear `src/components/ScoreBreakdown.tsx` con el desglose de puntos; verificar que muestra los tres componentes
- [x] 3.5 Crear `src/services/scoreHistory.ts` y registrar cambios al agregar evidencia y al enviar; verificar que el historial conserva los eventos
- [x] 3.6 Mostrar el desglose y el historial en `P9_CredibilityPanelScreen.tsx` y `P2_ReportDetailScreen.tsx`; verificar el estado vacio y con datos

## 4. Integracion y verificacion

- [x] 4.1 Crear `scripts/verify-evidencias.js` con validaciones, umbrales y calculo; verificar que pasa sin fallos
- [x] 4.2 Agregar `verify:evidencias` a `package.json` y a `verify:all`; verificar `npm run verify:all`
- [x] 4.3 Actualizar `docs/setup-servicios.md` con Google Maps, dev build y Storage; verificar que los pasos se siguen en orden
- [x] 4.4 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores de importacion

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
