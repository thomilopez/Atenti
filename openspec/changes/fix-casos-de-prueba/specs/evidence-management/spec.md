# Spec Delta

## Purpose

Gestiona las evidencias de una denuncia de punta a punta: valida cantidad, tamano y formato, respeta los metadatos, las almacena en Cloud Storage y protege los datos sensibles en la vista publica.

## ADDED Requirements

### Requirement: Limites de evidencia en servidor
El sistema SHALL aplicar el maximo de 5 evidencias y 10MB por archivo en cliente, servicio y reglas de Storage.

#### Scenario: Sexto archivo
- **WHEN** el usuario intenta adjuntar una sexta evidencia
- **THEN** cliente y servidor la rechazan

#### Scenario: Archivo de 15MB
- **WHEN** el usuario intenta subir 15MB
- **THEN** el sistema lo rechaza antes de subirlo

### Requirement: Subida real a Cloud Storage
El sistema SHALL subir el archivo real con el filesystem del dispositivo y SHALL informar el fallo si Storage no responde.

#### Scenario: Subida exitosa
- **WHEN** se adjunta una imagen valida
- **THEN** queda en Storage y se guarda su referencia segura

#### Scenario: Subida fallida
- **WHEN** Storage rechaza el archivo
- **THEN** la app informa el error y no guarda una URI local como remota

### Requirement: Enmascaramiento publico irreversible
El sistema SHALL mostrar miniaturas enmascaradas en la vista publica y SHALL evitar exponer la URI original o descargable.

#### Scenario: Detalle publico
- **WHEN** un usuario sin permisos abre el detalle
- **THEN** no puede acceder al archivo original

#### Scenario: Admin
- **WHEN** un administrador autorizado abre la auditoria
- **THEN** puede ver la evidencia original

### Requirement: OCR sin falsos positivos
El sistema SHALL marcar las lecturas simuladas, SHALL devolver `matched = false` sin comparacion real y SHALL otorgar el bono solo con validacion del servidor.

#### Scenario: Simulado
- **WHEN** no hay Cloud Vision configurado
- **THEN** la evidencia se marca como simulada y no suma puntos

#### Scenario: Real
- **WHEN** el servidor extrae el identificador y coincide
- **THEN** la evidencia suma el bono y recalcula el score

### Requirement: Seleccion camara o galeria
El sistema SHALL ofrecer camara y galeria con permisos declarados en la configuracion.

#### Scenario: Camara
- **WHEN** el usuario toca "Tomar foto"
- **THEN** se solicita permiso y se abre la camara

### Requirement: Formatos y PDF con OCR
El sistema SHALL aceptar JPG, PNG y PDF, SHALL validar extension y MIME y SHALL aplicar OCR al PDF o rechazarlo si no puede procesarlo.

#### Scenario: Ejecutable
- **WHEN** el usuario intenta subir `.exe` o `.txt`
- **THEN** el sistema lo rechaza

#### Scenario: PDF sin OCR
- **WHEN** el PDF no puede procesarse
- **THEN** el sistema lo informa y no lo presenta como validado
