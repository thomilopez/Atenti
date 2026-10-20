# Design

## Context

Ver `proposal.md` - Why. La Propuesta 1 ya entrego Firebase real, el flujo de creacion, P10/P11/P12/P13 y los servicios de normalizacion, paginacion y fuzzy search (este ultimo sin cablear en la UI). Este cambio completa las validaciones de negocio y agrega el modulo de administracion y exportacion, reutilizando los servicios existentes.

## Goals / Non-Goals

**Goals:**
- Aplicar RG-02/RG-03 en UI y en el servicio de registro.
- Categorias parametricas persistidas y administrables.
- Panel de administracion con disputas, auditoria, usuarios, metricas y dataset anonimizado.
- Exportacion de ficha a PDF/CSV con autenticidad.
- Autocompletado y tolerancia a errores en la busqueda.

**Non-Goals:**
- Roles U0-U4 formales con custom claims (RF-015) -> pendiente.
- Impugnaciones y notificaciones (cambios separados).
- Cambiar el motor de mapas.

## Decisions

**Decision 1: `IncidentCategory` como `string`.** Las categorias parametricas (RF-027/RF-069) no encajan en una union cerrada. Alternativa: mantener la union y limitar el admin a activar/desactivar; se descarta porque RF-027 exige alta y modificacion. Mitigacion: validar contra el catalogo activo antes de persistir.

**Decision 2: Catalogo en `categoryService.ts`.** Fuente unica con Firestore y fallback en memoria, sembrada con las 5 categorias actuales y su `requiereUbicacion` (solo `Local Fisico Ilícito` en `true`). P4 y el panel admin consumen el mismo servicio. Alternativa: seguir con la constante `CATEGORIAS` de `normalize.ts`; se descarta por no ser administrable.

**Decision 3: Acceso admin temporal por `EXPO_PUBLIC_ADMIN_EMAILS`.** Roles formales estan fuera de alcance, pero el panel necesita una puerta. En modo demo `isAdmin` es verdadero para probar; con Firebase real se compara el email contra la lista. Alternativa: custom claims; se descarta hasta cerrar RF-015. Riesgo de seguridad documentado.

**Decision 4: Extender la maquina de estados.** `EN_DISPUTA -> PUBLICADA` (mantener publicada) y `EN_DISPUTA -> RESUELTA` (retirar, con nota). Alternativa: solo permitir RESUELTA; se descarta porque RF-067 exige ambas decisiones. Se actualizan los tests de transiciones.

**Decision 5: Exportacion con `expo-print`/`expo-sharing`.** PDF desde HTML y CSV a cache y compartir con el sistema. El hash de autenticidad se calcula con SHA-256 de la proyeccion publica; el QR se muestra en pantalla con `react-native-qrcode-svg` y el PDF incluye el hash como texto. Alternativa: incrustar el QR como imagen en el PDF; se descarta por complejidad y porque el codigo + hash ya permiten verificar.

**Decision 6: Pin confirmado explicito.** `ReportFlowContext` gana `pinConfirmado`; el mapa lo activa al elegir ubicacion. RG-03 exige `pinConfirmado` solo para categorias con `requiereUbicacion`. Alternativa: usar la ubicacion por defecto; se descarta porque no prueba intencion del usuario.

**Decision 7: Autocompletado en cliente.** Se calcula sobre las incidencias cargadas + `fuzzySearch`, sin endpoint extra. Alternativa: indice dedicado; se descarta por volumen bajo y simplicidad.

## Risks / Trade-offs

- [Seguridad del panel admin solo en cliente] -> Documentar que las reglas de Firestore siguen protegiendo escrituras y que el gate real llega con RF-015.
- [PDF/CSV depende de sharing del SO] -> Fallback: mostrar el contenido en pantalla si `Sharing.isAvailableAsync()` es falso.
- [Categorias nuevas sin tipado] -> Validar contra el catalogo activo y sanitizar el nombre.
- [Extension de la maquina de estados] -> Actualizar `verify-block-a.js` para reflejar las transiciones de disputa.
- [Datos anonimizados incompletos] -> Excluir explicitamente uid, email e IP y testear el CSV.

## Migration Plan

1. Sembrar `categorias` con las 5 categorias actuales (idempotente).
2. Desplegar reglas para `categorias`, `usuarios` y `solicitudes_baja` (ya previstas).
3. No hay migracion de denuncias: el tipo `category` sigue siendo un string compatible.
4. **Rollback:** revertir el cambio de tipos y volver a la constante de categorias; las colecciones nuevas quedan sin uso.

## Open Questions

(none)
