# Spec Delta

## ADDED Requirements

### Requirement: Direccion verificada
El sistema SHALL distinguir una direccion verificada de una guardada como texto sin verificar.

#### Scenario: Direccion verificada
- **WHEN** la direccion se obtuvo por geocodificacion
- **THEN** se marca como verificada

#### Scenario: Direccion sin verificar
- **WHEN** la direccion se guardo como texto sin red
- **THEN** se muestra el aviso "direccion sin verificar"

### Requirement: Ubicacion obligatoria con pin confirmado
El sistema SHALL exigir un pin confirmado para las categorias que requieren ubicacion.

#### Scenario: Categoria con ubicacion
- **WHEN** el usuario elige una categoria con `requiereUbicacion`
- **THEN** no puede avanzar sin un pin confirmado o una direccion verificada
