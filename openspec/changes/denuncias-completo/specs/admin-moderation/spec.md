# Spec Delta

## Purpose

Brinda herramientas de moderacion y administracion: panel de denuncias en disputa, resolucion de disputas, auditoria completa, gestion de categorias y usuarios, metricas y exportacion de datos anonimizados.

## ADDED Requirements

### Requirement: Acceso al panel de administracion
El sistema SHALL restringir el panel de administracion a usuarios autorizados segun la configuracion de administradores.

#### Scenario: Usuario administrador
- **WHEN** un usuario autorizado abre P20_SettingsScreen
- **THEN** ve la opcion "Panel de administracion"

#### Scenario: Usuario comun
- **WHEN** un usuario no autorizado intenta acceder
- **THEN** el sistema no muestra la opcion y bloquea la navegacion

### Requirement: Dashboard de denuncias en disputa
El sistema SHALL listar las denuncias en estado EN_DISPUTA con sus datos clave para moderacion.

#### Scenario: Listado de disputas
- **WHEN** el administrador abre P14_AdminDashboardScreen
- **THEN** ve las denuncias EN_DISPUTA con codigo, categoria, score y fecha

#### Scenario: Sin disputas
- **WHEN** no hay denuncias EN_DISPUTA
- **THEN** el panel muestra un estado vacio informativo

### Requirement: Mantener denuncia publicada
El sistema SHALL permitir resolver una disputa manteniendo la denuncia publicada, registrando actor y nota.

#### Scenario: Mantener publicada
- **WHEN** el administrador elige "Mantener publicada" con una nota
- **THEN** la denuncia pasa de EN_DISPUTA a PUBLICADA y se registra el evento de historial

### Requirement: Retirar denuncia
El sistema SHALL permitir resolver una disputa retirando la denuncia, exigiendo una nota justificativa.

#### Scenario: Retirar con nota
- **WHEN** el administrador elige "Retirar denuncia" e ingresa una nota
- **THEN** la denuncia pasa de EN_DISPUTA a RESUELTA y deja de ser visible publicamente

#### Scenario: Retirar sin nota
- **WHEN** el administrador intenta retirar sin nota
- **THEN** el sistema rechaza la accion

### Requirement: Ver auditoria completa
El sistema SHALL permitir al administrador ver los metadatos de auditoria sin censura de una denuncia.

#### Scenario: Auditoria
- **WHEN** el administrador abre P18_AdminAuditScreen para una denuncia
- **THEN** ve uid, email, IP, timestamp, evidencias originales e historial de estados

### Requirement: Gestionar categorias
El sistema SHALL permitir al administrador crear, editar, activar y desactivar categorias con su flag de ubicacion obligatoria.

#### Scenario: Desactivar categoria
- **WHEN** el administrador desactiva una categoria en P16_AdminCategoriesScreen
- **THEN** deja de aparecer en el formulario de P4_CreateReportScreen

#### Scenario: Crear categoria
- **WHEN** el administrador crea una categoria con `requiereUbicacion`
- **THEN** queda disponible en el catalogo activo

### Requirement: Gestionar usuarios
El sistema SHALL permitir al administrador ver usuarios y suspender cuentas.

#### Scenario: Suspender usuario
- **WHEN** el administrador suspende a un usuario en P17_AdminUsersScreen
- **THEN** el usuario queda marcado como suspendido

### Requirement: Metricas de administracion
El sistema SHALL mostrar denuncias por dia, score promedio y categorias mas reportadas.

#### Scenario: Metricas visibles
- **WHEN** el administrador abre el panel
- **THEN** ve los indicadores calculados sobre las denuncias existentes

### Requirement: Exportar dataset anonimizado
El sistema SHALL permitir descargar un dataset sin datos personales para analisis.

#### Scenario: Exportacion anonima
- **WHEN** el administrador solicita el dataset anonimizado
- **THEN** obtiene un CSV sin email, uid ni IP
