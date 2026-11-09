# Spec Delta

## Purpose

Configuracion de plataforma y produccion: variables de entorno validadas, reglas de seguridad de Firestore por rol y estado, indices compuestos para busquedas, rendimiento objetivo y disponibilidad del servicio gestionado.

## ADDED Requirements

### Requirement: Claves sin hardcodear
El sistema SHALL cargar la clave de Google Maps desde variables de entorno y SHALL evitar claves hardcodeadas en el codigo o el manifest nativo.

#### Scenario: Compilacion
- **WHEN** se compila la app
- **THEN** la clave proviene de `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### Requirement: Plugins de permisos
El sistema SHALL declarar los plugins de `expo-location`, `expo-image-picker` y `expo-document-picker` con sus mensajes de permiso.

#### Scenario: Camara y GPS
- **WHEN** el usuario usa camara o ubicacion
- **THEN** se solicitan los permisos declarados en Android e iOS

### Requirement: Rendimiento con debounce y paginacion
El sistema SHALL aplicar debounce a la busqueda y paginacion en Firestore para responder en menos de 2 segundos.

#### Scenario: Escritura rapida
- **WHEN** el usuario escribe en la Home
- **THEN** no se dispara una consulta por tecla
