# Spec Delta

## Purpose

Mejora el descubrimiento de antecedentes con autocompletado y busqueda tolerante a errores tipograficos, para que el usuario encuentre reportes aunque escriba el identificador de forma imperfecta.

## ADDED Requirements

### Requirement: Busqueda normalizada y fuzzy en resultados
El sistema SHALL normalizar el identificador antes de comparar y SHALL aplicar fuzzy matching tambien en P13_SearchResultsScreen.

#### Scenario: Error tipografico
- **WHEN** el usuario busca `ju.mo` y existe `ju.mp`
- **THEN** aparece el resultado con "Quiso decir ju.mp"

#### Scenario: Telefono con prefijos
- **WHEN** el usuario busca un telefono con espacios o prefijos
- **THEN** el sistema compara contra el valor normalizado

### Requirement: Filtros con fechas normalizadas
El sistema SHALL interpretar `hasta` como fin del dia y SHALL rechazar fechas invalidas en lugar de ignorarlas.

#### Scenario: Filtro hasta
- **WHEN** el usuario elige una fecha hasta
- **THEN** se incluyen las denuncias de ese dia completo
