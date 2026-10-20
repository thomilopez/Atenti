# Spec Delta

## Purpose

Unifica el calculo de credibilidad RG-07 en una sola formula, muestra el nivel con un semaforo de 4 colores, expone el desglose de puntos, recalcula al agregar evidencias validas y conserva el historial de cambios.

## ADDED Requirements

### Requirement: Formula unificada
El sistema SHALL calcular la credibilidad con una unica formula: Identidad hasta 40, Evidencias hasta 45 y Corroboracion hasta 15.

#### Scenario: Formula consistente
- **WHEN** se calcula el score de una denuncia
- **THEN** el resultado es la suma de los tres componentes y nunca supera 100

#### Scenario: Sin valores fijos
- **WHEN** el usuario visualiza el score en P4 o P5
- **THEN** el porcentaje mostrado corresponde al calculo real, no a un valor fijo

### Requirement: Semaforo de 4 colores
El sistema SHALL clasificar la credibilidad en cuatro niveles: Gris, Rojo, Naranja y Amarillo.

#### Scenario: Nivel bajo
- **WHEN** el score es menor a 20
- **THEN** se muestra el nivel Gris (preliminar)

#### Scenario: Nivel alto
- **WHEN** el score es 75 o mas
- **THEN** se muestra el nivel Amarillo (alta veracidad)

### Requirement: Desglose visible de puntos
El sistema SHALL mostrar cuanto aporto cada componente y cada factor validado al score.

#### Scenario: Ver desglose
- **WHEN** el usuario abre el detalle o el panel de credibilidad
- **THEN** ve checklist con Identidad, Evidencias y Corroboracion y sus puntos

### Requirement: Recalculo al agregar evidencia
El sistema SHALL recalcular el score cuando se agrega una evidencia con OCR valido.

#### Scenario: Evidencia valida
- **WHEN** el usuario adjunta una evidencia y el OCR coincide con el objetivo
- **THEN** el score se actualiza y se notifica el incremento

### Requirement: Historial de score
El sistema SHALL registrar la evolucion del score de cada denuncia con fecha y motivo.

#### Scenario: Historial disponible
- **WHEN** se consulta una denuncia con cambios de score
- **THEN** se muestra la lista cronologica de variaciones

#### Scenario: Denuncia sin cambios
- **WHEN** la denuncia no tiene cambios de score registrados
- **THEN** se muestra un estado vacio informativo
