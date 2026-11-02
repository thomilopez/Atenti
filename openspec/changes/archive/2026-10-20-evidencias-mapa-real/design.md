# Design

## Context

Ver `proposal.md` - Why. La app ya usa `react-native-maps` mediante `MapViewWrapper` (con fallback web), `expo-image-picker` para evidencias y `calculateRG07Score` en `credibility.ts`. Este cambio completa esas piezas sin cambiar la navegacion ni los servicios de backend ya entregados.

## Goals / Non-Goals

**Goals:**
- Geolocalizacion real, pin arrastrable, geocodificacion inversa, radio, clusters y heatmap.
- Validacion y almacenamiento real de evidencias con enmascaramiento publico.
- Formula de credibilidad unica, semaforo de 4 colores, desglose e historial.

**Non-Goals:**
- Reescribir el backend de denuncias o el panel admin.
- OCR con proveedores distintos de Cloud Vision.
- Edicion manual de zonas de blur por bounding box.

## Decisions

**Decision 1: Extender `MapViewWrapper` en lugar de reemplazarlo.** Se agregan props (`showHeatmap`, `radioKm`, `onRadiusChange`, `draggablePin`, `onLocationChange`) y se mantiene el fallback web. Alternativa: crear un mapa nuevo; se descarta para no duplicar y no romper P1/P2/P4.

**Decision 2: Clusters en el cliente por grilla.** Se agrupan marcadores por celda segun la region visible, sin dependencias nuevas. Alternativa: `react-native-map-clustering`; se descarta por compatibilidad con RN 0.86/Expo 57.

**Decision 3: Heatmap con `react-native-maps` cuando esta disponible.** Se usa el componente `Heatmap` en Android/Google. En web/iOS sin soporte se oculta la capa y se mantiene el mapa de pines. Alternativa: libreria externa; se descarta por peso.

**Decision 4: `expo-location` para GPS y geocodificacion inversa.** Se piden permisos y se maneja la denegacion. En web se degrada a la ubicacion por defecto. Alternativa: geocodificacion via Cloud Function; se deja para mas adelante.

**Decision 5: `evidenceService` + `storageService` separados.** La validacion (5 archivos, 10MB, formatos, EXIF) vive en `evidenceService`; la subida y URL segura en `storageService` (Firebase Storage con fallback demo). Alternativa: todo en P5; se descarta para testear la logica sin UI.

**Decision 6: Blur con `blurRadius` de `Image` en la proyeccion publica.** Es simple y protege la imagen completa. El admin ve el original desde la auditoria. Alternativa: blur por zonas detectadas por OCR; se documenta como deuda.

**Decision 7: Formula unica en `credibility.ts` y sin `Math.max`.** `ReportFlowContext` toma `identityFactors` de `AuthContext` y calcula el score real; P4/P5 muestran ese valor. Alternativa: mantener el piso de 80%; se descarta porque contradice RG-07.

**Decision 8: Semaforo de 4 colores como funcion adicional.** `nivelCredibilidad4(score)` devuelve Gris (<20), Rojo (20-39), Naranja (40-74) y Amarillo (>=75), sin romper el semaforo de 3 existente. Alternativa: reemplazar el de 3; se descarta por compatibilidad.

**Decision 9: Historial de score en `scoreHistory.ts`.** Se registra en Firestore `historialScore` con fallback en memoria y se muestra en P2. Alternativa: derivar del historial de estados; se descarta porque el score cambia sin cambiar de estado.

## Risks / Trade-offs

- [Mapa nativo no testeable en Expo Go] -> Usar development build para Google Maps; el fallback web sigue funcionando.
- [Heatmap no soportado en todos los proveedores] -> Ocultar la capa si falla y mantener pines.
- [Blur completo oculta contexto] -> Aceptable para la vista publica; el admin ve el original.
- [EXIF no disponible en web] -> Tratar los metadatos como opcionales.
- [Permisos de ubicacion denegados] -> Mantener la ubicacion por defecto y avisar al usuario.

## Migration Plan

1. Desplegar `storage.rules` para restringir evidencias (lectura publica solo de la proyeccion; original solo admin).
2. No hay migracion de datos: las denuncias existentes conservan su score.
3. **Rollback:** restaurar los valores fijos de P4/P5 y el `MapViewWrapper` anterior; las colecciones nuevas quedan sin uso.

## Open Questions

(none)
