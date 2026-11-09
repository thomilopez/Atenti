# Spec Delta

## Purpose

Consulta publica de antecedentes: busqueda por Alias/CBU/Tel/Local con resultados que muestran semaforo y score, detalle enmascarado, busqueda tolerante a errores, filtros avanzados, paginacion, consulta por codigo de seguimiento y exclusion de denuncias en disputa.

## ADDED Requirements

### Requirement: Resultados con semaforo y score reales
El sistema SHALL mostrar en cada resultado el semaforo de 4 colores y el porcentaje numerico de credibilidad.

#### Scenario: P13
- **WHEN** el usuario busca un identificador
- **THEN** cada tarjeta muestra color, etiqueta y score reales

### Requirement: Detalle publico con evidencia enmascarada
El sistema SHALL ocultar datos sensibles y SHALL mostrar evidencias enmascaradas de forma irreversible.

#### Scenario: Evidencia publica
- **WHEN** un usuario sin permisos abre el detalle
- **THEN** no puede acceder a la imagen original

### Requirement: Paginacion server-side
El sistema SHALL cargar resultados con `limit` y `startAfter` de Firestore, no con un slice sobre toda la coleccion.

#### Scenario: Scroll
- **WHEN** el usuario llega al final
- **THEN** se solicitan los siguientes resultados sin recargar todo

### Requirement: Consulta publica por codigo persistida
El sistema SHALL permitir consultar el estado por codigo sin login, leyendo Firestore y normalizando guiones, espacios y mayusculas.

#### Scenario: Consulta anonima
- **WHEN** un usuario sin sesion ingresa un codigo valido
- **THEN** ve el estado actualizado aunque la app se haya reiniciado

#### Scenario: Inexistente
- **WHEN** el codigo no existe o fue eliminado
- **THEN** el sistema muestra "no encontrado" sin revelar datos

### Requirement: Take-down sin cache stale
El sistema SHALL excluir las denuncias EN_DISPUTA y SHALL invalidar la cache al cambiar de estado.

#### Scenario: Take-down
- **WHEN** una denuncia pasa a EN_DISPUTA
- **THEN** deja de aparecer en la siguiente busqueda y en el mapa
