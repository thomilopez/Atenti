# Spec Delta

## Purpose

Ciclo de vida real de las denuncias en Cloud Firestore: creacion con validaciones, codigo de seguimiento unico, idempotencia, maquina de estados con historial, edicion dentro de 24hs, borrado logico con justificacion y categorias parametricas.

## ADDED Requirements

### Requirement: Codigo de seguimiento de seis digitos
El sistema SHALL generar codigos `AT-2026-XXXXXX` de seis digitos y SHALL normalizar codigos historicos al consultarlos.

#### Scenario: Alta
- **WHEN** se crea una denuncia
- **THEN** el codigo cumple `AT-2026-\d{6}`

#### Scenario: Codigo historico
- **WHEN** se consulta un codigo de cuatro digitos existente
- **THEN** el sistema lo normaliza o informa el formato sin romper la busqueda

### Requirement: Idempotencia atomica
El sistema SHALL resolver el alta y `denuncias_by_clave` en una transaccion para que dos envios concurrentes no dupliquen la denuncia.

#### Scenario: Doble clic
- **WHEN** se envia dos veces la misma `claveOperacion`
- **THEN** solo existe una denuncia y ambos reciben el mismo codigo

### Requirement: Historial persistido en Firestore
El sistema SHALL guardar cada transicion en `historialEstado` con `serverTimestamp` y SHALL reconstruir el historial desde Firestore al reiniciar.

#### Scenario: Relectura
- **WHEN** se abre el detalle o la auditoria tras reiniciar
- **THEN** el historial se lee de Firestore, no de memoria

### Requirement: Ownership y ventana de 24hs
El sistema SHALL validar en el servicio que el actor sea el dueno y que hayan pasado menos de 24hs antes de editar o eliminar.

#### Scenario: Edicion valida
- **WHEN** el dueno edita antes de 24hs
- **THEN** se actualiza y se registra el evento

#### Scenario: Edicion invalida
- **WHEN** el actor no es el dueno o pasaron 24hs
- **THEN** el servicio rechaza la operacion

### Requirement: Errores de persistencia visibles
El sistema SHALL propagar los errores de Firestore y SHALL impedir que la UI confirme una denuncia no persistida.

#### Scenario: Fallo de escritura
- **WHEN** Firestore rechaza la escritura
- **THEN** la app muestra el error y no navega al exito

### Requirement: Listar denuncias propias
El sistema SHALL listar solo las denuncias del usuario autenticado, incluyendo todos sus estados.

#### Scenario: Mis Denuncias
- **WHEN** el usuario abre P10_MisDenunciasScreen
- **THEN** ve sus denuncias en todos los estados, sin mezclar las de terceros

### Requirement: Limpieza del flujo
El sistema SHALL limpiar formulario, borrador y `claveOperacion` al completar o abandonar un envio.

#### Scenario: Nuevo reporte
- **WHEN** el usuario inicia otro reporte tras enviar
- **THEN** el formulario esta vacio y la clave es nueva
