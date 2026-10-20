# Spec Delta

## Purpose

Filtra el lenguaje ofensivo en los relatos: lo sustituye en la interfaz y lo valida en el servicio de registro para evitar contenido inapropiado.

## ADDED Requirements

### Requirement: Sustitucion de terminos ofensivos
El sistema SHALL sustituir los terminos ofensivos por asteriscos mientras el usuario escribe.

#### Scenario: Termino ofensivo
- **WHEN** el usuario escribe una palabra del lexico ofensivo en el relato
- **THEN** la palabra se muestra parcialmente enmascarada con asteriscos

#### Scenario: Texto limpio
- **WHEN** el relato no contiene terminos ofensivos
- **THEN** el texto se mantiene sin cambios

### Requirement: Validacion en el servicio de registro
El servicio de registro SHALL sanitizar el relato antes de persistirlo.

#### Scenario: Registro sanitizado
- **WHEN** se registra una denuncia con lenguaje ofensivo
- **THEN** el relato guardado queda enmascarado

#### Scenario: Deteccion
- **WHEN** el texto contiene terminos del lexico
- **THEN** el sistema puede informar que se aplico el filtro
