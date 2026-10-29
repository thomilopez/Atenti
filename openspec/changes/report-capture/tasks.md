# Tasks

## 1. CUIT

- [ ] 1.1 Agregar `CUIT` a `IdentifierType` y a los arreglos de chips/selectores (P1, P4, P13); verificar `npx tsc --noEmit`
- [ ] 1.2 Implementar normalizacion de CUIT en `normalize.ts` (11 digitos); verificar con `scripts/verify-report-capture.js`
- [ ] 1.3 Implementar checksum AFIP y prefijos en `validarCuit`; verificar CUIT validos e invalidos
- [ ] 1.4 Enmascarar CUIT en `masking.ts` (`20-******-*`); verificar la proyeccion publica
- [ ] 1.5 Incluir CUIT en autocompletado y busqueda; verificar sugerencias con CUIT
- [ ] 1.6 Verificar la comparacion OCR de CUIT en `server-logic`; verificar coincidencia/discrepancia

## 2. Categorias

- [ ] 2.1 Agregar `icono` y `color` a `CategoriaTipo` y al seed de `CATEGORIAS`; verificar el catalogo
- [ ] 2.2 Sumar las ~11 categorias nuevas por defecto; verificar que aparecen en P4
- [ ] 2.3 Mostrar icono/color en el selector de P4; verificar visualmente
- [ ] 2.4 Permitir editar icono/color en `P16_AdminCategoriesScreen`; verificar guardado

## 3. Ubicacion

- [ ] 3.1 Ampliar `LocationData` con calle, numero, localidad, provincia, CP, referencia y `verificada`; verificar `npx tsc --noEmit`
- [ ] 3.2 Agregar `geocodificarDireccion` en `locationService.ts` (texto -> coordenadas); verificar con una direccion de CABA
- [ ] 3.3 Crear `MapPickerModal.tsx` a pantalla completa con buscador interno y confirmacion; verificar apertura/confirmacion
- [ ] 3.4 Agregar campos de direccion + buscador externo en P4 y sincronizar con el pin; verificar mover pin y buscar direccion
- [ ] 3.5 Guardar direccion como texto "sin verificar" cuando no hay red; verificar el aviso
- [ ] 3.6 Aproximar la direccion en la vista publica (`masking.ts`); verificar que no expone la direccion exacta
- [ ] 3.7 Exigir pin confirmado o direccion verificada para categorias con `requiereUbicacion`; verificar RG-03

## 4. Verificacion

- [ ] 4.1 Crear `scripts/verify-report-capture.js` (CUIT, categorias, direccion) y agregarlo a `verify:all`; verificar `npm run verify:all`
- [ ] 4.2 Actualizar `README.md`/`docs/setup-servicios.md` con CUIT, categorias y geocodificacion; verificar los pasos
- [ ] 4.3 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
