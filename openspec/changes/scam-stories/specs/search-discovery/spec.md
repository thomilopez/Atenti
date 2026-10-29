# Spec Delta

## ADDED Requirements

### Requirement: Relatos relacionados por identificador
El sistema SHALL mostrar relatos vinculados al buscar un identificador.

#### Scenario: Buscar identificador
- **WHEN** el usuario busca un Alias, CBU, CUIT, Tel o Local
- **THEN** se muestran los relatos PUBLICADA vinculados a ese identificador

#### Scenario: Sin relatos
- **WHEN** no hay relatos para el identificador
- **THEN** la seccion de relatos relacionados no se muestra
