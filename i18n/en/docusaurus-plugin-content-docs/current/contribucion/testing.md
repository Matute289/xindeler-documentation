---
sidebar_position: 4
---

# Testing

How tests are organized in `xindeler-new-horizon`, and what CI actually runs (and doesn't).

## Unit tests

Live alongside the code they test, in a `#[cfg(test)]` module at the end of the file — standard Rust pattern. Real example: `common/src/comp/class.rs` has several `#[test]`s covering the multiclass system (`grant_second_class_succeeds_and_reallocates_levels`, `grant_second_class_rejects_below_minimum_level`, etc.).

```bash
cargo test -p xindeler-common comp::class
```

## Integration tests

Crates that need to test higher-level behavior have their own `tests/` directory, separate from `src/`:

- `network/tests/` — `closing.rs`, `integration.rs`, `helper.rs` (network protocol behavior)
- `common/systems/tests/` — `character_state.rs`, `telekinetic_grip.rs`, and a `phys/` subdirectory (`main.rs`, `basic.rs`, `utils.rs`) for physics

```bash
cargo test -p xindeler-network
cargo test -p xindeler-common-systems
```

## What CI runs (and doesn't)

The gate in `.github/workflows/ci-code-quality.yml` (`.github/scripts/code-quality.sh`) runs on every PR against `development`/`main`:

```bash
cargo clippy --all-targets --locked \
  --features="bin_cmd_doc_gen,bin_compression,bin_csv,bin_graphviz,bin_bot,bin_asset_migrate,bin,stat,cli" \
  -- -D warnings

cargo clippy -p xindeler-voxygen --locked \
  --no-default-features --features="default-publish" -- -D warnings

cargo clippy --locked --bin xindeler-server-cli --no-default-features -F simd -- -D warnings

cargo fmt --all -- --check
```

**Important:** this gate is clippy (×3 feature variants, including voxygen's `default-publish` build which excludes dev-only features) plus `cargo fmt --check`. **It does not run `cargo test`** — there is no workflow that executes the test suite automatically. Run `cargo test` yourself before opening a PR; a green CI check only confirms the code compiles, passes clippy, and is formatted — not that the tests pass.

## Before opening a PR

```bash
cargo clippy --all-targets -- -D warnings
cargo fmt --all -- --check
cargo test --workspace
```

All three, not just the two CI runs — the third one is on you.
