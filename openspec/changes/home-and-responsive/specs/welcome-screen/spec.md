# Spec Delta

## Purpose

Ofrece una pantalla de bienvenida con la identidad de la app (logo y eslogan) y accesos directos a las acciones principales, mostrada siempre al abrir la aplicacion.

## ADDED Requirements

### Requirement: Pantalla de bienvenida inicial
El sistema SHALL mostrar P0_WelcomeScreen como primera pantalla al abrir la app.

#### Scenario: Apertura de la app
- **WHEN** el usuario abre la aplicacion
- **THEN** ve primero P0_WelcomeScreen antes que cualquier otra pantalla

#### Scenario: Salir de la bienvenida
- **WHEN** el usuario elige una accion en P0
- **THEN** la app navega a la pantalla elegida sin dejar P0 en el historial de "atras"

### Requirement: Logo y eslogan
La pantalla de bienvenida SHALL mostrar el logo de Atenti y un eslogan.

#### Scenario: Identidad visible
- **WHEN** el usuario abre P0
- **THEN** ve el logo y el eslogan de la app

### Requirement: Accesos principales
P0 SHALL ofrecer accesos a buscar antecedentes, reportar una estafa e ingresar.

#### Scenario: Buscar
- **WHEN** el usuario toca "Buscar"
- **THEN** la app abre P1_HomeScreen

#### Scenario: Reportar sin sesion
- **WHEN** el usuario sin sesion toca "Reportar"
- **THEN** la app abre P3_LegalAuthScreen

#### Scenario: Reportar con sesion
- **WHEN** el usuario autenticado toca "Reportar"
- **THEN** la app abre P4_CreateReportScreen

### Requirement: Animacion de entrada
La bienvenida SHALL animar el logo al cargar.

#### Scenario: Animacion
- **WHEN** P0 termina de montar
- **THEN** el logo aparece con una animacion suave de opacidad y escala
