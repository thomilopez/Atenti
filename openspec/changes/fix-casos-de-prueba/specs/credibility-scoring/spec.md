# Spec Delta

## Purpose

Unifica el calculo de credibilidad RG-07 en una sola formula, muestra el nivel con un semaforo de 4 colores, expone el desglose de puntos, recalcula al agregar evidencias validas y conserva el historial de cambios.

## ADDED Requirements

### Requirement: Identidad real en el score persistido
El sistema SHALL calcular y persistir el score con los factores reales del usuario y SHALL hacer que coincida con el score mostrado en la app.

#### Scenario: Registro
- **WHEN** se crea una denuncia
- **THEN** el score guardado usa los factores verificados y coincide con el de la UI

### Requirement: Semaforo unico de cuatro colores
El sistema SHALL clasificar la credibilidad en Gris, Rojo, Naranja y Amarillo y SHALL usar la misma clasificacion en pines, detalle, resultados y panel.

#### Scenario: Detalle
- **WHEN** el usuario abre P2_ReportDetailScreen
- **THEN** ve el color y la etiqueta del score real

### Requirement: Desglose real por componente
El sistema SHALL mostrar Identidad, Evidencias y Corroboracion calculadas con los datos reales, sin porcentajes ficticios.

#### Scenario: Panel
- **WHEN** el usuario abre P9_CredibilityPanelScreen
- **THEN** ve el desglose real

### Requirement: Recalculo solo con OCR real
El sistema SHALL recalcular y persistir el score cuando una evidencia tenga OCR validado por el servidor y SHALL no modificarlo con simulaciones.

#### Scenario: OCR real
- **WHEN** se adjunta una evidencia con coincidencia real
- **THEN** el score sube y se registra el motivo

#### Scenario: OCR simulado
- **WHEN** la evidencia es simulada
- **THEN** el score no cambia

### Requirement: Historial de score persistido
El sistema SHALL registrar cada cambio de score con fecha de servidor y motivo, y SHALL reconstruirlo desde Firestore.

#### Scenario: Cambio de score
- **WHEN** cambia el score por evidencia, edicion o resolucion
- **THEN** queda un documento en `historialScore` visible en el detalle
