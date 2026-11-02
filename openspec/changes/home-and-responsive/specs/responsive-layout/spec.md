# Spec Delta

## Purpose

Adapta la interfaz a distintos tamanos de pantalla (celulares chicos, medianos, grandes y tablets) manteniendo alturas flexibles, navegacion comoda y teclado sin tapar campos.

## ADDED Requirements

### Requirement: Breakpoints de pantalla
El sistema SHALL clasificar el ancho de pantalla en chico, medio, grande y tablet.

#### Scenario: Celular chico
- **WHEN** el ancho es menor a 360px
- **THEN** la UI usa margenes y tamanos reducidos

#### Scenario: Tablet
- **WHEN** el ancho es 768px o mas
- **THEN** el contenido se centra con un ancho maximo legible

### Requirement: Alturas flexibles
Las pantallas SHALL evitar alturas fijas para areas grandes como el mapa.

#### Scenario: Mapa adaptable
- **WHEN** cambia el alto de la pantalla
- **THEN** el mapa y los paneles se adaptan sin desbordar ni dejar espacios vacios

### Requirement: Teclado
Los formularios SHALL evitar que el teclado tape los campos y botones.

#### Scenario: Escribir en un formulario
- **WHEN** el usuario abre el teclado en un formulario
- **THEN** el campo activo y el boton principal siguen visibles

### Requirement: Orientacion
La app SHALL mantenerse en orientacion vertical y soportar tablets.

#### Scenario: Tablet en vertical
- **WHEN** la app corre en una tablet en vertical
- **THEN** la interfaz se adapta con contenido centrado y sin estirar en exceso
