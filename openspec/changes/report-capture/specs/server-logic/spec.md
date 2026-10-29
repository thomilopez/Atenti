# Spec Delta

## ADDED Requirements

### Requirement: OCR con CUIT
El sistema SHALL extraer y comparar CUIT al procesar evidencias.

#### Scenario: CUIT en comprobante
- **WHEN** el OCR detecta un CUIT en la evidencia
- **THEN** lo compara con el CUIT denunciado y marca la coincidencia o discrepancia
