# Spec Delta

## ADDED Requirements

### Requirement: Mapa completo separado del inicio
El sistema SHALL ofrecer una pantalla de mapa a pantalla completa independiente del inicio.

#### Scenario: Ver mapa completo
- **WHEN** el usuario toca "Ver mapa completo" en P1
- **THEN** se abre P31_FullMapScreen con el mapa y sus controles

#### Scenario: Volver
- **WHEN** el usuario vuelve desde P31
- **THEN** regresa a P1_HomeScreen

### Requirement: Preview de mapa en el inicio
El sistema SHALL mostrar una vista previa compacta del mapa en el inicio.

#### Scenario: Preview
- **WHEN** el usuario abre P1
- **THEN** ve un mapa reducido con las denuncias y un acceso al mapa completo
