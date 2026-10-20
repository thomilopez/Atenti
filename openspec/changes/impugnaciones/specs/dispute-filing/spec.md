# Spec Delta

## Purpose

Permite a una persona o comercio reportado presentar una impugnacion con su identificacion y descargo, aplicando un take-down inmediato de la denuncia y avisando al denunciante original.

## ADDED Requirements

### Requirement: Presentar una impugnacion
El sistema SHALL permitir presentar una impugnacion indicando CUIT/DNI y un descargo.

#### Scenario: Impugnacion valida
- **WHEN** el usuario completa CUIT/DNI y descargo en P21_Impugnacion para una denuncia
- **THEN** se registra la impugnacion asociada a esa denuncia

#### Scenario: Datos incompletos
- **WHEN** falta el CUIT/DNI o el descargo
- **THEN** el sistema bloquea el envio y muestra el campo faltante

### Requirement: Validacion del identificador del impugnante
El sistema SHALL aceptar CUIT/DNI compuesto solo por digitos con longitud razonable.

#### Scenario: Documento invalido
- **WHEN** el usuario ingresa letras o menos de 7 digitos
- **THEN** el sistema rechaza el identificador

### Requirement: Take-down inmediato
El sistema SHALL pasar la denuncia a EN_DISPUTA al registrarse la impugnacion.

#### Scenario: Take-down
- **WHEN** se confirma una impugnacion
- **THEN** la denuncia deja de ser PUBLICADA y pasa a EN_DISPUTA

#### Scenario: Ocultamiento del buscador
- **WHEN** una denuncia esta EN_DISPUTA
- **THEN** no aparece en la busqueda publica ni en la consulta por codigo

### Requirement: Notificacion al denunciante
El sistema SHALL registrar una notificacion in-app para el denunciante original.

#### Scenario: Aviso de impugnacion
- **WHEN** se registra una impugnacion
- **THEN** el denunciante original recibe una notificacion con el codigo de la denuncia
