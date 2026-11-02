# Spec Delta

## Purpose

Configuracion de plataforma y produccion: variables de entorno validadas, reglas de seguridad de Firestore por rol y estado, indices compuestos para busquedas, rendimiento objetivo y disponibilidad del servicio gestionado.

## ADDED Requirements

### Requirement: Variables de entorno seguras
El sistema SHALL cargar y validar las credenciales de servicios desde variables de entorno sin exponerlas en el codigo.

#### Scenario: Entorno valido
- **WHEN** la app inicia con todas las variables requeridas
- **THEN** inicializa Firebase y los servicios externos correctamente

#### Scenario: Variable faltante
- **WHEN** falta una variable de entorno requerida
- **THEN** el sistema falla al inicio con un mensaje que indica cual falta

### Requirement: Reglas de Firestore por rol y estado
El sistema SHALL regular el acceso a las colecciones mediante reglas basadas en rol y estado del reporte.

#### Scenario: Anonimo solo lectura publica
- **WHEN** un usuario anonimo intenta escribir una denuncia
- **THEN** Firestore lo rechaza

#### Scenario: Comercio solo impugna
- **WHEN** un comercio (U3) intenta una accion fuera de impugnacion
- **THEN** Firestore lo rechaza

### Requirement: Indices compuestos
El sistema SHALL contar con indices compuestos que aceleren las consultas y filtros.

#### Scenario: Consulta indexada
- **WHEN** se filtra por estado y fecha
- **THEN** la consulta usa el indice compuesto correspondiente

### Requirement: Rendimiento de busqueda
El sistema SHALL responder busquedas de identificadores y renderizar pines en menos de 2 segundos.

#### Scenario: Respuesta rapida
- **WHEN** se busca un identificador sobre red 4G
- **THEN** los resultados aparecen en menos de 2 segundos

### Requirement: Disponibilidad del servicio
El sistema SHALL mantener una disponibilidad objetivo del 99.9% sobre la infraestructura gestionada.

#### Scenario: Monitoreo
- **WHEN** ocurre una caida
- **THEN** las herramientas de monitoreo registran el incidente para su seguimiento
