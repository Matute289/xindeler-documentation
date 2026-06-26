# 007 — Contribución esencial: como-empezar, git-flow, code-style

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 2

## Páginas a crear

### contribucion/como-empezar.md
- Fork del repo en GitHub
- Clonar y configurar git
- Primer build exitoso (referencia a task 005)
- Crear un branch de feature
- Abrir un PR
- Ciclo de revisión

### contribucion/git-flow.md
Branching strategy consistente con xindeler-web-landing:
- `main` — rama protegida, producción
- `feat/nombre-descriptivo` — features nuevas
- `fix/nombre-descriptivo` — bugfixes
- `chore/nombre-descriptivo` — cambios de infraestructura
- PRs requieren 1 aprobación del owner
- No force push a main

### contribucion/code-style.md
- `rustfmt` es obligatorio: `cargo fmt` antes de hacer PR
- `clippy` sin warnings: `cargo clippy -- -D warnings`
- Nombres: snake_case para funciones/variables, PascalCase para tipos/structs/enums
- Documentación de funciones públicas: solo si el "why" no es obvio
- Sin commented-out code en PRs
- Sin `unwrap()` en código de servidor (usar `?` o `log` + `continue`)
