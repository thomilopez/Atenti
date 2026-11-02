# Proposal

## Why

Hoy la ubicacion solo se puede fijar moviendo el pin (la direccion se completa por geocodificacion inversa), el mapa de captura es de 120px fijos y no se puede agrandar, no existe CUIT como identificador y hay pocas categorias. Esto limita la precision del reporte y la busqueda.

## What Changes

- Direccion manual con campos (calle, numero, localidad, provincia, CP, referencia) y geocodificacion directa; el pin y la direccion se mantienen sincronizados.
- Mapa expandible en un modal a pantalla completa con buscador de direccion dentro; la busqueda de direccion tambien esta afuera, en P4.
- **Nuevo identificador CUIT**: normalizacion a 11 digitos, checksum AFIP, enmascaramiento, busqueda, autocompletado, corroboracion y comparacion OCR.
- Categorias con icono y color, y una lista ampliada por defecto.
- Offline: la direccion se guarda como texto y queda "sin verificar".
- Privacidad: en la vista publica se muestra zona aproximada, no la direccion exacta.
- RG-03: las categorias con ubicacion obligatoria exigen pin confirmado.

## Capabilities

### New Capabilities
- `location-capture`: direccion manual, campos, geocodificacion directa, sincronizacion con el pin y modal expandible.
- `identifier-catalog`: CUIT con checksum y enmascaramiento; catalogo de categorias con icono y color.

### Modified Capabilities
- `geo-mapping`: mapa expandible con buscador interno.
- `report-validation`: direccion verificada y pin confirmado.
- `search-discovery`: CUIT en busqueda y autocompletado.
- `admin-moderation`: categorias con icono y color.
- `server-logic`: comparacion de CUIT en OCR.

## Impact

- Codigo: `src/types/index.ts`, `services/normalize.ts`, `masking.ts`, `locationService.ts`, `categoryService.ts`, `src/screens/P1`, `P4`, `P5`, `P13`, `P16`, `components/MapViewWrapper.tsx`, scripts de verificacion.
- Datos: `CATEGORIAS` por defecto ampliadas; `LocationData` con campos de direccion.
- Sin dependencias nuevas.

## Out of scope

- Relatos de estafas -> cambio `scam-stories`.
- Rediseno del inicio y responsive base -> cambio `home-and-responsive`.
