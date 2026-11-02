# search-discovery Specification

## Purpose
Mejora el descubrimiento de antecedentes con autocompletado y busqueda tolerante a errores tipograficos, para que el usuario encuentre reportes aunque escriba el identificador de forma imperfecta.

## Requirements

### Requirement: Autocompletado de identificadores
El sistema SHALL sugerir identificadores mientras el usuario escribe en el buscador principal.

#### Scenario: Sugerencias visibles
- **WHEN** el usuario escribe al menos 2 caracteres en P1_HomeScreen
- **THEN** se muestran sugerencias de identificadores coincidentes

#### Scenario: Seleccionar sugerencia
- **WHEN** el usuario toca una sugerencia
- **THEN** el buscador se completa con ese identificador y sus resultados

### Requirement: Busqueda tolerante a errores
El sistema SHALL devolver resultados aunque el identificador tenga pequenas diferencias tipograficas.

#### Scenario: Error de tipeo
- **WHEN** el usuario busca un Alias con un caracter equivocado
- **THEN** la busqueda igualmente encuentra la coincidencia cercana

### Requirement: Sugerencia de correccion
El sistema SHALL sugerir "Quiso decir..." cuando detecte una coincidencia cercana a la consulta.

#### Scenario: Sugerencia de correccion
- **WHEN** la consulta no coincide exactamente pero se parece a un identificador existente
- **THEN** se muestra la sugerencia con la coincidencia mas cercana
