# Spec Delta

## Purpose

Arquitectura offline-first real: borradores en AsyncStorage con autosave cada 10 segundos, deteccion automatica de conectividad, cola de sincronizacion con reintentos exponenciales y aviso de que el borrador no equivale a una denuncia enviada.

## ADDED Requirements

### Requirement: Reintento automatico con temporizador
El sistema SHALL procesar la cola al recuperar conexion y SHALL reintentar con temporizador o al volver a primer plano, no solo en la transicion de red.

#### Scenario: Red recuperada
- **WHEN** la conexion vuelve y el usuario sigue en la app
- **THEN** la cola se procesa sin tocar "Reintentar"

### Requirement: Cola con fallidos visibles
El sistema SHALL conservar las entradas agotadas como fallidas y visibles para reintento manual, sin descartarlas silenciosamente.

#### Scenario: Maximo de intentos
- **WHEN** una entrada supera el maximo
- **THEN** queda como fallida y el usuario puede reintentarla

### Requirement: Aviso borrador versus enviado
El sistema SHALL distinguir borrador local de denuncia enviada y SHALL afirmar "borrador guardado" solo si la persistencia local termino bien.

#### Scenario: Error de red
- **WHEN** el envio falla por red y el borrador se guarda
- **THEN** el banner indica borrador pendiente y que no es una denuncia formal

#### Scenario: Error no de red
- **WHEN** el envio falla por permisos o validacion
- **THEN** el sistema muestra el error real, no un mensaje offline

### Requirement: Clave regenerada tras exito
El sistema SHALL conservar la clave en borradores y reintentos y SHALL regenerarla al iniciar un nuevo reporte despues de un envio exitoso.

#### Scenario: Nuevo reporte
- **WHEN** el usuario envia una denuncia y empieza otra
- **THEN** la nueva clave es distinta y no devuelve el reporte anterior
