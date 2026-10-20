# Design

## Context

Ver `proposal.md` - Why. La app ya tiene la maquina de estados con `PUBLICADA -> EN_DISPUTA`, el panel admin para resolver disputas (P15) y el ocultamiento de EN_DISPUTA del buscador publico. Este cambio agrega el flujo de presentacion de la impugnacion, el plazo de 72hs y las notificaciones in-app, reutilizando esas piezas.

## Goals / Non-Goals

**Goals:**
- Presentar impugnaciones con validacion y take-down inmediato.
- Avisar al denunciante original.
- Plazo de 72hs con respuesta y escalacion automatica.
- Cerrar la impugnacion al resolver la disputa.

**Non-Goals:**
- Push notifications y centro completo (cambio `notificaciones`).
- Roles U0-U4 formales.
- Resolucion de fondo distinta a la que ya hace P15.

## Decisions

**Decision 1: Reusar `actualizarEstadoDenuncia` para el take-down.** La transicion `PUBLICADA -> EN_DISPUTA` ya existe y valida la maquina de estados. Alternativa: modificar la denuncia a mano; se descarta por perder historial e invariantes.

**Decision 2: Plazo de 72hs como `deadline` ISO en la impugnacion.** La escalacion corre en una Cloud Function programada (cada 15 minutos) y ademas se verifica al abrir P22_DisputeStatus. Alternativa: solo cliente; se descarta porque requiere que la app este abierta. La escalacion es idempotente (chequea `escalada`).

**Decision 3: Notificaciones in-app en la coleccion `notificaciones`.** Se registran al impugnar y al resolver. El envio push y el centro completo quedan para `notificaciones`. Alternativa: push ahora; se descarta para no adelantar ese cambio.

**Decision 4: Dos puntos de entrada.** P2 tiene "Impugnar esta denuncia" (comercio/persona reportada) y P10 navega a P22 cuando la denuncia esta EN_DISPUTA (denunciante). Alternativa: solo un punto; se descarta porque los dos roles necesitan caminos distintos.

**Decision 5: Validacion de CUIT/DNI.** Solo digitos, longitud 7 a 11; descargo con minimo 20 caracteres. Alternativa: validar checksum de CUIT; se descarta por ahora porque puede haber DNI.

**Decision 6: Al resolver, cerrar la impugnacion.** `adminService.resolverDisputa` llama a `cerrarImpugnacion` y crea una notificacion para el denunciante. Alternativa: dejar la impugnacion abierta; se descarta porque queda inconsistente.

## Risks / Trade-offs

- [La Cloud Function programada requiere Blaze] -> Documentar; el cliente mantiene un fallback de escalacion al abrir P22.
- [Uid del denunciante no coincide en demo] -> La lista de notificaciones muestra todas en modo demo.
- [Doble escalacion por carrera cliente/funcion] -> La operacion es idempotente y verifica `escalada`.
- [Impugnaciones maliciosas] -> Quedan auditadas con actor y descargo; el admin resuelve.

## Migration Plan

1. Crear las colecciones `impugnaciones` y `notificaciones` (se crean al primer uso).
2. Desplegar la function programada: `firebase deploy --only functions`.
3. No hay migracion de denuncias existentes.
4. **Rollback:** desactivar la function programada y revertir las pantallas nuevas; las colecciones quedan sin uso.

## Open Questions

(none)
