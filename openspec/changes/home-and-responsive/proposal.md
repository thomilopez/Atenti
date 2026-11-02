# Proposal

## Why

La app abre directo en P1, donde el mapa ocupa ~70% de la pantalla y el buscador —que es la accion principal— queda chico. No hay pantalla de bienvenida con identidad de marca y los tamanos fijos no se adaptan a celulares chicos, grandes ni tablets.

## What Changes

- Nueva `P0_WelcomeScreen` inicial con logo + eslogan y accesos (Buscar, Reportar, Ingresar). Se muestra siempre al abrir.
- Rediseno de `P1_HomeScreen`: buscador protagonico (tarjeta grande), chips, busquedas recientes, tendencias, skeleton de carga y preview de mapa compacto con "Ver mapa completo".
- Nueva `P31_FullMapScreen` con el mapa completo y los controles actuales (calor, radio, mi ubicacion).
- Hook `useResponsive` + breakpoints (chico/medio/grande/tablet) aplicado a las pantallas principales; contenedores con ancho maximo en tablets y `KeyboardAvoidingView`.
- "Como funciona?" como modal de ayuda.
- Logo/splash con animacion de entrada en P0.
- **BREAKING (navegacion)**: la ruta inicial pasa de `P1_Home` a `P0_Welcome`. La tab "Mapa" de la barra inferior abre `P31_FullMap`.

## Capabilities

### New Capabilities
- `welcome-screen`: P0 con logo, eslogan, accesos y animacion.
- `responsive-layout`: breakpoints, alturas flexibles, teclado y tablets.

### Modified Capabilities
- `search-discovery`: buscador protagonico, busquedas recientes, tendencias y skeletons.
- `geo-mapping`: mapa completo separado del inicio.

## Impact

- Codigo: `AppNavigator`, `P0_Welcome`, `P1_Home`, `P31_FullMap`, `BottomNavBar`, `types`, hooks/theme, y ajustes responsive en P2/P4/P5/P9/P10/P13/P19-P26.
- Dependencias: ninguna nueva (usa `useWindowDimensions`, `Animated` y AsyncStorage ya presentes).
- Datos: busquedas recientes en AsyncStorage; tendencias derivadas de las denuncias.

## Out of scope

- CUIT, direccion manual y mapa expandible de captura -> cambio `report-capture`.
- Relatos de estafas, moderacion y tab "Historias" -> cambio `scam-stories` (la tab se agrega alli).
