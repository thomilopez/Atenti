# Proposal

## Why

Las propuestas 1 y 2 dejaron el mapa, las evidencias y la credibilidad a medio camino: el mapa es un pseudo-mapa con pines estaticos (sin GPS, geocodificacion, radio, clusters ni heatmap), la carga de evidencias no valida limites/formato/EXIF ni sube a Storage, y el score muestra valores fijos con tres versiones de formula y solo 3 colores. Sin esto, la app no refleja el comportamiento real que describen los requerimientos.

## What Changes

- Evidencias: limite de 5 archivos y 10MB c/u, formatos JPG/PNG/PDF, lectura de EXIF, subida a Cloud Storage y enmascaramiento/blur en la vista publica.
- Mapas: geolocalizacion del dispositivo con `expo-location`, pin arrastrable con geocodificacion inversa, filtro por radio, clusters y capa de heatmap; configuracion de API keys de Google Maps.
- Credibilidad: unificar la formula RG-07 (Identidad 40 + Evidencias 45 + Corroboracion 15), semaforo de 4 colores, desglose visible de puntos, recalculo al agregar evidencia OCR valida e historial de score.
- Se eliminan los valores fijos de credibilidad en P4/P5 y el `Math.max(80, ...)`.
- **BREAKING (interno)**: `TrafficLightColor` se extiende para soportar el nivel de 4 colores ademas del semaforo de 3.

## Capabilities

### New Capabilities
- `evidence-management`: validacion de limites/formato/EXIF, almacenamiento en Cloud Storage y enmascaramiento publico de evidencias.
- `geo-mapping`: geolocalizacion, pin arrastrable, geocodificacion inversa, radio, clusters, heatmap y claves de mapas.
- `credibility-scoring`: formula unificada, semaforo de 4 colores, desglose, recalculo e historial de score.

### Modified Capabilities

(none)

## Impact

- Codigo: `src/components/MapViewWrapper.tsx`, `VeracityBar.tsx`, `TrafficLightIndicator.tsx`, `src/screens/P1`, `P2`, `P4`, `P5`, `P9`, `src/services/credibility.ts`, `ocrService.ts`, `src/types/index.ts`, `app.json`.
- Servicios nuevos: `locationService.ts`, `storageService.ts`, `evidenceService.ts`, `scoreHistory.ts`.
- Dependencias: `expo-location` (ya instalada), `firebase/storage`.
- Config: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` y un development build para Google Maps real.

## Out of scope

- Administracion, impugnaciones, notificaciones y legal (cambios separados).
- Push notifications y exportacion (ya cubiertas o en otros cambios).
- OCR con proveedores distintos de Cloud Vision.
