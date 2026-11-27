# Design

## Context

Ver `proposal.md` - Why. Las vistas se componían en su mayoría con `StyleSheet` sin ancho máximo horizontal, provocando que en computadoras de escritorio ocupen el 100% de anchos de pantalla grandes. `useResponsive` provee `contentMaxWidth` (720px para `width >= 768`) y el helper `useCentro`.

## Goals / Non-Goals

**Goals:**
- Centrar cuerpo, barra superior y pie en las 26 pantallas + 4 pantallas base en una columna de 720px en pantalla ancha.
- Regla única:
  - Elemento en columna (hijo de SafeAreaView o scroll) $\to$ `contentContainerStyle` o `style` con `centro`.
  - Elemento en fila (`navBar`, `footer`) $\to$ envolver en `*Inner` con `centroBarra = useCentro(32)` y `justifyContent: 'center'` en el exterior.
  - Elemento con margen lateral $\to$ envolver en `<View style={centro}>`.
- Cero cambios visuales en celular y en ventana angosta (< 768px).

**Non-Goals:**
- Modales y diálogos overlay.
- Alterar breakpoints o paleta de colores.

## Decisions

**Decision 1: helper `useCentro` en `useResponsive`.** Devuelve `{ width: '100%', maxWidth: contentMaxWidth - compensacionHorizontal, alignSelf: 'center' }`. En pantallas < 768px devuelve `maxWidth: undefined`.

**Decision 2: barras y pies mantienen fondo a todo el ancho.** `navBar` y `footer` van de borde a borde (`width: 100%`); sus elementos internos van dentro de `*Inner` centrado.

**Decision 3: compensación de 32px.** Barra superior y footer restan 32px (`padding: 16` por lado) para que los botones queden perfectamente alineados con el cuerpo de 720px.

**Decision 4: contenedores con margen lateral se envuelven.** Elementos como `searchBox` o tiras de filtros se envuelven en `<View style={centro}>` para prevenir desbordes de 32px.

**Decision 5: P31 mapa interactivo full-bleed.** Solo la barra superior se centra; el mapa interactivo ocupa todo el viewport.

## Migration Plan

1. Actualizar `src/hooks/useResponsive.ts`.
2. Aplicar estructura en las 26 pantallas.
3. Incorporar `scripts/verify-centered.js` a `package.json`.
4. Ejecutar suite de validaciones.
