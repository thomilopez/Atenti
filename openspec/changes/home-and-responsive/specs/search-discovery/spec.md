# Spec Delta

## ADDED Requirements

### Requirement: Buscador protagonico en el inicio
El sistema SHALL presentar el buscador como elemento principal de P1_HomeScreen.

#### Scenario: Inicio
- **WHEN** el usuario abre P1
- **THEN** el buscador ocupa el lugar mas visible y el mapa se muestra como preview compacto

### Requirement: Busquedas recientes
El sistema SHALL recordar las ultimas busquedas del usuario y mostrarlas como accesos rapidos.

#### Scenario: Busqueda previa
- **WHEN** el usuario ya realizo una busqueda
- **THEN** aparece en "Recientes" al volver al inicio

#### Scenario: Limpiar recientes
- **WHEN** el usuario borra sus busquedas recientes
- **THEN** la lista de recientes queda vacia

### Requirement: Tendencias de busqueda
El sistema SHALL sugerir identificadores frecuentes como tendencias.

#### Scenario: Ver tendencias
- **WHEN** el usuario abre P1
- **THEN** ve una lista breve de identificadores frecuentes para tocar y buscar

### Requirement: Carga con skeleton
El sistema SHALL mostrar placeholders de carga mientras obtiene datos del inicio.

#### Scenario: Mientras carga
- **WHEN** los datos del inicio todavia no estan disponibles
- **THEN** se muestra un skeleton en lugar de una pantalla vacia
