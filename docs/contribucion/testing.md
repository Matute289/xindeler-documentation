---
sidebar_position: 4
---

# Testing

Cómo están organizados los tests en `xindeler-new-horizon` y qué corre (y qué no) el CI del repo.

## Tests unitarios

Viven junto al código que prueban, en un módulo `#[cfg(test)]` al final del archivo — patrón estándar de Rust. Ejemplo real: `common/src/comp/class.rs` tiene varios `#[test]` que verifican el sistema de multiclase (`grant_second_class_succeeds_and_reallocates_levels`, `grant_second_class_rejects_below_minimum_level`, etc.).

```bash
cargo test -p xindeler-common comp::class
```

## Tests de integración

Crates que necesitan probar comportamiento de más alto nivel tienen su propio directorio `tests/`, separado de `src/`:

- `network/tests/` — `closing.rs`, `integration.rs`, `helper.rs` (comportamiento del protocolo de red)
- `common/systems/tests/` — `character_state.rs`, `telekinetic_grip.rs`, y un subdirectorio `phys/` (`main.rs`, `basic.rs`, `utils.rs`) para física

```bash
cargo test -p xindeler-network
cargo test -p xindeler-common-systems
```

## Qué corre el CI (y qué no)

El gate de `.github/workflows/ci-code-quality.yml` (`.github/scripts/code-quality.sh`) corre en cada PR contra `development`/`main`:

```bash
cargo clippy --all-targets --locked \
  --features="bin_cmd_doc_gen,bin_compression,bin_csv,bin_graphviz,bin_bot,bin_asset_migrate,bin,stat,cli" \
  -- -D warnings

cargo clippy -p xindeler-voxygen --locked \
  --no-default-features --features="default-publish" -- -D warnings

cargo clippy --locked --bin xindeler-server-cli --no-default-features -F simd -- -D warnings

cargo fmt --all -- --check
```

**Importante:** este gate es clippy (×3 variantes de features, incluyendo el build `default-publish` de voxygen que excluye features de dev) + `cargo fmt --check`. **No corre `cargo test`** — no hay ningún workflow que ejecute la suite de tests automáticamente. Corré `cargo test` vos mismo antes de abrir el PR; que el CI esté verde solo confirma que compila, pasa clippy y está formateado, no que los tests pasan.

## Correr todo antes de un PR

```bash
cargo clippy --all-targets -- -D warnings
cargo fmt --all -- --check
cargo test --workspace
```

Los tres, no solo los dos que corre el CI — el tercero es tu responsabilidad.
