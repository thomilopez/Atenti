# report-validation Specification

## Purpose
Asegura que toda denuncia creada cumpla las reglas de negocio RG-02 (relato y evidencia minimos) y RG-03 (ubicacion obligatoria para locales fisicos), tanto en la interfaz como en el servicio de registro.

## Requirements

### Requirement: Relato minimo de 20 caracteres
El sistema SHALL impedir el envio de una denuncia cuyo relato tenga menos de 20 caracteres y SHALL mostrar un contador en tiempo real.

#### Scenario: Relato corto
- **WHEN** el usuario escribe un relato de 12 caracteres en P4_CreateReportScreen
- **THEN** el contador se muestra en rojo y el boton "Siguiente" queda bloqueado

#### Scenario: Relato suficiente
- **WHEN** el relato alcanza los 20 caracteres
- **THEN** el contador pasa a verde y el sistema permite continuar

### Requirement: Al menos una evidencia
El sistema SHALL impedir el envio de una denuncia sin evidencias adjuntas.

#### Scenario: Sin evidencias
- **WHEN** el usuario intenta enviar en P5_OCRValidationScreen sin evidencias
- **THEN** el sistema muestra un aviso y no registra la denuncia

#### Scenario: Con evidencia
- **WHEN** hay al menos una evidencia adjunta
- **THEN** el boton "Enviar Reporte" se habilita

### Requirement: Ubicacion obligatoria segun categoria
El sistema SHALL exigir un pin confirmado cuando la categoria seleccionada requiere ubicacion (RG-03).

#### Scenario: Categoria que requiere ubicacion
- **WHEN** el usuario selecciona "Local Fisico Ilícito" y no confirmo un pin
- **THEN** el sistema bloquea el avance y pide fijar la ubicacion en el mapa

#### Scenario: Categoria sin requisito
- **WHEN** la categoria no requiere ubicacion
- **THEN** el sistema permite avanzar sin exigir pin

### Requirement: Validacion en el servicio de registro
El servicio de registro SHALL rechazar denuncias que no cumplan RG-02, aun si la interfaz fuera evadida.

#### Scenario: Registro invalido
- **WHEN** se invoca el registro con relato corto o sin evidencias
- **THEN** el servicio lanza un error y no persiste la denuncia

#### Scenario: Registro valido
- **WHEN** el relato tiene 20 o mas caracteres y hay al menos una evidencia
- **THEN** el servicio persiste la denuncia normalmente
