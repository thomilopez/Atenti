# Design

## Context

Ver `proposal.md` - Why. Hoy `LocationData` solo guarda coordenadas + `address`, P4 realiza geocodificacion inversa al mover el pin y el mapa mide 120px. `IdentifierType` no incluye CUIT y el catalogo de categorias vive en `CATEGORIAS`/`categoryService` con nombre y `requiereUbicacion`.

## Goals / Non-Goals

**Goals:**
- Direccion manual + pin sincronizados, con mapa expandible y offline.
- CUIT valido, enmascarado, buscable y corroborable.
- Categorias con icono/color y lista ampliada.
- Privacidad de la ubicacion publica.

**Non-Goals:**
- Relatos de estafas.
- Rediseno del inicio (cambio `home-and-responsive`).

## Decisions

**Decision 1: Geocodificacion directa con `expo-location` (`geocodeAsync`).** Es nativo y no agrega dependencias. Si falla o no esta disponible (web), se permite guardar la direccion como texto "sin verificar". Alternativa: Google Geocoding via Cloud Function; se deja para una mejora posterior.

**Decision 2: `MapPickerModal` a pantalla completa.** Se reutiliza `MapViewWrapper` y se agrega un buscador interno. Alternativa: pantalla nueva; se descarta para no duplicar estado del formulario.

**Decision 3: CUIT con checksum AFIP.** 11 digitos, prefijos conocidos (20/23/24/27/30/33/34) y digito verificador por mod 11. Alternativa: solo longitud; se descarta por errores de tipeo.

**Decision 4: Enmascarar CUIT como `20-******-*`.** Se muestra el prefijo y el ultimo digito. Alternativa: `****...1234`; se descarta para mantener formato CUIT.

**Decision 5: `LocationData` con campos de direccion.** Se agregan `calle`, `numero`, `localidad`, `provincia`, `codigoPostal`, `referencia` y `verificada`. La proyeccion publica muestra zona aproximada. Alternativa: un solo string; se descarta por calidad de datos y geocodificacion.

**Decision 6: `CategoriaTipo` con `icono` y `color`.** Se suman al seed y al panel admin. Alternativa: mapa fijo por nombre; se descarta porque las categorias son parametricas.

**Decision 7: Privacidad de la direccion.** En la vista publica se muestra localidad/zona y no la direccion exacta. Alternativa: mostrar la direccion; se descarta por Ley 25.326 y seguridad.

## Risks / Trade-offs

- [Geocodificador nativo impreciso] -> Mostrar confirmacion y permitir ajustar el pin; fallback a texto sin verificar.
- [CUIT con prefijos no listados] -> Validar checksum siempre; advertir si el prefijo es poco comun.
- [Categorias nuevas en Firestore ya sembrado] -> El seed corre solo si la coleccion esta vacia; documentar como agregar las nuevas.
- [Direccion publica] -> Aproximar por localidad/provincia.

## Migration Plan

1. Ampliar `CATEGORIAS` por defecto; si Firestore ya tiene categorias, agregar las nuevas desde el panel admin o re-sembrar.
2. `LocationData` es compatible: los campos nuevos son opcionales.
3. No hay migracion de denuncias existentes.
4. **Rollback:** quitar CUIT del selector y volver a la direccion por reverse geocoding; los datos nuevos quedan ignorados.

## Open Questions

(none)
