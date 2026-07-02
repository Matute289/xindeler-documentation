---
sidebar_position: 3
---

# Code style

Code conventions in Xindeler. 90% is applied automatically by tooling — you don't need to memorize it.

## Required tools

### rustfmt

Formats code automatically. There's no debate about formatting style — `rustfmt` has the final word.

```bash
cargo fmt
```

Configuration lives in `rustfmt.toml` at the repo root. Run `cargo fmt` before every commit.

### clippy

Rust's linter. Detects problematic patterns, inefficient code, and common mistakes.

```bash
cargo clippy -- -D warnings
```

The `-D warnings` flag treats warnings as errors — this is what CI runs. Your code must pass with no warnings before opening a PR.

Some useful lints clippy catches in this project:

```rust
// ❌ clippy::clone_on_copy
let x = some_u32.clone();   // u32 implements Copy, .clone() is unnecessary

// ✅
let x = some_u32;

// ❌ clippy::needless_pass_by_value
fn process(items: Vec<Item>) { ... }  // if you don't need ownership

// ✅
fn process(items: &[Item]) { ... }
```

---

## Naming conventions

Rust has strong conventions, and the compiler warns when they aren't followed:

| Element | Convention | Example |
|----------|-----------|---------|
| Types, traits, enums | `UpperCamelCase` | `HealthComponent`, `CombatSystem` |
| Functions, methods, variables | `snake_case` | `apply_damage`, `max_health` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_PLAYERS`, `BASE_DAMAGE` |
| Modules, crates | `snake_case` | `combat_sys`, `rtsim` |
| Files | `snake_case` | `combat_sys.rs`, `npc_mind.rs` |

### Naming in this project

A few conventions specific to this codebase:

- ECS systems end in `_sys` or `System`: `CombatSystem`, `ai_sys.rs`
- ECS components end in `Comp` or are simple nouns: `Health`, `Energy`, `Pos`
- RON files use the asset's name in `snake_case`: `iron_sword.ron`
- Server events use `ServerEvent::Variante`

---

## Comments

Write comments only when the **why** isn't obvious. The what is already stated by the code.

```rust
// ❌ adds nothing
// Increment the kill counter
player.kills += 1;

// ✅ explains a non-obvious decision
// We use saturating_add to avoid overflow in long-session counters
player.kills = player.kills.saturating_add(1);
```

For public functions in `common/`, doc comments (`///`) with a one-line description are expected:

```rust
/// Returns the effective damage after applying armor mitigation.
pub fn mitigate_damage(raw: f32, armor: f32) -> f32 {
    raw * (1.0 - armor.min(0.9))
}
```

---

## Error handling

- Use `?` to propagate errors instead of `.unwrap()` in production code
- `.unwrap()` and `.expect()` are allowed in tests and in situations where the invariant is impossible to violate (document it with a comment)
- Prefer `Option` over sentinel values (`-1`, `""`, etc.)

```rust
// ❌ panics in production
let item = inventory.get(slot).unwrap();

// ✅
let Some(item) = inventory.get(slot) else {
    return; // empty slot, nothing to do
};
```

---

## Performance

- Avoid allocations in ECS systems that run every tick — use slices and references where possible
- Prefer `&str` over `String` in function parameters
- Parallel `specs` systems must not contain a `Mutex` — parallelism is managed by the ECS scheduler
- Profile before optimizing: `cargo flamegraph` or `perf` on Linux
