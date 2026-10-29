# Design

## Context

Ver `proposal.md` - Why. La app ya tiene busqueda, denuncias, moderacion de disputas, notificaciones in-app/push y borradores offline. Este cambio agrega un contenido nuevo (relatos) con su propio ciclo de moderacion, reutilizando esas piezas.

## Goals / Non-Goals

**Goals:**
- Feed, detalle, creacion y "mis relatos".
- Moderacion previa con aviso de 24hs y cola admin.
- Identificadores vinculados y relatos en la busqueda.
- Senales de alerta, corroboraciones, compartir, disclaimer y reportar abuso.
- Borradores offline y notificaciones por categoria seguida.

**Non-Goals:**
- Rediseno del inicio y responsive base.
- CUIT y direccion manual (cambio `report-capture`).
- Recomendaciones con ML.

## Decisions

**Decision 1: Coleccion `relatos` con estado.** `EN_REVISION -> PUBLICADA | OCULTA`. Solo PUBLICADA aparece en el feed y en la busqueda. Alternativa: publicar directo; se descarta por desinformacion y riesgo legal.

**Decision 2: Moderacion previa en P32.** El admin revisa, aprueba/oculta con nota y se registra auditoria. Se avisa al autor por notificacion. Alternativa: post-moderacion; se descarta para el lanzamiento.

**Decision 3: Identificadores normalizados y denormalizados.** Se guarda `valorNormalizado` en cada identificador del relato para buscar por Alias/CBU/CUIT/Tel/Local. Alternativa: join en lectura; se descarta por costo.

**Decision 4: Suscripciones por categoria.** `story_subscriptions` guarda `uid` y `categorias[]`. Al publicar, se notifica a los seguidores. Alternativa: notificar a todos; se descarta por ruido.

**Decision 5: Compartir por WhatsApp con fallback.** `Linking` a `whatsapp://send?text=...`; si no esta instalado, `Share.share`. Alternativa: solo `Share`; se descarta porque el usuario pidio WhatsApp.

**Decision 6: Reutilizar filtro lexico, rate limit y anti-spam.** Se aplican al titulo/moduo del relato. Alternativa: reglas nuevas; se descarta por duplicacion.

**Decision 7: Borradores de relato en AsyncStorage.** Clave separada de las denuncias. Alternativa: generalizar `ReportDraft`; se descarta para no romper el flujo actual.

**Decision 8: Notificaciones con el sistema existente.** Nueva preferencia `relatos` y tipo `RELATO_PUBLICADO`; el trigger `enviarPushNotificacion` ya envia. Alternativa: canal aparte; se descarta.

**Decision 9: Quinta tab "Historias".** Se agrega al `BottomNavBar` (Inicio, Mapa, Reportar, Historias, Perfil). Alternativa: acceso solo desde el home; se descarta porque el usuario pidio tab.

## Risks / Trade-offs

- [Riesgo legal por acusaciones] -> Disclaimer, normas, moderacion previa y anonimizacion de nombres.
- [Carga de moderacion] -> Cola con filtros y aviso de 24hs.
- [Spam/duplicados] -> Filtro lexico, rate limit y similitud de contenido.
- [Busqueda por identificador] -> Indices y campos denormalizados.
- [Calidad del contenido] -> Senales de alerta estructuradas y formulario guiado.

## Migration Plan

1. Crear colecciones `relatos`, `story_subscriptions`, `story_reports` (se crean al primer uso).
2. Desplegar reglas e indices.
3. No hay migracion de datos existentes.
4. **Rollback:** ocultar la tab y las rutas; las colecciones quedan sin uso.

## Open Questions

(none)
