# Spec Delta

## Purpose

Lleva el mapa a un uso real: centra en la ubicacion del dispositivo, permite fijar y arrastrar un pin con direccion, filtra por radio, agrupa pines y muestra un mapa de calor de incidencias.

## ADDED Requirements

### Requirement: Pin exacto por tap o arrastre
El sistema SHALL permitir fijar el pin tocando el mapa o arrastrandolo, en nativo y web, y SHALL actualizar la direccion al moverlo.

#### Scenario: Tap
- **WHEN** el usuario toca un punto del mapa
- **THEN** el pin se mueve y se geocodifica la direccion

#### Scenario: Arrastre
- **WHEN** el usuario arrastra el pin
- **THEN** la ubicacion se actualiza y se marca como confirmada

### Requirement: Filtro efectivo por radio
El sistema SHALL filtrar realmente las denuncias por distancia Haversine desde el centro seleccionado, ademas de dibujar el circulo.

#### Scenario: Radio de 5km
- **WHEN** el usuario activa 5km
- **THEN** los pines fuera del radio dejan de renderizarse

#### Scenario: Cambio de centro
- **WHEN** el usuario usa "mi ubicacion"
- **THEN** el filtro se recalcula desde la ubicacion actual

### Requirement: Clusters expansibles
El sistema SHALL agrupar pines cercanos y, al tocar un cluster, SHALL expandir el grupo o hacer zoom en lugar de abrir un unico reporte arbitrario.

#### Scenario: Cluster
- **WHEN** el usuario toca un cluster
- **THEN** el mapa hace zoom al area o muestra el listado agrupado

### Requirement: Heatmap con datos reales
El sistema SHALL generar el heatmap desde las denuncias reales y SHALL ofrecer una representacion equivalente en web.

#### Scenario: Capa de calor
- **WHEN** se activa el heatmap
- **THEN** la densidad se calcula sobre Firestore, no sobre datos semilla
