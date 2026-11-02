# user-auth Specification

## Purpose
Autenticacion real de usuarios de Atenti mediante Firebase Auth: inicio con Google, verificacion de telefono por SMS OTP, verificacion de DNI por OCR/RENAPER, declaracion jurada obligatoria, perfil con factores de identidad y borrado de datos conforme a la Ley 25.326.

## Requirements

### Requirement: Inicio de sesion con Google
El sistema SHALL permitir iniciar sesion con Google Sign-In mediante Firebase Auth y SHALL requerir la sesion valida antes de crear una denuncia.

#### Scenario: Inicio exitoso
- **WHEN** el usuario toca "Continuar con Google" en P3_LegalAuthScreen
- **THEN** se abre el flujo nativo de Google y, al completarse, `AuthContext` expone `user` con `googleAuth = true`

#### Scenario: Sin sesion no se puede denunciar
- **WHEN** un usuario anonimo (U0) intenta crear una denuncia
- **THEN** el sistema lo redirige a P3_LegalAuthScreen y bloquea el envio hasta autenticarse

### Requirement: Verificacion de telefono por SMS OTP
El sistema SHALL enviar un codigo OTP por SMS y SHALL sumar 15 puntos a la identidad (RG-07) solo si el codigo ingresado es valido.

#### Scenario: Codigo valido
- **WHEN** el usuario ingresa el codigo OTP correcto en P9_CredibilityPanelScreen
- **THEN** `phoneVerified = true` y el puntaje de identidad aumenta en 15

#### Scenario: Codigo invalido
- **WHEN** el usuario ingresa un codigo OTP incorrecto
- **THEN** el sistema muestra error y no modifica `phoneVerified`

### Requirement: Verificacion de DNI por OCR/RENAPER
El sistema SHALL permitir escanear el frente y dorso del DNI y SHALL validar la identidad con RENAPER, sumando 10 puntos (RG-07) al verificarla.

#### Scenario: Verificacion exitosa
- **WHEN** el OCR del DNI devuelve coincidencia con RENAPER
- **THEN** `dniVerified = true` y el puntaje de identidad aumenta en 10

#### Scenario: RENAPER no disponible
- **WHEN** el servicio RENAPER no responde
- **THEN** el sistema muestra "verificando" y reintenta en segundo plano sin bloquear la app

### Requirement: Declaracion Jurada obligatoria
El sistema SHALL exigir la aceptacion de la DDJJ antes de crear una denuncia y SHALL registrar su hash con IP y timestamp.

#### Scenario: DDJJ aceptada
- **WHEN** el usuario marca el checkbox de DDJJ en P3_LegalAuthScreen
- **THEN** el sistema habilita el boton "Continuar" y registra el hash de aceptacion

#### Scenario: DDJJ no aceptada
- **WHEN** el checkbox de DDJJ no esta marcado
- **THEN** el boton de continuar permanece deshabilitado

### Requirement: Perfil con factores de identidad
El sistema SHALL mostrar el nivel de verificacion del perfil (Google, telefono, DNI) con sus badges correspondientes.

#### Scenario: Perfil parcialmente verificado
- **WHEN** el usuario solo tiene Google verificado
- **THEN** P9_CredibilityPanelScreen muestra el badge de Google activo y los demas pendientes

### Requirement: Cierre de sesion y borrado de datos
El sistema SHALL permitir cerrar sesion y SHALL permitir solicitar la baja definitiva de la cuenta conforme a la Ley 25.326.

#### Scenario: Cerrar sesion
- **WHEN** el usuario toca "Cerrar sesion"
- **THEN** la sesion se cierra y las pantallas protegidas redirigen a P1_HomeScreen

#### Scenario: Solicitar borrado
- **WHEN** el usuario solicita eliminar su cuenta en P20_Settings
- **THEN** el sistema pide confirmacion y registra la solicitud de baja
