# Tasks

## 1. Fundación

- [x] 1.1 Agregar `useCentro(compensacionHorizontal?)` en `src/hooks/useResponsive.ts`; verificar `npx tsc --noEmit`

## 2. Pantallas base iniciales

- [x] 2.1 Centrar `ScrollView`, barra superior y pie de `src/screens/P4_CreateReportScreen.tsx`
- [x] 2.2 Centrar `ScrollView`, barra y pie en `src/screens/P5_OCRValidationScreen.tsx`
- [x] 2.3 Centrar barra, disclaimer y lista en `src/screens/P27_StoriesFeedScreen.tsx`
- [x] 2.4 Centrar cabecera y `ScrollView` en `src/screens/P9_CredibilityPanelScreen.tsx`

## 3. Grupo 1: ScrollViews (16 pantallas)

- [x] 3.1 Adaptar P2, P12, P14, P15, P16, P17, P18, P20, P21, P22, P23, P24, P29, P30, P32, P33 con `contentContainerStyle` centrado y `navBarInner`.

## 4. Grupo 2: FlatLists (4 pantallas)

- [x] 4.1 Adaptar P10, P13, P19, P25 con `contentContainerStyle`, `navBarInner`, filtros y buscadores envueltos.

## 5. Grupo 3: Sin scroll (4 pantallas)

- [x] 5.1 Adaptar P3, P8, P11, P26 aplicando `centro` sobre el contenedor principal (`container` / `content`).

## 6. Grupos 4 y 5: Pies de acción y Especiales

- [x] 6.1 Adaptar P2 y P28 envolviendo `footer` en `footerInner` con `centroBarra` y botón de reporte con `centro`.
- [x] 6.2 Adaptar P31 centrando `navBar` con `navBarInner` preservando mapa full-bleed.

## 7. Script y Verificación

- [x] 7.1 Crear `scripts/verify-centered.js` e integrarlo en `npm run verify:all`.
- [x] 7.2 Verificar `npm run verify:all` (todas las suites pasando).
- [x] 7.3 Verificar `npx tsc --noEmit`.
