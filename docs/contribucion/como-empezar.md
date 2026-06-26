---
sidebar_position: 1
---

# Cómo empezar

Guía para hacer tu primera contribución a Xindeler.

## Prerequisitos

- Rust nightly instalado (ver [Instalación local](/proyecto/instalacion-local))
- Cuenta en GitHub
- Git configurado localmente

---

## 1. Fork y clone

Hacé fork del repo en GitHub y clonalo:

```bash
git clone https://github.com/TU_USUARIO/xindeler
cd xindeler
git remote add upstream https://github.com/Matute289/xindeler
```

El remote `upstream` te permite traer cambios del repo oficial.

---

## 2. Sincronizar con upstream

Antes de empezar cualquier tarea, siempre sincronizá tu fork:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

---

## 3. Crear una branch

Nunca trabajes directo en `main`. Creá una branch desde `main`:

```bash
git checkout -b feat/nombre-descriptivo
```

Convenciones de prefijo:

| Prefijo | Cuándo usarlo |
|---------|---------------|
| `feat/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `chore/` | Refactor, limpieza, dependencias |
| `docs/` | Solo documentación |

---

## 4. Hacer cambios y commitear

Trabajá en tu branch con commits frecuentes. Cada commit debe compilar:

```bash
cargo build        # verificar que compila
cargo clippy       # verificar que pasa el linter
cargo test         # correr los tests

git add src/...    # agregá solo los archivos relevantes
git commit -m "feat: descripción concisa del cambio"
```

El formato del mensaje de commit es `tipo: descripción en minúsculas`. Ver [Git Flow](./git-flow) para detalles.

---

## 5. Abrir el PR

```bash
git push origin feat/nombre-descriptivo
```

Luego abrí el PR en GitHub contra `main` del repo upstream (`Matute289/xindeler`). En la descripción incluí:

- Qué cambia y por qué
- Cómo probarlo
- Screenshots si hay cambios visuales

---

## 6. Revisión y merge

- Un maintainer revisará el PR y puede pedir cambios
- Respondé los comentarios con nuevos commits en la misma branch — no abras un PR nuevo
- Una vez aprobado, el maintainer hace el merge

---

## Buenas prácticas

- **Un PR por funcionalidad** — PRs pequeños y enfocados se revisan más rápido
- **Tests para bugs** — Si corregís un bug, agregá un test que lo reproduzca
- **No rompas la build** — `cargo build` y `cargo clippy` deben pasar antes de pushear
- **Commits atómicos** — Cada commit debe dejar el repo en un estado funcional
