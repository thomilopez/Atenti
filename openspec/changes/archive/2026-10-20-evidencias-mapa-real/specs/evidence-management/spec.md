# Spec Delta

## Purpose

Gestiona las evidencias de una denuncia de punta a punta: valida cantidad, tamano y formato, respeta los metadatos, las almacena en Cloud Storage y protege los datos sensibles en la vista publica.

## ADDED Requirements

### Requirement: Limite de archivos y tamano
El sistema SHALL permitir hasta 5 evidencias por denuncia y SHALL rechazar archivos de mas de 10MB.

#### Scenario: Limite alcanzado
- **WHEN** el usuario ya adjunto 5 evidencias
- **THEN** el boton de agregar se deshabilita y muestra el contador 5/5

#### Scenario: Archivo demasiado grande
- **WHEN** el usuario selecciona un archivo de 12MB
- **THEN** el sistema muestra "El archivo supera los 10MB" y no lo adjunta

### Requirement: Formatos permitidos
El sistema SHALL aceptar solo imagenes JPG/PNG y documentos PDF.

#### Scenario: Formato invalido
- **WHEN** el usuario selecciona un archivo .exe
- **THEN** el sistema muestra "Formato no permitido. Subi JPG, PNG o PDF" y no lo adjunta

#### Scenario: Formato valido
- **WHEN** el usuario selecciona un JPG, PNG o PDF dentro de los limites
- **THEN** el archivo se adjunta a la lista de evidencias

### Requirement: Lectura de metadatos EXIF
El sistema SHALL leer los metadatos EXIF de las imagenes para registrar su origen sin exponerlos publicamente.

#### Scenario: Imagen con EXIF
- **WHEN** el usuario adjunta una imagen con metadatos
- **THEN** el sistema conserva la informacion tecnica necesaria y no la muestra en la vista publica

### Requirement: Almacenamiento en Cloud Storage
El sistema SHALL subir las evidencias a Cloud Storage y guardar la referencia segura.

#### Scenario: Subida exitosa
- **WHEN** el usuario adjunta una evidencia valida con Firebase configurado
- **THEN** el archivo se sube a Storage y la denuncia guarda su URL segura

#### Scenario: Modo demo
- **WHEN** no hay credenciales de Firebase
- **THEN** la evidencia se conserva localmente para no romper el flujo

### Requirement: Enmascaramiento publico
El sistema SHALL aplicar blur o enmascaramiento a las evidencias en la vista publica.

#### Scenario: Vista publica
- **WHEN** cualquier usuario consulta P2_ReportDetailScreen
- **THEN** las imagenes de evidencia se muestran con blur sobre los datos sensibles

#### Scenario: Vista admin
- **WHEN** el administrador abre la auditoria
- **THEN** puede ver las evidencias originales sin blur
