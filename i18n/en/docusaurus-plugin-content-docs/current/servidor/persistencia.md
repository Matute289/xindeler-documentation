---
sidebar_position: 5
---

# Persistence (Server)

> *Editorial note: this page was marked as written elsewhere in the repo, but the docs tree still had the "under construction" stub. Fixed here.*

Everything related to saving and loading character data lives in `server/src/persistence/` (`mod.rs`, `character_loader.rs`, `character_updater.rs`, `json_models.rs`, `models.rs`, and the `character/` submodule). World simulation (NPCs, sites, factions, ORACLE/AURORA) — which does **not** live here — is covered in [World simulation](/servidor/world-simulation).

---

## What gets persisted per character

`PersistedComponents` (`server/src/persistence/mod.rs`) is the canonical list of what gets saved when a character is created or updated:

```rust
pub struct PersistedComponents {
    pub body: comp::Body,
    pub hardcore: Option<comp::Hardcore>,
    pub character_class: comp::CharacterClass,
    pub stats: comp::Stats,
    pub skill_set: comp::SkillSet,
    pub inventory: comp::Inventory,
    pub waypoint: Option<comp::Waypoint>,
    pub pets: Vec<PetPersistenceData>,
    pub active_abilities: comp::ActiveAbilities,
    pub map_marker: Option<comp::MapMarker>,
    pub ethos: comp::Ethos,
    pub background: comp::Background,
}
```

In short: body/race, hardcore mode, class (primary + secondary if multiclassed), stats, skill trees (see [Abilities](/sistemas/habilidades)), inventory, position (waypoint), pets, active ability bar, map marker, alignment (`Ethos`), and narrative background (`Background`, added in BL-31).

**What is NOT here**: world state — rtsim NPC positions, site/faction state, ORACLE's narrative arcs, AURORA's memory. That lives in `rtsim/data.dat`, gets serialized on its own slow loop, and is rtsim's responsibility, not this module's. See [World simulation](/servidor/world-simulation) and [Server architecture](/servidor/arquitectura).

---

## Storage format: SQLite + nested JSON fields

The backing store is a single **SQLite** file, `db.sqlite`, opened with `rusqlite` in WAL mode (write-ahead logging, for better concurrency) in the server's saves directory:

```rust
// server/src/persistence/mod.rs
let connection = Connection::open_with_flags(
    settings.db_dir.join("db.sqlite"),
    open_flags,
)
```

It's not "one JSON file per character" — it's a normal relational database with tables (`character`, `item`, `body`, `skill_group`, `pet`, `ability_sets`, etc., defined in `models.rs`). What is true is that several columns store **JSON serialized as text** for nested structures that aren't worth normalizing into more tables: the unlocked-skill list of a `SkillGroup` (the `skills` column), extra `Item` properties (the `properties` column), and non-humanoid body data (`body_data`). `json_models.rs` is the conversion layer between the ECS's Rust types and these representations — functions like `skill_group_to_db_string`/`db_string_to_skill_group` translate `SkillGroupKind` to/from the string stored in the `skill_group_kind` column (e.g. `"Class Mage"`, `"Weapon Sword"`), with equivalents for class (`class_to_db_string`) and background (`background_to_db_string`).

Position is stored as a serialized `Waypoint` in the `character` table's `waypoint` column (parsed by `parse_waypoint`); a `CharacterPosition` model in `json_models.rs` also exists to carry `waypoint: Option<Vec3<f32>>` + `map_marker: Option<Vec2<i32>>` together where needed.

---

## When saves happen

Two triggers, not just logout:

1. **Periodic** — the server runs a `PersistenceScheduler` every 10 seconds (`sys::PersistenceScheduler::every(Duration::from_secs(10))`, registered in `server/src/lib.rs`), which calls `updater.batch_update(...)` (`server/src/sys/persistence.rs`) to flush pending changes for every connected character.
2. **On disconnect** — `CharacterUpdater::add_pending_logout_update` queues the character's final state for the next batch.

Saves are grouped into **transactional batches** (`execute_batch_update`, inside a SQLite transaction): if a batch fails partway through, every client gets disconnected rather than leaving the database in a partially-written state.

---

## Migrations: numbered and (mostly) additive

The schema is versioned with [`refinery`](https://docs.rs/refinery), `.sql` files under `server/src/migrations/` following the `V<n>__<name>.sql` pattern. On startup, `run_migrations` applies everything pending against the connection before the server comes up — if a migration fails, the server doesn't start. As of this writing there are **77 migrations** (`V1` through `V77`).

The dominant pattern is `ALTER TABLE ... ADD COLUMN` — adding a new column, almost always nullable or with a `DEFAULT`, so existing saved characters don't break. Concrete example, `V73__character_background.sql` (BL-31's narrative background):

```sql
ALTER TABLE "character" ADD COLUMN background TEXT;
ALTER TABLE "character" ADD COLUMN background_custom_note TEXT;
```

Both columns are nullable on purpose: a character saved before this migration loads as `Background(None)` ("Uncommitted") with no forced choice and no data loss. That's the typical shape of these migrations — add, never break what already exists.

Another example in the same family: `V74__skill_group_direct_sp.sql` adds `direct_earned_sp`/`direct_available_sp` to `skill_group` to persist the Feats points granted by level milestones, which used to be silently lost on every reload because they bypass the normal XP economy (see [Abilities](/sistemas/habilidades)). And the `V75`–`V77` sequence (`secondary_class`, `secondary_class_level`, `secondary_class_future_levels`) incrementally added multiclass support to the `character` table, migration by migration, without touching existing columns.

It's not an absolute rule — there are a handful of `DROP COLUMN`s further back in the history (`V4`, `V22`, `V46`) for cases where a column was genuinely obsolete — but the de facto norm is additive: add nullable columns rather than break the existing schema.

After migrations run, the server also runs `VACUUM main` against the database (`vacuum_database`) to reclaim disk space.

---

## See also

- [Server architecture](/servidor/arquitectura) — where this module fits in the server process
- [World simulation](/servidor/world-simulation) — the other half of persistent state: rtsim, not the character database
- [Abilities](/sistemas/habilidades) — detail on what `SkillSet`/`SkillGroup` are, the structure this module serializes
