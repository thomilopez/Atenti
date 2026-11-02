# Tasks

## 1. CUIT

- [x] 1.1 Agregar `CUIT` a `IdentifierType` y a los arreglos de chips/selectores (P1, P4, P13); verificar `npx tsc --noEmit`
- [x] 1.2 Implementar normalizacion de CUIT en `normalize.ts` (11 digitos); verificar con `scripts/verify-report-capture.js`
- [x] 1.3 Implementar checksum AFIP y prefijos en `validarCuit`; verificar CUIT validos e invalidos
- [x] 1.4 Enmascarar CUIT en `masking.ts` (`20-******-*`); verificar la proyeccion publica
- [x] 1.5 Incluir CUIT en autocompletado y busqueda; verificar sugerencias con CUIT
- [x] 1.6 Verificar la comparacion OCR de CUIT en `server-logic`; verificar coincidencia/discrepancia

## 2. Categorias

- [x] 2.1 Agregar `icono` y `color` a `CategoriaTipo` y al seed de `CATEGORIAS`; verificar el catalogo
- [x] 2.2 Sumar las ~11 categorias nuevas por defecto; verificar que aparecen en P4
- [x] 2.3 Mostrar icono/color en el selector de P4; verificar visualmente
- [x] 2.4 Permitir editar icono/color en `P16_AdminCategoriesScreen`; verificar guardado

## 3. Ubicacion

- [x] 3.1 Ampliar `LocationData` con calle, numero, localidad, provincia, CP, referencia y `verificada`; verificar `npx tsc --noEmit`
- [x] 3.2 Agregar `geocodificarDireccion` en `locationService.ts` (texto -> coordenadas); verificar con una direccion de CABA
- [x] 3.3 Crear `MapPickerModal.tsx` a pantalla completa con buscador interno y confirmacion; verificar apertura/confirmacion
- [x] 3.4 Agregar campos de direccion + buscador externo en P4 y sincronizar con el pin; verificar mover pin y buscar direccion
- [x] 3.5 Guardar direccion como texto "sin verificar" cuando no hay red; verificar el aviso
- [x] 3.6 Aproximar la direccion en la vista publica (`masking.ts`); verificar que no expone la direccion exacta
- [x] 3.7 Exigir pin confirmado o direccion verificada para categorias con `requiereUbicacion`; verificar RG-03

## 4. Verificacion

- [x] 4.1 Crear `scripts/verify-report-capture.js` (CUIT, categorias, direccion) y agregarlo a `verify:all`; verificar `npm run verify:all`
- [x] 4.2 Actualizar `README.md`/`docs/setup-servicios.md` con CUIT, categorias y geocodificacion; verificar los pasos
- [x] 4.3 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
