---
sidebar_position: 5
---

# Estructura de archivos

Mapa del workspace Rust. Xindeler es un Cargo workspace con múltiples crates.

## Árbol principal

```
xindeler/
├── Cargo.toml              # Workspace root — lista todos los members
├── rust-toolchain.toml     # Fija el canal nightly exacto
├── .cargo/config.toml      # Configuración del linker y flags
│
├── common/                 # Tipos y lógica compartida entre cliente y servidor
├── common_net/             # Tipos de red compartidos (mensajes del protocolo)
├── common_systems/         # Sistemas ECS reutilizables
│
├── server/                 # Binario del servidor (xindeler-server)
├── client/                 # Librería cliente (no el binario — solo la lógica)
├── voxygen/                # Binario del cliente gráfico
│
├── world/                  # Generación de mundo (terreno, sitios, dungeons)
├── rtsim/                  # Simulación del mundo en tiempo real (estado persistente)
│
├── assets/                 # Assets del juego (RON, PNG, OGG, GLSL)
└── server-cli/             # CLI wrapper para el servidor
```

---

## Crates en detalle

### `common/`

El corazón del proyecto. Define todos los tipos de datos del juego:

- Componentes ECS: `Health`, `Energy`, `Pos`, `Vel`, `Stats`, `Inventory`, `Body`
- Definiciones de ítems, habilidades, efectos de buff
- Tipos de terreno y chunk
- Lógica de combate pura (sin side effects — facilita testing)

Tanto el servidor como el cliente dependen de `common`. Nunca depende de `server` ni de `voxygen`.

### `server/`

El binario `xindeler-server`. Contiene:

- Loop principal del servidor con `tokio`
- Manejo de conexiones (Quinn/QUIC)
- Todos los sistemas ECS del servidor: combate, física, IA, economía
- Integración con `rtsim`, ORACLE y AURORA
- Comandos de admin (`/give`, `/time`, `/oracle`, etc.)

### `voxygen/`

El cliente gráfico. Contiene:

- Pipeline de renderizado con `wgpu` (chunks vóxel, agua, cielo, sombras)
- UI con `egui`
- Sistema de audio con `rodio`
- Input handling
- Lógica de predicción del cliente (interpolación de entidades)

### `world/`

Generación procedural del mundo:

- Generación de terreno (heightmaps, biomas, erosión)
- Placement de sitios (ciudades, cuevas, ruinas)
- Generación de dungeons
- Tablas de spawn de criaturas por bioma

Este crate se usa en el servidor al generar el mundo por primera vez y también en `rtsim` para queries de terreno.

### `rtsim/`

El módulo de simulación del mundo real-time:

- Estado persistente de NPCs (posición, facción, relaciones, inventario)
- Estado de sitios y facciones
- Pathfinding a largo plazo de NPCs
- Serialización/deserialización a `data.dat` (MessagePack)
- Base sobre la que corren ORACLE y AURORA

### `assets/`

Assets del juego organizados por tipo:

```
assets/
├── common/
│   ├── items/          # Definiciones RON de ítems (armas, armaduras, consumibles)
│   ├── abilities/      # Definiciones RON de habilidades y combos
│   ├── recipe_book/    # Recetas de crafting en RON
│   └── loot_tables/    # Tablas de loot en RON
├── voxygen/
│   ├── shaders/        # Shaders GLSL/WGSL
│   ├── audio/          # Música (OGG) y efectos de sonido
│   └── element/        # Texturas y assets de UI
└── world/
    └── manifests/      # Configuración de biomas y sitios
```

---

## Convenciones de nombres

| Patrón | Significado |
|--------|-------------|
| `*_sys.rs` | Sistema ECS (implementa `System`) |
| `*_comp.rs` | Definiciones de componentes |
| `*_event.rs` | Tipos de eventos del servidor |
| `*.ron` | Asset de juego (ítem, habilidad, criatura, receta) |
| `data.dat` | Estado persistente del mundo (MessagePack) |
| `chronicle/*.jsonl` | Log de eventos del mundo (rotado por tamaño) |

---

## Dónde empezar según tu tarea

| Tarea | Dónde mirar |
|-------|-------------|
| Agregar un ítem | `assets/common/items/` + `common/src/comp/item/` |
| Agregar una habilidad | `assets/common/abilities/` + `common/src/comp/ability.rs` |
| Agregar un NPC | `assets/world/` + `server/src/rtsim/` |
| Cambiar mecánica de combate | `common/src/combat.rs` + `server/src/sys/combat.rs` |
| Cambiar la UI | `voxygen/src/hud/` |
| Cambiar generación de terreno | `world/src/` |
