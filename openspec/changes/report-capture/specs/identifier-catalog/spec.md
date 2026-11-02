# Spec Delta

## Purpose

Incorpora CUIT como identificador valido (con checksum y enmascaramiento) y amplia el catalogo de categorias con icono y color.

## ADDED Requirements

### Requirement: Identificador CUIT
El sistema SHALL aceptar CUIT como tipo de identificador, normalizarlo a 11 digitos y validar su checksum AFIP.

#### Scenario: CUIT valido
- **WHEN** el usuario ingresa un CUIT con checksum correcto
- **THEN** el sistema lo acepta y permite continuar

#### Scenario: CUIT invalido
- **WHEN** el CUIT tiene menos de 11 digitos o checksum incorrecto
- **THEN** el sistema lo rechaza con un mensaje claro

### Requirement: Enmascaramiento de CUIT
La vista publica SHALL enmascarar el CUIT salvo los extremos.

#### Scenario: CUIT publico
- **WHEN** se muestra un CUIT en la vista publica
- **THEN** se ve con formato enmascarado (por ejemplo `20-******-*`)

### Requirement: CUIT buscable y corroborable
El sistema SHALL permitir buscar por CUIT y agrupar denuncias por CUIT normalizado.

#### Scenario: Buscar por CUIT
- **WHEN** el usuario busca un CUIT
- **THEN** obtiene las denuncias y relatos asociados

### Requirement: Categorias con icono y color
El sistema SHALL permitir que cada categoria tenga icono y color, y SHALL mostrar mas categorias por defecto.

#### Scenario: Mostrar categoria
- **WHEN** el usuario abre el selector de categorias
- **THEN** ve el icono y el color de cada categoria activa

#### Scenario: Nueva categoria por defecto
- **WHEN** se siembra el catalogo
- **THEN** incluye las categorias ampliadas definidas por el proyecto
