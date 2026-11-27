# Spec Delta

## Purpose

Extiende `responsive-layout` para que en pantallas anchas (escritorio / navegador de computadora >= 768px), todas las pantallas de la aplicación presenten su contenido en una columna legible de ancho máximo 720px y barras alineadas.

## ADDED Requirements

### Requirement: Columna centrada en todas las vistas de la app
Las 26 pantallas de la aplicación (incluyendo formularios, listas, feeds de historias, paneles de administración, mapas y vistas estáticas) SHALL mostrar su contenido en una columna centrada de ancho máximo 720px cuando el viewport mide 768px o más.

#### Scenario: Vistas con ScrollView
- **WHEN** la ventana mide 768px o más en pantallas con ScrollView
- **THEN** el contenido principal se limita a 720px y se alinea al centro sin estirarse

#### Scenario: Vistas con FlatList
- **WHEN** la ventana mide 768px o más en pantallas con FlatList
- **THEN** las tarjetas de las listas, las barras de búsqueda y las tiras de filtros se alinean en la misma columna de 720px

#### Scenario: Barras superiores y pies de acción
- **WHEN** la ventana mide 768px o más
- **THEN** las barras y pies conservan su borde y fondo a lo largo de todo el ancho de la pantalla pero contienen sus botones dentro de la columna centrada de 720px (compensando 32px de margen lateral)

#### Scenario: Mapa interactivo en pantalla completa
- **WHEN** se ingresa a P31_FullMapScreen en pantalla ancha
- **THEN** la barra de navegación superior se centra mientras que el mapa y sus controles permanecen en full-bleed

#### Scenario: Celular o viewport angosto
- **WHEN** el ancho de pantalla es menor a 768px
- **THEN** el estilo de centrado no tiene efecto (`maxWidth: undefined`) y se conserva la experiencia nativa de celular
