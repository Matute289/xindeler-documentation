---
sidebar_position: 2
---

# Git Flow

Convenciones de branching y commits en Xindeler.

## Branches

| Branch | Descripción |
|--------|-------------|
| `main` | Siempre estable y deployable. Protegida — solo merge por PR aprobado. |
| `feat/*` | Nueva funcionalidad. Se crea desde `main`, se mergea a `main`. |
| `fix/*` | Corrección de bug. |
| `chore/*` | Refactor, limpieza, actualización de dependencias. |
| `docs/*` | Cambios solo de documentación. |

No existen branches `develop`, `staging` ni `release` — el modelo es trunk-based simplificado.

---

## Flujo estándar

```
main ──────────────────────────────────────────► main
         │                              ▲
         └─── feat/nueva-habilidad ─────┘
              (commits incrementales)
```

1. Crear branch desde `main` actualizado
2. Commitear con frecuencia en la branch
3. Abrir PR contra `main`
4. Pasar review y CI
5. Merge a `main` (squash o merge commit, según prefiera el reviewer)

---

## Formato de commits

```
tipo: descripción corta en minúsculas (máx. 72 caracteres)

Cuerpo opcional explicando el por qué, no el qué.
El qué lo explica el código.
```

### Tipos válidos

| Tipo | Cuándo |
|------|--------|
| `feat` | Nueva funcionalidad visible para el jugador o contributor |
| `fix` | Corrección de bug |
| `refactor` | Cambio interno sin cambio de comportamiento |
| `chore` | Dependencias, CI, configuración |
| `docs` | Solo documentación |
| `test` | Agregar o arreglar tests |
| `perf` | Mejora de performance |

### Ejemplos

```bash
feat: add parry window to sword combo
fix: correct backstab damage multiplier for rogue
refactor: split CombatSystem into attack and defense phases
docs: document RON format for ability definitions
chore: update quinn to 0.11
```

---

## Reglas de la branch `main`

- **No se pushea directo** — todo entra por PR
- **Requiere 1 aprobación** del maintainer (@Matute289)
- **CI debe pasar** (`cargo build`, `cargo clippy`, `cargo test`)
- El maintainer puede hacer merge sin PR (bypass) para hotfixes urgentes

---

## Resolución de conflictos

Si tu branch divergió de `main`, rebaseá en lugar de mergear:

```bash
git fetch upstream
git rebase upstream/main
```

Resolvé los conflictos archivo por archivo, luego:

```bash
git add <archivo-resuelto>
git rebase --continue
git push origin feat/tu-branch --force-with-lease
```

Usá `--force-with-lease` en lugar de `--force` — falla si alguien más pusheó a tu branch mientras tanto.
