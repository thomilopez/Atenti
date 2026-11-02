# Design

## Context

Ver `proposal.md` - Why. Hoy `AppNavigator` arranca en `P1_Home`, donde `mapContainer` usa `flex: 1` y deja el buscador en un lugar secundario. No existe una pantalla de bienvenida y varias pantallas usan alturas fijas. Este cambio reordena la entrada y la jerarquia visual sin perder los flujos existentes.

## Goals / Non-Goals

**Goals:**
- P0 de bienvenida siempre al abrir, con logo + eslogan + accesos.
- Buscador protagonico en P1, con recientes, tendencias y skeleton.
- Mapa completo separado en P31.
- Layout responsive en celulares y tablets (vertical).

**Non-Goals:**
- CUIT, direccion manual y mapa de captura (cambio `report-capture`).
- Relatos e tab "Historias" (cambio `scam-stories`).
- Modo oscuro.

## Decisions

**Decision 1: P0 como `initialRouteName`.** Se muestra siempre. Al elegir una accion se usa `navigation.replace`/`reset` para que "atras" no vuelva a P0. Alternativa: mostrar P0 solo la primera vez; se descarta porque el usuario pidio que se muestre siempre.

**Decision 2: Inicio search-first.** La tarjeta de busqueda pasa a ser el hero; el mapa baja a un preview de altura adaptativa con "Ver mapa completo". Alternativa: mantener el mapa grande; se descarta porque contradice el pedido.

**Decision 3: Mapa completo en P31.** Se reutiliza `MapViewWrapper` con los controles (calor, radio, mi ubicacion). La tab "Mapa" del `BottomNavBar` apunta a P31. Alternativa: modal; se descarta para que tenga su propio espacio y estado.

**Decision 4: Historias se agrega en `scam-stories`.** En este cambio la barra queda con 4 tabs (Inicio, Mapa, Reportar, Perfil). El cambio de relatos agrega la 5ta tab. Alternativa: placeholder ahora; se descarta para no crear pantallas vacias.

**Decision 5: `useResponsive` central.** Hook basado en `useWindowDimensions` con breakpoints y helpers (`gutter`, `contentMaxWidth`, `mapHeight`). Se aplica a P0/P1/P31 y a las pantallas principales. Alternativa: estilos por pantalla; se descarta por duplicacion.

**Decision 6: Recientes en AsyncStorage y tendencias derivadas.** Las busquedas recientes se guardan localmente (maximo 8). Las tendencias se calculan agrupando las denuncias cargadas por identificador. Alternativa: endpoint dedicado; se descarta por volumen bajo.

**Decision 7: Skeleton propio.** Componente `Skeleton` con animacion de opacidad, sin dependencias nuevas. Alternativa: libreria externa; se descarta por peso.

**Decision 8: Animacion del logo.** `Animated` nativo en P0 (opacidad + escala). El splash ya existe; no se agrega dependencia.

## Risks / Trade-offs

- [P0 siempre al abrir puede cansar] -> Accesos directos y animacion breve; se puede sumar "no volver a mostrar" mas adelante.
- [Tendencias vacias al inicio] -> Ocultar la seccion si no hay datos suficientes.
- [Responsive en tablets] -> Contenido centrado con `maxWidth`; probar en 320px, 430px y 768px+.
- [Cambios de navegacion] -> Actualizar Maestro y probar back/reset.

## Migration Plan

1. Cambiar `initialRouteName` a P0 y registrar P31.
2. Aplicar `useResponsive` y ajustar alturas fijas de las pantallas principales.
3. No hay migracion de datos; las recientes se crean al primer uso.
4. **Rollback:** volver `initialRouteName` a P1 y quitar P31; no afecta datos.

## Open Questions

(none)
