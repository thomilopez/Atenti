# Spec Delta

## ADDED Requirements

### Requirement: Mapa expandible para captura
El sistema SHALL ofrecer un modal a pantalla completa para ajustar la ubicacion del reporte.

#### Scenario: Abrir modal de mapa
- **WHEN** el usuario toca "Agrandar mapa" en P4
- **THEN** se abre un modal a pantalla completa con el mapa

#### Scenario: Buscar dentro del mapa
- **WHEN** el usuario escribe una direccion dentro del modal
- **THEN** el mapa se mueve y el pin queda en el resultado

#### Scenario: Confirmar
- **WHEN** el usuario confirma el pin en el modal
- **THEN** la ubicacion se aplica al formulario
