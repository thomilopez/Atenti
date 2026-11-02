# geo-mapping Specification

## Purpose
Lleva el mapa a un uso real: centra en la ubicacion del dispositivo, permite fijar y arrastrar un pin con direccion, filtra por radio, agrupa pines y muestra un mapa de calor de incidencias.

## Requirements

### Requirement: Geolocalizacion del dispositivo
El sistema SHALL centrar el mapa en la ubicacion GPS actual cuando el usuario lo solicite.

#### Scenario: Mi ubicacion
- **WHEN** el usuario toca el boton de ubicacion en el mapa
- **THEN** el mapa se centra en sus coordenadas actuales

#### Scenario: Permiso denegado
- **WHEN** el usuario niega el permiso de ubicacion
- **THEN** el sistema informa que no puede centrar el mapa y mantiene la vista actual

### Requirement: Pin arrastrable con direccion
El sistema SHALL permitir arrastrar el pin para fijar el lugar y mostrar la direccion postal correspondiente.

#### Scenario: Mover el pin
- **WHEN** el usuario arrastra el pin a otra posicion en P4_CreateReportScreen
- **THEN** la direccion mostrada se actualiza con la nueva ubicacion

### Requirement: Geocodificacion inversa
El sistema SHALL convertir las coordenadas del pin en una direccion postal legible.

#### Scenario: Direccion detectada
- **WHEN** el usuario confirma una ubicacion
- **THEN** se muestra calle, numero y localidad asociados a las coordenadas

### Requirement: Filtro por radio
El sistema SHALL permitir filtrar las denuncias visibles por distancia desde la ubicacion del usuario.

#### Scenario: Ajustar radio
- **WHEN** el usuario cambia el radio de busqueda (por ejemplo a 5km)
- **THEN** el mapa redibuja el circulo y muestra solo las denuncias dentro del radio

### Requirement: Agrupacion de pines
El sistema SHALL agrupar pines cercanos en clusters que se expanden al hacer zoom.

#### Scenario: Zona densa
- **WHEN** hay muchas denuncias cercanas y el usuario esta alejado
- **THEN** se muestra un cluster con la cantidad de denuncias en lugar de pines individuales

### Requirement: Mapa de calor
El sistema SHALL ofrecer una capa de heatmap que muestre la densidad de denuncias por zona.

#### Scenario: Activar heatmap
- **WHEN** el usuario activa la vista de calor
- **THEN** el mapa muestra gradientes de color segun la densidad de denuncias

### Requirement: Claves de Google Maps
El sistema SHALL usar claves de Google Maps configurables por entorno para Android, iOS y Web.

#### Scenario: Clave configurada
- **WHEN** `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` esta definida
- **THEN** el mapa nativo de Google se renderiza con esa clave
