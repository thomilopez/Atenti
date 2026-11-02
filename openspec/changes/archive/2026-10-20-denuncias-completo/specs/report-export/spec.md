# Spec Delta

## Purpose

Permite exportar la ficha publica de una denuncia a PDF o CSV con un codigo de autenticidad verificable, manteniendo el enmascaramiento de datos sensibles.

## ADDED Requirements

### Requirement: Exportar ficha a PDF
El sistema SHALL generar un PDF con la ficha publica de una denuncia.

#### Scenario: Exportacion PDF
- **WHEN** el usuario toca "Exportar PDF" en P2_ReportDetailScreen
- **THEN** se genera un archivo PDF con codigo, categoria, relato enmascarado y score

### Requirement: Exportar ficha a CSV
El sistema SHALL generar un CSV con los datos publicos de una denuncia.

#### Scenario: Exportacion CSV
- **WHEN** el usuario toca "Exportar CSV"
- **THEN** se genera un archivo CSV con los campos publicos de la ficha

### Requirement: Codigo de autenticidad
El sistema SHALL incluir un hash de autenticidad y un codigo QR que permita verificar la ficha exportada.

#### Scenario: Ficha autentica
- **WHEN** se exporta una ficha
- **THEN** el PDF incluye el hash de autenticidad y la pantalla muestra el QR del codigo de seguimiento

### Requirement: Datos enmascarados en la exportacion
La exportacion publica SHALL excluir uid, email e IP y SHALL mantener los identificadores enmascarados.

#### Scenario: Export sin PII
- **WHEN** se exporta la ficha publica
- **THEN** el archivo no contiene email, uid ni IP del denunciante
