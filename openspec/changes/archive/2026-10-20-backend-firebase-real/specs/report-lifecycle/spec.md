# Spec Delta

## Purpose

Ciclo de vida real de las denuncias en Cloud Firestore: creacion con validaciones, codigo de seguimiento unico, idempotencia, maquina de estados con historial, edicion dentro de 24hs, borrado logico con justificacion y categorias parametricas.

## ADDED Requirements

### Requirement: Crear denuncia con datos completos
El sistema SHALL crear una denuncia con categoria, identificador, relato y ubicacion, persistiendola atomicamente en Firestore.

#### Scenario: Creacion exitosa
- **WHEN** el usuario completa P4_CreateReportScreen y P5_OCRValidationScreen
- **THEN** `registrarDenuncia` escribe denuncia, objetivo, ubicacion, evidencias, historial y auditoria en un unico batch

#### Scenario: Datos incompletos
- **WHEN** falta categoria, identificador o relato
- **THEN** el sistema bloquea el envio y muestra el campo faltante

### Requirement: Validacion RG-02 de relato y evidencia
El sistema SHALL impedir el envio si el relato tiene menos de 20 caracteres o no hay al menos una evidencia.

#### Scenario: Relato corto
- **WHEN** el relato tiene menos de 20 caracteres
- **THEN** el sistema muestra el contador en rojo y bloquea "Enviar Reporte"

#### Scenario: Sin evidencias
- **WHEN** no se adjunto ninguna evidencia
- **THEN** el sistema bloquea el envio y avisa que falta al menos una evidencia

### Requirement: Ubicacion obligatoria para Local Fisico (RG-03)
El sistema SHALL exigir un pin en el mapa cuando la categoria es LOCAL_FISICO.

#### Scenario: Categoria Local Fisico
- **WHEN** el usuario selecciona "Local Fisico" en P4_CreateReportScreen
- **THEN** el mapa se vuelve obligatorio y el envio se bloquea sin pin

### Requirement: Codigo de seguimiento unico
El sistema SHALL generar un codigo `AT-2026-XXXXXX` secuencial y unico por denuncia.

#### Scenario: Codigo generado
- **WHEN** se crea una denuncia
- **THEN** se asigna un codigo con formato `AT-2026-` seguido de 6 digitos

### Requirement: Idempotencia por clave de operacion
El sistema SHALL evitar duplicados usando la `claveOperacion` generada por el cliente y reutilizada en reintentos.

#### Scenario: Reintento no duplica
- **WHEN** se reintenta el envio con la misma `claveOperacion`
- **THEN** el sistema devuelve el codigo original sin crear una segunda denuncia

### Requirement: Maquina de estados de denuncia
El sistema SHALL manejar el flujo RECIBIDA -> PUBLICADA -> EN_DISPUTA -> RESUELTA sin saltos.

#### Scenario: Transicion valida
- **WHEN** una denuncia RECIBIDA con score >= 20 se publica
- **THEN** el estado pasa a PUBLICADA y se registra el evento

#### Scenario: Transicion ilegal
- **WHEN** se intenta pasar de RECIBIDA a EN_DISPUTA directamente
- **THEN** el sistema lanza `IllegalStateTransitionError`

### Requirement: Historial de cambios de estado
El sistema SHALL registrar cada transicion con fecha, actor y nota, y mantener la invariante I-05.

#### Scenario: Historial consistente
- **WHEN** se realiza una transicion
- **THEN** el estado actual coincide con el destino del ultimo evento de historial

#### Scenario: Resolucion exige nota (RG-11)
- **WHEN** se resuelve una disputa sin nota
- **THEN** el sistema rechaza la transicion

### Requirement: Editar denuncia propia en 24hs
El sistema SHALL permitir corregir la denuncia dentro de las 24hs posteriores al envio.

#### Scenario: Dentro de la ventana
- **WHEN** pasaron menos de 24hs desde la creacion
- **THEN** P12_EditReport habilita los campos y muestra la cuenta regresiva

#### Scenario: Fuera de la ventana
- **WHEN** pasaron mas de 24hs
- **THEN** el sistema bloquea la edicion

### Requirement: Eliminar denuncia propia (soft delete)
El sistema SHALL eliminar la denuncia de forma logica exigiendo un motivo justificativo.

#### Scenario: Borrado con motivo
- **WHEN** el usuario escribe un motivo y confirma
- **THEN** la denuncia queda marcada como eliminada y desaparece del listado publico

### Requirement: Categorias parametricas
El sistema SHALL mantener un catalogo de categorias configurable por admin.

#### Scenario: Listar categorias activas
- **WHEN** se carga el formulario
- **THEN** se muestran solo las categorias activas del catalogo
