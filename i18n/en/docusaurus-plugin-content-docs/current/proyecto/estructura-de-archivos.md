---
sidebar_position: 5
---

# File structure

Map of the Rust workspace. Xindeler is a Cargo workspace with multiple crates.

## Main tree

```
xindeler/
├── Cargo.toml              # Workspace root — lists all members
├── rust-toolchain.toml     # Pins the exact nightly channel
├── .cargo/config.toml      # Linker configuration and flags
│
├── common/                 # Types and logic shared between client and server
├── common_net/             # Shared network types (protocol messages)
├── common_systems/         # Reusable ECS systems
│
├── server/                 # Server binary (xindeler-server)
├── client/                 # Client library (not the binary — just the logic)
├── voxygen/                # Graphical client binary
│
├── world/                  # World generation (terrain, sites, dungeons)
├── rtsim/                  # Real-time world simulation (persistent state)
│
├── assets/                 # Game assets (RON, PNG, OGG, GLSL)
└── server-cli/             # CLI wrapper for the server
```

---

## Crates in detail

### `common/`

The heart of the project. Defines all the game's data types:

- ECS components: `Health`, `Energy`, `Pos`, `Vel`, `Stats`, `Inventory`, `Body`
- Item, ability, and buff effect definitions
- Terrain and chunk types
- Pure combat logic (no side effects — makes testing easier)

Both the server and the client depend on `common`. It never depends on `server` or `voxygen`.

### `server/`

The `xindeler-server` binary. Contains:

- The server's main loop with `tokio`
- Connection handling (Quinn/QUIC)
- All the server's ECS systems: combat, physics, AI, economy
- Integration with `rtsim`, ORACLE, and AURORA
- Admin commands (`/give`, `/time`, `/oracle`, etc.)

### `voxygen/`

The graphical client. Contains:

- Rendering pipeline with `wgpu` (voxel chunks, water, sky, shadows)
- UI with `egui`
- Audio system with `rodio`
- Input handling
- Client prediction logic (entity interpolation)

### `world/`

Procedural world generation:

- Terrain generation (heightmaps, biomes, erosion)
- Site placement (cities, caves, ruins)
- Dungeon generation
- Creature spawn tables per biome

This crate is used by the server when generating the world for the first time, and also by `rtsim` for terrain queries.

### `rtsim/`

The real-time world simulation module:

- Persistent NPC state (position, faction, relationships, inventory)
- Site and faction state
- Long-term NPC pathfinding
- Serialization/deserialization to `data.dat` (MessagePack)
- The foundation that ORACLE and AURORA run on

### `assets/`

Game assets organized by type:

```
assets/
├── common/
│   ├── items/          # RON definitions for items (weapons, armor, consumables)
│   ├── abilities/      # RON definitions for abilities and combos
│   ├── recipe_book/    # Crafting recipes in RON
│   └── loot_tables/    # Loot tables in RON
├── voxygen/
│   ├── shaders/        # GLSL/WGSL shaders
│   ├── audio/          # Music (OGG) and sound effects
│   └── element/        # UI textures and assets
└── world/
    └── manifests/      # Biome and site configuration
```

---

## Naming conventions

| Pattern | Meaning |
|--------|-------------|
| `*_sys.rs` | ECS system (implements `System`) |
| `*_comp.rs` | Component definitions |
| `*_event.rs` | Server event types |
| `*.ron` | Game asset (item, ability, creature, recipe) |
| `data.dat` | Persistent world state (MessagePack) |
| `chronicle/*.jsonl` | World event log (rotated by size) |

---

## Where to start based on your task

| Task | Where to look |
|-------|-------------|
| Add an item | `assets/common/items/` + `common/src/comp/item/` |
| Add an ability | `assets/common/abilities/` + `common/src/comp/ability.rs` |
| Add an NPC | `assets/world/` + `server/src/rtsim/` |
| Change combat mechanics | `common/src/combat.rs` + `server/src/sys/combat.rs` |
| Change the UI | `voxygen/src/hud/` |
| Change terrain generation | `world/src/` |
