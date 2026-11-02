# Spec Delta

## Purpose

Permite a la comunidad compartir y consultar relatos de nuevas formas de estafar, con senales de alerta, identificadores vinculados, corroboraciones y contenido moderado.

## ADDED Requirements

### Requirement: Feed de relatos
El sistema SHALL mostrar un feed de relatos publicados con busqueda, filtros y paginacion.

#### Scenario: Ver feed
- **WHEN** el usuario abre P27_StoriesFeed
- **THEN** ve los relatos PUBLICADA ordenados por fecha

#### Scenario: Filtrar
- **WHEN** el usuario filtra por categoria o fecha
- **THEN** el feed muestra solo los relatos que coinciden

#### Scenario: Sin relatos
- **WHEN** no hay relatos publicados
- **THEN** se muestra un estado vacio con el aviso de moderacion

### Requirement: Contar una nueva forma de estafar
El sistema SHALL permitir crear un relato con titulo, categoria, modus operandi, senales de alerta e identificadores opcionales.

#### Scenario: Crear relato
- **WHEN** el usuario completa el formulario de P29_CreateStory
- **THEN** el relato se guarda en estado EN_REVISION

#### Scenario: Aviso de revision
- **WHEN** el relato se envia
- **THEN** el sistema avisa que puede tardar hasta 24hs en publicarse

#### Scenario: Datos incompletos
- **WHEN** falta el titulo, la categoria o el modus operandi
- **THEN** el sistema bloquea el envio

### Requirement: Victima o testigo
El sistema SHALL permitir indicar si el autor fue victima o solo vio/se entero de la estafa.

#### Scenario: Testigo
- **WHEN** el autor marca "lo vi / me entere"
- **THEN** el relato se publica sin exigir que haya sido victima

### Requirement: Senales de alerta estructuradas
El sistema SHALL permitir cargar senales de alerta como checklist ademas del relato libre.

#### Scenario: Senales visibles
- **WHEN** el usuario abre el detalle de un relato
- **THEN** ve las senales de alerta en formato checklist

### Requirement: Identificadores vinculados
El sistema SHALL permitir vincular un relato a Alias/CBU/CUIT/Tel/Local normalizados.

#### Scenario: Relato relacionado
- **WHEN** el usuario busca un identificador
- **THEN** ve los relatos vinculados a ese identificador

### Requirement: Corroboracion "me paso / lo vi"
El sistema SHALL permitir sumar corroboraciones a un relato.

#### Scenario: Sumar corroboracion
- **WHEN** el usuario toca "me paso / lo vi"
- **THEN** el contador del relato aumenta

### Requirement: Compartir y reportar abuso
El sistema SHALL permitir compartir un relato por WhatsApp y reportar contenido inapropiado.

#### Scenario: Compartir
- **WHEN** el usuario toca compartir
- **THEN** se abre WhatsApp con el texto del relato

#### Scenario: Reportar
- **WHEN** el usuario reporta un relato
- **THEN** se registra para revision del admin

### Requirement: Disclaimer y normas
El sistema SHALL mostrar que los relatos son contenido generado por usuarios y no acusaciones, junto con las normas de la comunidad.

#### Scenario: Disclaimer
- **WHEN** el usuario abre el feed o el detalle
- **THEN** ve el aviso legal y el acceso a las normas

### Requirement: Borradores de relatos
El sistema SHALL guardar borradores de relatos para continuar despues.

#### Scenario: Borrador
- **WHEN** el usuario guarda un relato incompleto
- **THEN** puede retomarlo desde "mis relatos"

### Requirement: Tab Historias
El sistema SHALL agregar una tab Historias en la barra inferior.

#### Scenario: Abrir Historias
- **WHEN** el usuario toca la tab Historias
- **THEN** se abre P27_StoriesFeed
