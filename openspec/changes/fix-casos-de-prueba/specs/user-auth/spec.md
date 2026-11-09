# Spec Delta

## Purpose

Autenticacion real de usuarios de Atenti mediante Firebase Auth: inicio con Google, verificacion de telefono por SMS OTP, verificacion de DNI por OCR/RENAPER, declaracion jurada obligatoria, perfil con factores de identidad y borrado de datos conforme a la Ley 25.326.

## ADDED Requirements

### Requirement: Restauracion de sesion y deteccion de proveedor
El sistema SHALL restaurar la sesion de Firebase al reiniciar la app y SHALL derivar `googleAuth` desde los proveedores reales, no desde un flag fijo.

#### Scenario: Restauracion
- **WHEN** el usuario cierra y vuelve a abrir la app autenticado
- **THEN** `AuthContext` recupera la sesion y los factores persistidos

#### Scenario: Sesion anonima
- **WHEN** la sesion es anonima de Expo Go
- **THEN** el sistema no otorga el factor Google

### Requirement: Persistencia de la verificacion de telefono
El sistema SHALL validar el OTP contra el servidor, SHALL persistir `phoneVerified` y SHALL otorgar 15 puntos solo con una verificacion real.

#### Scenario: Codigo valido
- **WHEN** el usuario ingresa el OTP correcto
- **THEN** `phoneVerified` se guarda en `usuarios/{uid}` y suma 15

#### Scenario: Modo simulado
- **WHEN** no hay proveedor SMS configurado
- **THEN** la UI lo indica como simulado y no otorga puntos

### Requirement: Persistencia del DNI y campo de solo lectura
El sistema SHALL validar el DNI con RENAPER, SHALL persistir `dniVerified` y SHALL bloquear la edicion del numero una vez leido.

#### Scenario: DNI verificado
- **WHEN** el OCR coincide con RENAPER
- **THEN** el DNI queda en solo lectura y suma 10 puntos

#### Scenario: RENAPER pendiente
- **WHEN** RENAPER no responde
- **THEN** el estado queda "verificando" y no se permite editar manualmente

### Requirement: Registro de DDJJ al iniciar sesion
El sistema SHALL registrar la aceptacion de terminos al iniciar sesion y SHALL generar el hash con la IP y el timestamp del servidor.

#### Scenario: Aceptacion en P3
- **WHEN** el usuario marca la DDJJ en P3_LegalAuthScreen
- **THEN** se persiste la version aceptada y se habilita continuar

#### Scenario: Hash de servidor
- **WHEN** se crea la denuncia
- **THEN** el hash usa la IP real y la version vigente, no `0.0.0.0`

### Requirement: Perfil con factores persistidos
El sistema SHALL mostrar Google, telefono y DNI leyendo los factores persistidos y SHALL distinguir simulados de reales.

#### Scenario: Perfil parcial
- **WHEN** solo Google esta verificado
- **THEN** P20_SettingsScreen muestra los otros factores pendientes

### Requirement: Borrado definitivo de cuenta
El sistema SHALL eliminar la cuenta y sus datos de Auth, Firestore y Storage al confirmar la baja.

#### Scenario: Baja confirmada
- **WHEN** el usuario confirma eliminar su cuenta
- **THEN** una Cloud Function elimina el usuario y purga o anonimiza sus datos

### Requirement: Roles y claims
El sistema SHALL asignar roles U0/U1/U4 por custom claims y SHALL restringir las acciones de administracion a U4.

#### Scenario: Admin
- **WHEN** el usuario tiene claim `rol = U4`
- **THEN** accede al panel de administracion

#### Scenario: No autorizado
- **WHEN** un U1 intenta una accion de admin
- **THEN** la app y el backend la rechazan
