# Spec Delta

## Purpose

Logica de servidor ejecutada en Cloud Functions: OCR real con Cloud Vision API, validacion de coincidencia OCR contra el identificador denunciado, rate limiting por usuario y dia, deteccion de spam por contenido similar y validaciones de formato CBU y telefono.

## ADDED Requirements

### Requirement: OCR real con Cloud Vision
El sistema SHALL procesar las evidencias con la Cloud Vision API para extraer CBU, Alias o CUIT.

#### Scenario: Extraccion exitosa
- **WHEN** se sube un comprobante bancario
- **THEN** la Cloud Function devuelve el texto detectado y el identificador extraido

### Requirement: Validar coincidencia OCR
El sistema SHALL comparar el identificador extraido por OCR con el identificador denunciado y alertar en caso de discrepancia.

#### Scenario: Coincidencia
- **WHEN** el CBU detectado en la imagen coincide con el CBU denunciado
- **THEN** se suma el bono de consistencia al score

#### Scenario: Discrepancia
- **WHEN** el CBU detectado no coincide con el denunciado
- **THEN** se muestra un banner amarillo advirtiendo la diferencia

### Requirement: Rate limiting por usuario y dia
El sistema SHALL limitar la cantidad maxima de denuncias que un usuario puede crear por dia.

#### Scenario: Limite alcanzado
- **WHEN** un usuario supera el maximo diario configurado
- **THEN** el sistema bloquea el envio y muestra el mensaje de limite

### Requirement: Deteccion de spam y duplicados
El sistema SHALL detectar contenido identico o muy similar a denuncias recientes y advertir antes de enviar.

#### Scenario: Duplicado detectado
- **WHEN** el relato y el identificador coinciden con una denuncia reciente
- **THEN** el sistema muestra una alerta previa para revisar el reporte

### Requirement: Validacion de formato CBU
El sistema SHALL verificar que el CBU tenga 22 digitos y digito verificador valido.

#### Scenario: CBU invalido
- **WHEN** el CBU no pasa el checksum
- **THEN** el campo se marca en rojo y se bloquea el envio

### Requirement: Validacion de telefono E.164
El sistema SHALL validar y normalizar numeros telefonicos argentinos al formato E.164.

#### Scenario: Normalizacion
- **WHEN** se ingresa un telefono con prefijos locales
- **THEN** se normaliza a `+54` y se valida la longitud
