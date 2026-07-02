---
sidebar_position: 1
---

# Server architecture

The Xindeler server is a **single process** written in Rust. There are no microservices, no separate processes per subsystem. Everything — combat, physics, economy, AI, world simulation — runs in the same binary, sharing memory.

For the full system overview (client + server + FastAPI), see [Project architecture](/proyecto/arquitectura).

---

## Internal structure

```
xindeler-server (single process)
│
├── Network layer (Quinn/QUIC)
│   └── Handles player connections, message serialization
│
├── ECS dispatcher (specs + rayon)
│   ├── PhysicsSystem       — movement, collisions, gravity
│   ├── CombatSystem        — damage, poise, death
│   ├── AgentSystem         — NPC AI tick by tick (pathfinding, behavior)
│   ├── StatSystem          — health/energy regeneration, buffs
│   ├── InventorySystem     — loot, pickup, equip
│   └── ... (~30 more systems)
│
└── rtsim (separate loop, slow scale)
    ├── ORACLE              — world director
    └── AURORA              — NPC mind
```

---

## The main loop

The server has two main loops running on separate threads:

### ECS loop (fast tick)

Runs the `specs` dispatcher at a fixed frequency (~30 ticks/second). Each tick:

1. Processes incoming messages from all connected clients
2. Executes all ECS systems in order (with parallelism where possible)
3. Sends updated state to clients (sync of visible entities)

Systems with no dependencies on each other run in parallel thanks to `rayon`. `specs` automatically determines which systems can be parallelized based on which components they read and write.

### rtsim loop (slow tick)

Runs on a scale of seconds to minutes. It processes:

- Long-distance NPC movement (routes between sites)
- Faction and relationship updates
- ORACLE ticks (event generation, narrative arc progression)
- AURORA ticks (NPC mind updates, memory decay)
- Periodic serialization of state to `rtsim/data.dat`

---

## Connection handling

Each connected player has:

- A QUIC stream (Quinn) for reliable messages (inventory, chat, commands)
- Optionally unreliable channels for frequent position updates

The `Client` component in the ECS represents a connected player. When a player disconnects, their entity persists in the world for a few seconds (for reconnection) and is then removed. Their state (inventory, position, stats) is saved in `rtsim`.

---

## Entity synchronization

The server doesn't send the state of every entity to every client — that would use too much bandwidth. Each client has a **presence range** (a radius of chunks around the player). The server sends only the entities within that range.

When an entity enters or leaves a player's range:
- **Enters**: the server sends the complete entity to the client
- **Leaves**: the client removes it from its local ECS
- **Visible**: the server sends diffs of modified components every tick

---

## Admin commands

Admins control the server via chat commands prefixed with `/`. See [Admin commands](/servidor/admin-commands) for the full reference.

ORACLE and AURORA commands are also executed from the admin chat:
```
/oracle status
/aurora npc <id> status
/time set noon
/give_item common.items.weapons.sword.iron_sword 1
```

---

## Scalability

The current server is designed for **one instance per world** — there is no sharding or multiple instances of the same world. Vertical scaling (more CPU/RAM on the same server) is the path to supporting more simultaneous players.

The practical limit depends on the hardware and player density. A server with 8 cores can handle hundreds of players without issues if they're spread out across the world.
