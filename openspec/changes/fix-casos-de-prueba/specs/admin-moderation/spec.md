# Spec Delta

## Purpose

Brinda herramientas de moderacion y administracion: panel de denuncias en disputa, resolucion de disputas, auditoria completa, gestion de categorias y usuarios, metricas y exportacion de datos anonimizados.

## ADDED Requirements

### Requirement: Disputas reales desde Firestore
El sistema SHALL listar las denuncias EN_DISPUTA leyendo Firestore, aunque la consulta publica solo muestre PUBLICADA.

#### Scenario: Dashboard
- **WHEN** el administrador abre P14_AdminDashboardScreen
- **THEN** ve todas las disputas persistidas con codigo, categoria, score y fecha

### Requirement: Resolucion con nota obligatoria
El sistema SHALL exigir nota tanto para mantener como para retirar una denuncia y SHALL registrar actor, fecha y evento de auditoria.

#### Scenario: Mantener con nota
- **WHEN** el administrador mantiene publicada con nota
- **THEN** la denuncia pasa a PUBLICADA y se registra el evento

#### Scenario: Sin nota
- **WHEN** el administrador intenta resolver sin nota
- **THEN** el sistema rechaza la accion

### Requirement: Auditoria persistida
El sistema SHALL mostrar uid, email, IP, timestamp, evidencias e historial leidos desde Firestore, incluyendo transiciones e impugnaciones.

#### Scenario: P18 tras reiniciar
- **WHEN** el administrador abre la auditoria
- **THEN** ve los eventos reales aunque la app se haya reiniciado

### Requirement: Suspension efectiva
El sistema SHALL persistir la suspension en `usuarios/{uid}` y SHALL aplicarla al login y a la creacion de denuncias.

#### Scenario: Usuario suspendido
- **WHEN** el administrador suspende una cuenta
- **THEN** el usuario no puede ingresar ni denunciar hasta ser reactivado

### Requirement: Exportacion anonimizada robusta
El sistema SHALL exportar sin email, uid ni IP, SHALL hashear o eliminar el codigo de seguimiento y SHALL truncar la fecha.

#### Scenario: Dataset
- **WHEN** el administrador descarga el dataset
- **THEN** el CSV no permite reidentificar al denunciante ni al denunciado

### Requirement: Auditoria de acciones administrativas
El sistema SHALL registrar transiciones, resoluciones, impugnaciones y suspensiones en `audit_logs` con actor, nota y timestamp.

#### Scenario: Resolucion
- **WHEN** se resuelve una disputa
- **THEN** queda un evento con actor y nota
