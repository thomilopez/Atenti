# Spec Delta

## ADDED Requirements

### Requirement: CUIT en la busqueda
El sistema SHALL incluir CUIT entre los tipos de identificador buscables y autocompletables.

#### Scenario: Chip CUIT
- **WHEN** el usuario abre el inicio o los resultados
- **THEN** ve el chip CUIT junto a Alias, CBU, Tel y Local

#### Scenario: Autocompletar CUIT
- **WHEN** el usuario escribe un CUIT
- **THEN** recibe sugerencias y resultados de CUIT
