# Spec Delta

## ADDED Requirements

### Requirement: Reglas de relatos
El sistema SHALL regular el acceso a `relatos`, `story_subscriptions` y `story_reports` por estado y autenticacion.

#### Scenario: Lectura publica
- **WHEN** un usuario consulta el feed
- **THEN** solo se leen relatos PUBLICADA

#### Scenario: Creacion autenticada
- **WHEN** un usuario crea un relato
- **THEN** requiere sesion y queda EN_REVISION

### Requirement: Indices de relatos
El sistema SHALL contar con indices para listar relatos por estado/categoria/fecha y para buscar por identificador.

#### Scenario: Consulta indexada
- **WHEN** se filtra el feed por categoria y fecha
- **THEN** la consulta usa el indice correspondiente
