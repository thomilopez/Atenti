# Spec Delta

## Purpose

Filtra el lenguaje ofensivo en los relatos: lo sustituye en la interfaz y lo valida en el servicio de registro para evitar contenido inapropiado.

## ADDED Requirements

### Requirement: Normalizacion de acentos y separadores
El sistema SHALL normalizar acentos y mayusculas, SHALL detectar terminos separados por espacios o simbolos y SHALL evitar reenmascarar texto ya enmascarado.

#### Scenario: Termino separado
- **WHEN** el usuario escribe `p u t o` o una variante con acentos
- **THEN** el filtro lo detecta y lo sustituye

#### Scenario: Texto ya enmascarado
- **WHEN** el relato ya contiene asteriscos
- **THEN** el filtro no mueve el cursor ni reescribe el texto

### Requirement: Sanitizacion consistente en servidor
El servicio de registro SHALL aplicar la misma normalizacion y diccionario antes de persistir.

#### Scenario: Evasion de UI
- **WHEN** el cliente envia un relato ofensivo sin pasar por el filtro
- **THEN** el servicio lo sanitiza antes de guardar
