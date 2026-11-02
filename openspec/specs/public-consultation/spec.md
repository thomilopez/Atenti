# public-consultation Specification

## Purpose
Consulta publica de antecedentes: busqueda por Alias/CBU/Tel/Local con resultados que muestran semaforo y score, detalle enmascarado, busqueda tolerante a errores, filtros avanzados, paginacion, consulta por codigo de seguimiento y exclusion de denuncias en disputa.

## Requirements

### Requirement: Buscar por identificador
El sistema SHALL permitir buscar antecedentes ingresando un Alias, CBU, telefono o nombre de comercio.

#### Scenario: Busqueda por CBU
- **WHEN** el usuario ingresa un CBU en P1_HomeScreen
- **THEN** el sistema devuelve las denuncias asociadas a ese identificador normalizado

### Requirement: Resultados con semaforo y score
El sistema SHALL mostrar en cada resultado el semaforo de credibilidad y el puntaje.

#### Scenario: Tarjeta de resultado
- **WHEN** se listan resultados
- **THEN** cada tarjeta muestra identificador, cantidad de denuncias, semaforo y score

### Requirement: Detalle publico enmascarado
El sistema SHALL mostrar el detalle publico ocultando datos sensibles del denunciante y de terceros.

#### Scenario: Detalle anonimizado
- **WHEN** un usuario consulta P2_ReportDetailScreen
- **THEN** no se expone uid, email ni IP y los identificadores aparecen enmascarados

### Requirement: Busqueda tolerante a errores
El sistema SHALL devolver resultados relevantes ante pequenas diferencias tipograficas.

#### Scenario: Sugerencia
- **WHEN** el usuario escribe un Alias con un error de tipeo
- **THEN** el sistema sugiere "Quiso decir..." con la coincidencia cercana

### Requirement: Filtros avanzados
El sistema SHALL permitir filtrar resultados por rango de fechas, categoria y score minimo.

#### Scenario: Filtro por score
- **WHEN** el usuario fija un score minimo
- **THEN** solo se muestran denuncias con credibilidad igual o superior

### Requirement: Paginacion de resultados
El sistema SHALL cargar resultados de forma paginada para optimizar el rendimiento.

#### Scenario: Scroll infinito
- **WHEN** el usuario se desplaza al final de la lista
- **THEN** se cargan los siguientes resultados automaticamente

### Requirement: Consultar estado por codigo
El sistema SHALL permitir a cualquier persona consultar el estado de una denuncia por su codigo sin iniciar sesion.

#### Scenario: Consulta publica
- **WHEN** se ingresa un codigo `AT-2026-XXXXXX` en P11_TrackingCodeScreen
- **THEN** se muestra la ficha resumen del estado sin pedir credenciales

#### Scenario: Codigo inexistente
- **WHEN** el codigo no existe
- **THEN** el sistema muestra un mensaje de no encontrado

### Requirement: Ocultar denuncias en disputa
El sistema SHALL excluir las denuncias en estado EN_DISPUTA de los resultados publicos.

#### Scenario: Disputa oculta
- **WHEN** una denuncia esta EN_DISPUTA
- **THEN** no aparece en busquedas ni en consulta por codigo
