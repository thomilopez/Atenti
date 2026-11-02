# Spec Delta

## Purpose

Permite fijar la ubicacion escribiendo una direccion o moviendo un pin, con campos completos, geocodificacion directa, mapa expandible y manejo offline, manteniendo direccion y pin sincronizados.

## ADDED Requirements

### Requirement: Direccion manual
El sistema SHALL permitir escribir una direccion con calle, numero, localidad, provincia, codigo postal y referencia.

#### Scenario: Completar direccion
- **WHEN** el usuario completa los campos de direccion en P4
- **THEN** el sistema acepta la direccion como ubicacion del reporte

#### Scenario: Campo obligatorio
- **WHEN** falta la calle o la localidad
- **THEN** el sistema marca el campo faltante y no avanza

### Requirement: Geocodificacion directa
El sistema SHALL convertir una direccion escrita en coordenadas y mover el pin.

#### Scenario: Direccion encontrada
- **WHEN** el usuario busca una direccion valida
- **THEN** el pin se mueve a esas coordenadas y se muestra la ubicacion confirmada

#### Scenario: Direccion no encontrada
- **WHEN** la direccion no se puede geocodificar
- **THEN** el sistema avisa y conserva la ubicacion anterior

### Requirement: Sincronizacion pin y direccion
El sistema SHALL mantener sincronizados el pin y la direccion.

#### Scenario: Mover el pin
- **WHEN** el usuario mueve el pin
- **THEN** la direccion se actualiza con la geocodificacion inversa

#### Scenario: Editar la direccion
- **WHEN** el usuario cambia la direccion escrita
- **THEN** el pin se reposiciona al confirmar la busqueda

### Requirement: Mapa expandible
El sistema SHALL abrir un mapa a pantalla completa para ajustar la ubicacion, con buscador de direccion dentro.

#### Scenario: Abrir mapa
- **WHEN** el usuario toca "Agrandar mapa" en P4
- **THEN** se abre un modal a pantalla completa con el mapa y el buscador

#### Scenario: Confirmar ubicacion
- **WHEN** el usuario confirma en el modal
- **THEN** la ubicacion elegida se aplica al formulario

### Requirement: Direccion sin verificar offline
El sistema SHALL permitir guardar la direccion como texto cuando no hay red.

#### Scenario: Sin conexion
- **WHEN** el usuario escribe una direccion sin conexion
- **THEN** se guarda el texto marcado como "direccion sin verificar"

### Requirement: Privacidad de la ubicacion publica
La vista publica SHALL mostrar una zona aproximada en lugar de la direccion exacta.

#### Scenario: Vista publica
- **WHEN** otro usuario consulta el detalle de una denuncia
- **THEN** ve una zona aproximada y no la direccion exacta
