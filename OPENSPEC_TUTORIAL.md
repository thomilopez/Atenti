# Tutorial: Usando OpenSpec en Atenti

OpenSpec está instalado y configurado en tu proyecto Atenti. Este tutorial te guía paso a paso.

---

## 🎯 ¿Qué es OpenSpec?

OpenSpec añade una capa ligera de **especificaciones (specs)** antes de escribir código. Tú y la IA acuerdan **qué** construir antes de **cómo** hacerlo.

**Flujo básico:**
```
/opsx:explore     → Pensar juntos, sin código
/opsx:propose     → Crear plan (propuesta, specs, diseño, tareas)
/opsx:apply       → Implementar tareas
/opsx:archive     → Archivar, actualizar specs
```

---

## 🚀 Inicio Rápido: Tu Primera Feature

### 1. Explora una idea (sin compromiso)
```
/opsx:explore
```
> **Ejemplo:** "Quiero agregar notificaciones push para alertas cercanas"
> - La IA lee tu código (Firebase, navegación, screens)
> - Te propone opciones técnicas
> - Tú decides si procedes

### 2. Propón la feature
```
/opsx:propose agregar-notificaciones-push
```
Crea en `openspec/changes/agregar-notificaciones-push/`:
```
├── proposal.md   # Qué, por qué, alcance
├── specs/        # Requisitos + escenarios (Dado/Cuando/Entonces)
├── design.md     # Enfoque técnico (archivos, APIs, datos)
└── tasks.md      # Checklist de implementación
```

### 3. Revisa y aprueba
Lee los archivos creados. Si algo no te convence, edita directamente o pide cambios:
> "En design.md, usa expo-notifications en lugar de firebase messaging directamente"

### 4. Implementa
```
/opsx:apply
```
La IA ejecuta las tareas de `tasks.md` una a una, mostrando progreso.

### 5. Verifica
```bash
npm run verify
```

### 6. Archiva
```
/opsx:archive
```
Mueve el cambio a `openspec/changes/archive/YYYY-MM-DD-agregar-notificaciones-push/` y actualiza specs globales en `openspec/specs/`.

---

## 📁 Estructura en tu Proyecto

```
atenti/
├── .claude/
│   ├── commands/opsx/     # 6 comandos slash (/opsx:propose, /opsx:apply, etc.)
│   └── skills/            # 6 skills internas de OpenSpec
├── openspec/
│   ├── config.yaml        # Tu configuración (ya personalizada para Atenti)
│   ├── specs/             # Specs globales vivas (requisitos actuales del app)
│   └── changes/           # Cambios en curso y archivados
│       ├── agregar-notificaciones-push/    # En curso
│       └── archive/
│           └── 2025-01-15-agregar-dark-mode/  # Historial
└── src/                   # Tu código Expo (sin cambios)
```

---

## 🛠 Comandos Disponibles

| Comando | Uso |
|---------|-----|
| `/opsx:explore` | Conversación exploratoria, sin código |
| `/opsx:propose <tema>` | Crea plan completo en `openspec/changes/` |
| `/opsx:apply` | Implementa tareas del cambio actual |
| `/opsx:archive` | Archiva y actualiza specs globales |
| `/opsx:update` | Regenera comandos/skills si actualizas OpenSpec |
| `/opsx:sync` | Sincroniza specs con un Store externo (beta) |

> **Nota:** En Claude Code se usan con `/opsx:`. En Cursor/Copilot pueden ser `/opsx-propose`, `@opsx-propose`, etc. `openspec init` te dice la forma exacta.

---

## 🎯 Ejemplos Prácticos para Atenti

### Agregar pantalla de historial de reportes
```
/opsx:propose historial-reportes
```
- Crea `P10_HistoryScreen.tsx`
- Usa `firebase.ts` para queries
- Añade a `AppNavigator.tsx` y `BottomNavBar.tsx`

### Mejorar scoring de credibilidad
```
/opsx:propose mejorar-credibilidad
```
- Modifica `src/services/credibility.ts`
- Añade tests en `scripts/verify-block-a.js`
- Actualiza `P9_CredibilityPanelScreen.tsx`

### Modo offline robusto
```
/opsx:propose offline-robusto
```
- Extiende `src/services/draftStorage.ts`
- Mejora sincronización en `firebase.ts`
- Añade indicador visual en `BottomNavBar.tsx`

---

## 💡 Mejores Prácticas

1. **Empieza con `/opsx:explore`** si no tienes claro el enfoque
2. **Revisa `proposal.md` y `design.md`** antes de `/opsx:apply`
3. **Edita specs en `openspec/specs/`** — son la verdad viva del proyecto
4. **Usa `/opsx:archive` siempre** — mantiene historial limpio
5. **Ejecuta `npm run verify`** después de cada apply

---

## 🔧 Personalización (opcional)

Edita `openspec/config.yaml` para:
- Añadir reglas por artefacto (`rules.proposal`, `rules.tasks`)
- Guiar `apply` y `archive` (`operations.apply.guidance`)
- Cambiar perfil a "extended" para más comandos:
  ```bash
  openspec config profile extended
  openspec update
  ```

---

## 📚 Recursos

- **Docs oficiales:** https://openspec.dev/docs
- **Quickstart:** https://openspec.dev/docs/quickstart
- **CLI reference:** https://openspec.dev/docs/cli
- **Personalización:** https://openspec.dev/docs/customize
- **Discord:** https://discord.gg/YctCnvvshC

---

## ✅ Checklist de Inicio

- [x] `npm install -g @fission-ai/openspec@latest`
- [x] `openspec init` (hecho)
- [x] Configurado `openspec/config.yaml` para Atenti
- [ ] Prueba: `/opsx:explore` con una idea simple
- [ ] Prueba: `/opsx:propose` para una feature real
- [ ] Prueba: `/opsx:apply` + `npm run verify`
- [ ] Prueba: `/opsx:archive`

---

**¿Listo? Escribe `/opsx:explore` y cuéntale a la IA qué quieres construir.**