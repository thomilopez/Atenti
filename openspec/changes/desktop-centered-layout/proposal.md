# Proposal

## Why

En vista de computadora (navegador con ancho >= 768px) las vistas de la aplicación se dibujaban a todo el ancho de la ventana: los campos de texto, formularios, listas y botones quedaban desproporcionadamente estirados y difíciles de leer. Además, las barras superiores y los pies de acción dejaban los controles pegados a los bordes opuestos de la pantalla.

## What Changes

- Helper unificado `useCentro(compensacionHorizontal?)` en `src/hooks/useResponsive.ts`: devuelve `width: '100%'`, `maxWidth` (720px en pantalla ancha) y `alignSelf: 'center'`; por debajo de 768px devuelve `maxWidth: undefined`, por lo que en celular e interfaces angostas se preserva el comportamiento 100% original.
- Adaptación completa de 26 pantallas de la app + 4 pantallas base (P4, P5, P9, P27):
  - **Grupo 1 (ScrollView)**: P2, P12, P14, P15, P16, P17, P18, P20, P21, P22, P23, P24, P29, P30, P32, P33 centrando `contentContainerStyle` y barra superior con `navBarInner`.
  - **Grupo 2 (FlatList)**: P10, P13, P19, P25 centrando `contentContainerStyle` de listas, `navBarInner`, y agrupando tiras de filtros y buscadores en bloques centrados.
  - **Grupo 3 (Sin scroll)**: P3, P8, P11, P26 aplicando `centro` directo sobre el contenedor principal (`container`/`content`).
  - **Grupo 4 (Pies de acción)**: P2 y P28 envolviendo botones y pies en un contenedor centrado (`footerInner` con `centroBarra`).
  - **Grupo 5 (Especial)**: P31 centrando `navBar` con `navBarInner` mientras que el mapa interactivo se mantiene full-bleed.
- Script automatizado de verificación `scripts/verify-centered.js` integrado en `npm run verify:all`.

## Capabilities

### Modified Capabilities
- `responsive-layout`: soporte de columna centrada estándar (720px) en pantalla ancha (desktop / tablet) a lo largo de todas las vistas de la aplicación.

## Impact

- Pantallas y componentes afectados en `src/screens/` y `src/hooks/useResponsive.ts`.
- Estilos puros: no altera lógica de negocio, datos, navegación ni servicios.

## Out of Scope

- Modales (OTP de teléfono, DNI, modal offline, MapPickerModal): se mantienen desacoplados del contenedor con comportamiento overlay propio.
