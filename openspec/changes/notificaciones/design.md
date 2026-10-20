# Design

## Context

Ver `proposal.md` - Why. Ya existe `notificationService.ts` con notificaciones in-app, `impugnationService` que genera avisos de impugnación/resolución y una Cloud Function programada. Este cambio agrega el push real, el centro completo y las preferencias, reutilizando las colecciones existentes.

## Goals / Non-Goals

**Goals:**
- Registrar tokens de Expo y enviar push por evento.
- Respetar preferencias por tipo.
- Centro de notificaciones con lectura y preferencias.
- Disparar avisos de estado, corroboración y resolución.

**Non-Goals:**
- FCM directo.
- Deep links avanzados.
- Roles formales.

## Decisions

**Decision 1: Expo Push con trigger de Firestore.** La notificación in-app sigue siendo la fuente de verdad; una Cloud Function `onDocumentCreated` sobre `notificaciones` envía el push. Alternativa: el cliente envía el push; se descarta porque no funciona con la app cerrada y duplica lógica.

**Decision 2: Tokens en `push_tokens`.** Cada documento guarda `{ token, uid, plataforma, actualizadoEn }`; se puede tener más de un dispositivo por usuario. Alternativa: un token por usuario; se descarta para soportar varios dispositivos.

**Decision 3: Preferencias en `notification_prefs/{uid}` + AsyncStorage.** La app cachea para responder rápido; la Function lee Firestore antes de enviar. Alternativa: solo local; se descarta porque la Function no ve el estado local.

**Decision 4: Mapeo tipo -> preferencia.** `IMPUGNACION`/`CAMBIO_ESTADO` usan `estado`; `CORROBORACION` usa `corroboracion`; `DISPUTA_RESUELTA` usa `resolucion`; `ESCALADA` va a admin sin preferencia. Alternativa: una preferencia por cada tipo; se descarta para no fragmentar.

**Decision 5: Project ID de EAS.** `getExpoPushTokenAsync` requiere `projectId`. Si no está configurado, se omite el registro sin romper la app. Alternativa: hardcodear; se descarta.

**Decision 6: Disparadores.** PUBLICADA al crear (cliente), EN_DISPUTA en la impugnación, RESUELTA en el cierre y CORROBORACION en un servicio que compara `valorNormalizado`. Alternativa: solo triggers de Firestore; se descarta para no meter lógica de dominio en Functions.

## Risks / Trade-offs

- [Expo Go no soporta push remoto] -> Requiere development build; se documenta y se mantienen las notificaciones in-app.
- [Sin projectId no hay token] -> Registro omitido con log; la app sigue funcionando.
- [Falla del servicio de push] -> El evento queda in-app; la Function loguea el error.
- [Duplicados de corroboración] -> Se deduplican los uids notificados.
- [Privacidad] -> El push no incluye datos sensibles, solo el código y el estado.

## Migration Plan

1. Configurar el projectId de EAS (`eas init` / `extra.eas.projectId`).
2. Desplegar la function: `firebase deploy --only functions`.
3. No hay migracion de datos: `push_tokens` y `notification_prefs` se crean al primer uso.
4. **Rollback:** desactivar la function de push; las notificaciones in-app siguen funcionando.

## Open Questions

(none)
