# offline-sync Specification

## Purpose
Arquitectura offline-first real: borradores en AsyncStorage con autosave cada 10 segundos, deteccion automatica de conectividad, cola de sincronizacion con reintentos exponenciales y aviso de que el borrador no equivale a una denuncia enviada.

## Requirements

### Requirement: Guardar borrador local
El sistema SHALL persistir el borrador en AsyncStorage ante perdida de conexion.

#### Scenario: Borrador guardado
- **WHEN** el envio falla por red en P5_OCRValidationScreen
- **THEN** se guarda el borrador local y P7_OfflineModal muestra "Se guardo un borrador"

### Requirement: Retomar borrador
El sistema SHALL permitir listar y continuar un borrador guardado.

#### Scenario: Continuar edicion
- **WHEN** el usuario toca "Ver Mis Borradores" y elige uno
- **THEN** se carga el borrador en el contexto y navega a P4_CreateReportScreen

### Requirement: Clave de operacion estable
El sistema SHALL conservar la misma `claveOperacion` del intento logico en borrador y reintentos.

#### Scenario: Reintento idempotente
- **WHEN** se reintenta el envio de un borrador
- **THEN** se reutiliza la `claveOperacion` guardada

### Requirement: Deteccion automatica de conectividad
El sistema SHALL detectar cambios de red y activar el modo offline automaticamente.

#### Scenario: Red perdida
- **WHEN** el dispositivo pierde conexion
- **THEN** NetInfo dispara el estado offline y se muestra el banner correspondiente

#### Scenario: Red recuperada
- **WHEN** el dispositivo recupera conexion
- **THEN** el sistema inicia la sincronizacion de borradores pendientes

### Requirement: Autosave cada 10 segundos
El sistema SHALL guardar el formulario en progreso automaticamente cada 10 segundos.

#### Scenario: Autosave periodico
- **WHEN** el usuario esta editando P4_CreateReportScreen
- **THEN** cada 10 segundos se persiste el borrador sin intervencion

### Requirement: Sincronizacion automatica
El sistema SHALL enviar automaticamente los borradores pendientes al recuperar conexion.

#### Scenario: Sincronizacion
- **WHEN** se recupera la conexion con borradores pendientes
- **THEN** el sistema los envia en orden y notifica el resultado

### Requirement: Cola con reintentos exponenciales
El sistema SHALL reintentar envios fallidos con backoff exponencial hasta un maximo de intentos.

#### Scenario: Backoff
- **WHEN** un envio falla repetidamente
- **THEN** el proximo reintento espera el doble que el anterior, hasta el limite configurado

### Requirement: Aviso borrador no enviado
El sistema SHALL mostrar un aviso permanente de que el borrador local no constituye una denuncia formal.

#### Scenario: Banner de aviso
- **WHEN** se visualiza un borrador guardado
- **THEN** se muestra "Este borrador esta guardado solo en su telefono"
