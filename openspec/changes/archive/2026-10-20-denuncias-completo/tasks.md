# Tasks

## 1. Fundamentos

- [x] 1.1 Cambiar `IncidentCategory` a `string` en `src/types/index.ts` y verificar `npx tsc --noEmit` sin errores
- [x] 1.2 Crear `src/services/categoryService.ts` con listar/crear/editar/desactivar y fallback en memoria; verificar con `scripts/verify-denuncias.js` que siembra las 5 categorias
- [x] 1.3 Extender `TRANSITIONS` en `src/services/stateMachine.ts` con `EN_DISPUTA -> PUBLICADA`; verificar que `verify-block-a.js` sigue pasando
- [x] 1.4 Agregar `pinConfirmado` y `setPinConfirmado` a `ReportFlowContext.tsx` y resetearlo en `resetForm`; verificar que el reset lo deja en `false`
- [x] 1.5 Agregar `EXPO_PUBLIC_ADMIN_EMAILS` a `services/env.ts`, `.env.example` y `isAdmin` en `AuthContext.tsx`; verificar en modo demo que `isAdmin` es verdadero

## 2. Validaciones RG-02 y RG-03

- [x] 2.1 Agregar contador y bloqueo de relato < 20 caracteres en `P4_CreateReportScreen.tsx`; verificar que el boton se deshabilita con 12 caracteres
- [x] 2.2 Bloquear en `P4_CreateReportScreen.tsx` las categorias con `requiereUbicacion` sin `pinConfirmado`; verificar que "Local Fisico Ilícito" exige pin
- [x] 2.3 Bloquear en `P5_OCRValidationScreen.tsx` el envio sin evidencias; verificar que el boton "Enviar Reporte" no avanza sin evidencia
- [x] 2.4 Validar RG-02 dentro de `registrarDenuncia` en `src/services/firebase.ts`; verificar que una denuncia invalida lanza error

## 3. Administracion

- [x] 3.1 Crear `P14_AdminDashboardScreen.tsx` con KPIs y listado de EN_DISPUTA; verificar que muestra el estado vacio y las disputas
- [x] 3.2 Crear `P15_AdminDisputeScreen.tsx` con "Mantener publicada" y "Retirar denuncia" (nota obligatoria); verificar las dos transiciones
- [x] 3.3 Crear `P18_AdminAuditScreen.tsx` con uid, email, IP, timestamp, evidencias e historial; verificar que muestra datos sin censura
- [x] 3.4 Crear `P16_AdminCategoriesScreen.tsx` para alta/edicion/activacion de categorias; verificar que una categoria desactivada desaparece de P4
- [x] 3.5 Crear `P17_AdminUsersScreen.tsx` con listado y suspension de usuarios; verificar que el usuario queda marcado como suspendido
- [x] 3.6 Crear `src/services/adminService.ts` con metricas y dataset anonimizado; verificar que el CSV no contiene uid, email ni IP
- [x] 3.7 Agregar acceso al panel admin desde `P20_SettingsScreen.tsx` solo cuando `isAdmin`; verificar que un usuario comun no lo ve

## 4. Exportacion

- [x] 4.1 Crear `src/services/exportService.ts` con generacion de CSV y PDF; verificar con `scripts/verify-denuncias.js` que el CSV escapa comillas y comas
- [x] 4.2 Agregar exportacion PDF/CSV y QR de autenticidad en `P2_ReportDetailScreen.tsx`; verificar que el PDF incluye el hash y el QR se muestra en pantalla
- [x] 4.3 Verificar que la exportacion publica excluye uid, email e IP; verificar con la prueba del script

## 5. Busqueda

- [x] 5.1 Crear `src/services/autocompleteService.ts` con sugerencias por similitud; verificar que un error de tipeo sugiere la coincidencia
- [x] 5.2 Integrar sugerencias y "Quiso decir..." en `P1_HomeScreen.tsx`; verificar que aparecen con 2 o mas caracteres

## 6. Integracion y documentacion

- [x] 6.1 Registrar P14 a P18 en `src/navigation/AppNavigator.tsx` y `RootStackParamList`; verificar navegacion entre pantallas
- [x] 6.2 Crear `scripts/verify-denuncias.js` y agregarlo a `verify:all`; verificar que los tres scripts pasan sin fallos
- [x] 6.3 Actualizar `docs/setup-servicios.md` con la configuracion de `EXPO_PUBLIC_ADMIN_EMAILS` y la siembra de categorias; verificar que los pasos se siguen en orden

## Workflow follow-up

- Archivar el cambio cuando la revision del equipo este aprobada.
