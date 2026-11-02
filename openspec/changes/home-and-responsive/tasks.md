# Tasks

## 1. Fundaciones responsive

- [x] 1.1 Crear `src/hooks/useResponsive.ts` con breakpoints, `gutter`, `contentMaxWidth` y `mapHeight`; verificar `npx tsc --noEmit`
- [x] 1.2 Crear `src/components/Skeleton.tsx` con animacion de opacidad; verificar que renderiza sin errores
- [x] 1.3 Aplicar `useResponsive` y quitar alturas fijas en P2, P4, P5, P9, P10, P13 y P19-P26; verificar en 320px, 430px y 768px+

## 2. Bienvenida

- [x] 2.1 Crear `P0_WelcomeScreen.tsx` con logo, eslogan y accesos (Buscar, Reportar, Ingresar); verificar navegacion con `replace`
- [x] 2.2 Agregar animacion de entrada del logo con `Animated`; verificar que no bloquea la navegacion
- [x] 2.3 Cambiar `initialRouteName` a `P0_Welcome` y registrar la ruta en `AppNavigator`/`RootStackParamList`; verificar que al abrir aparece P0

## 3. Inicio con buscador protagonico

- [x] 3.1 Redisenar `P1_HomeScreen` con tarjeta de busqueda grande, chips y preview de mapa compacto; verificar que el buscador es el foco visual
- [x] 3.2 Crear `src/services/recentSearches.ts` (AsyncStorage, maximo 8) e integrarlo en P1; verificar guardar/limpiar recientes
- [x] 3.3 Calcular tendencias desde las denuncias y mostrarlas en P1; verificar que se ocultan si no hay datos
- [x] 3.4 Mostrar skeleton mientras cargan los datos del inicio; verificar el estado de carga
- [x] 3.5 Agregar boton "Ver mapa completo"; verificar que abre P31

## 4. Mapa completo y navegacion

- [x] 4.1 Crear `P31_FullMapScreen.tsx` con `MapViewWrapper`, calor, radio y "Mi ubicacion"; verificar controles
- [x] 4.2 Actualizar `BottomNavBar` para que la tab Mapa abra P31; verificar navegacion
- [x] 4.3 Crear modal "Como funciona?" en P1; verificar que se abre y cierra

## 5. Verificacion

- [x] 5.1 Crear `scripts/verify-home.js` (recientes, tendencias, archivos) y agregarlo a `verify:all`; verificar `npm run verify:all`
- [x] 5.2 Actualizar `.maestro/flujo-critico.yaml` para arrancar en P0; verificar el flujo
- [x] 5.3 Actualizar `README.md` con P0, P31 y la nueva jerarquia del inicio; verificar que el mapa de pantallas coincide
- [x] 5.4 Exportar el bundle (`npx expo export --platform android`) y verificar que no hay errores

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
