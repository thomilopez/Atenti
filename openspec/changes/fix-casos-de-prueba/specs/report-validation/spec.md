# Spec Delta

## Purpose

Asegura que toda denuncia creada cumpla las reglas de negocio RG-02 (relato y evidencia minimos) y RG-03 (ubicacion obligatoria para locales fisicos), tanto en la interfaz como en el servicio de registro.

## ADDED Requirements

### Requirement: Validacion de Alias
El sistema SHALL exigir al menos una letra, longitud minima y caracteres permitidos en un Alias, y SHALL normalizarlo antes de guardar.

#### Scenario: Alias valido
- **WHEN** el alias tiene letras, numeros, punto o guion
- **THEN** el formulario permite avanzar

#### Scenario: Alias invalido
- **WHEN** el alias tiene solo numeros o es demasiado corto
- **THEN** el formulario bloquea el avance

### Requirement: Validacion de telefono E.164
El sistema SHALL normalizar telefonos argentinos a `+54 9` + 10 digitos y SHALL rechazar longitudes o prefijos invalidos.

#### Scenario: Movil
- **WHEN** el usuario ingresa `011 15-3849-2018`
- **THEN** el sistema lo normaliza a `+5491138492018`

#### Scenario: Invalido
- **WHEN** el telefono tiene menos de 10 digitos o un prefijo incorrecto
- **THEN** el sistema muestra el error

### Requirement: Validacion de CBU
El sistema SHALL aceptar solo CBU numericos de 22 digitos con checksum valido e impedir el ingreso de mas digitos.

#### Scenario: CBU invalido
- **WHEN** el usuario ingresa 21 digitos, letras o checksum incorrecto
- **THEN** el formulario bloquea el avance

### Requirement: Validacion de Local Fisico y pin confirmado
El sistema SHALL exigir direccion o pin confirmado por interaccion para Local Fisico y SHALL distinguir un pin precargado de uno confirmado.

#### Scenario: Pin confirmado
- **WHEN** el usuario toca o arrastra el pin, o geocodifica una direccion
- **THEN** `pinConfirmado = true` y puede avanzar

#### Scenario: Pin precargado
- **WHEN** el mapa abre con una ubicacion por defecto sin interaccion
- **THEN** el sistema no la considera confirmada

### Requirement: Validacion integral en el servicio
El servicio de registro SHALL rechazar relatos cortos, falta de evidencia, ubicacion requerida ausente e identificadores invalidos aunque la UI sea evadida.

#### Scenario: Evasion
- **WHEN** se llama al servicio con datos invalidos
- **THEN** devuelve error tipado y no persiste
