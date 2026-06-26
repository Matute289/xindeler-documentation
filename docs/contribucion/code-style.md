---
sidebar_position: 3
---

# Estilo de código

Convenciones de código en Xindeler. El 90% se aplica automáticamente con las herramientas — no hay que memorizarlo.

## Herramientas obligatorias

### rustfmt

Formatea el código automáticamente. No hay discusión sobre estilo de formato — `rustfmt` tiene la última palabra.

```bash
cargo fmt
```

La configuración está en `rustfmt.toml` en la raíz. Ejecutá `cargo fmt` antes de cada commit.

### clippy

Linter de Rust. Detecta patrones problemáticos, código ineficiente y errores comunes.

```bash
cargo clippy -- -D warnings
```

El flag `-D warnings` trata los warnings como errores — es lo que corre el CI. Tu código debe pasar sin warnings antes de abrir el PR.

Algunos lints útiles que clippy detecta en este proyecto:

```rust
// ❌ clippy::clone_on_copy
let x = some_u32.clone();   // u32 implementa Copy, .clone() es innecesario

// ✅
let x = some_u32;

// ❌ clippy::needless_pass_by_value
fn process(items: Vec<Item>) { ... }  // si no necesitás ownership

// ✅
fn process(items: &[Item]) { ... }
```

---

## Convenciones de nombres

Rust tiene convenciones fuertes y el compilador avisa cuando no se cumplen:

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Tipos, traits, enums | `UpperCamelCase` | `HealthComponent`, `CombatSystem` |
| Funciones, métodos, variables | `snake_case` | `apply_damage`, `max_health` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_PLAYERS`, `BASE_DAMAGE` |
| Módulos, crates | `snake_case` | `combat_sys`, `rtsim` |
| Archivos | `snake_case` | `combat_sys.rs`, `npc_mind.rs` |

### Nombres en este proyecto

Algunas convenciones específicas del codebase:

- Los sistemas ECS terminan en `_sys` o `System`: `CombatSystem`, `ai_sys.rs`
- Los componentes ECS terminan en `Comp` o son sustantivos simples: `Health`, `Energy`, `Pos`
- Los archivos RON usan el nombre del asset en `snake_case`: `iron_sword.ron`
- Los eventos del servidor usan `ServerEvent::Variante`

---

## Comentarios

Escribí comentarios solo cuando el **por qué** no es obvio. El qué ya lo dice el código.

```rust
// ❌ no aporta nada
// Incrementa el contador de kills
player.kills += 1;

// ✅ explica una decisión no obvia
// Usamos saturating_add para evitar overflow en counters de larga sesión
player.kills = player.kills.saturating_add(1);
```

Para funciones públicas en `common/`, sí se esperan doc comments (`///`) con una línea de descripción:

```rust
/// Returns the effective damage after applying armor mitigation.
pub fn mitigate_damage(raw: f32, armor: f32) -> f32 {
    raw * (1.0 - armor.min(0.9))
}
```

---

## Manejo de errores

- Usá `?` para propagar errores en lugar de `.unwrap()` en código de producción
- `.unwrap()` y `.expect()` están permitidos en tests y en situaciones donde el invariante es imposible de violar (documentarlo con un comentario)
- Preferí `Option` sobre valores centinela (`-1`, `""`, etc.)

```rust
// ❌ panic en producción
let item = inventory.get(slot).unwrap();

// ✅
let Some(item) = inventory.get(slot) else {
    return; // slot vacío, nada que hacer
};
```

---

## Performance

- Evitá allocaciones en sistemas ECS que corren cada tick — usá slices y referencias donde sea posible
- Preferí `&str` sobre `String` en parámetros de funciones
- Los sistemas paralelos de `specs` no deben contener `Mutex` — el paralelismo lo maneja el scheduler del ECS
- Perfilá antes de optimizar: `cargo flamegraph` o `perf` en Linux
