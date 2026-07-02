---
sidebar_position: 2
---

# Architecture

Xindeler is a voxel MMORPG in Rust with a 3D graphical client, a monolithic server, and the game's own AI systems (ORACLE, AURORA) integrated in.

## Overview

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (Voxygen)                  │
│         wgpu renderer · egui UI · audio              │
└──────────────────────┬──────────────────────────────┘
                       │ Protocolo Xindeler (QUIC/Quinn)
                       │ puerto 14004
┌──────────────────────▼──────────────────────────────┐
│               Servidor (proceso único)               │
│                                                      │
│  ┌──────────┐  ┌─────────┐  ┌────────────────────┐  │
│  │  ECS     │  │  rtsim  │  │   ORACLE / AURORA  │  │
│  │ (specs)  │  │ world   │  │   (world director  │  │
│  │          │  │ sim     │  │    + NPC AI)        │  │
│  └──────────┘  └─────────┘  └────────────────────┘  │
│                                                      │
│  Persistencia: rtsim/data.dat (MessagePack)          │
│  Eventos:      chronicle/*.jsonl                     │
└──────────────────────────────────────────────────────┘
                       │ REST (puerto 8010)
┌──────────────────────▼──────────────────────────────┐
│              FastAPI (proceso separado)              │
│         /api/waitlist · /api/contribute              │
│         Persistencia: CSV en VPS                     │
└─────────────────────────────────────────────────────┘
```

---

## The server is a monolithic process

The server is **a single Rust binary**. There are no microservices, no separate "Login Server" or "Combat Server". The subsystems (combat, economy, world simulation, ORACLE, AURORA) are modules within the same process that share memory and communicate directly.

This simplifies deployment, state consistency, and local development — with `cargo run --bin xindeler-server` you have everything running.

---

## ECS (Entity Component System)

The core of the game uses the **ECS** paradigm via the `specs` crate. Instead of objects with inheritance, everything is modeled as:

- **Entity** — a numeric ID (a player, an NPC, an item in the world)
- **Component** — data attached to an entity (`Health`, `Pos`, `Vel`, `Stats`, `Inventory`)
- **System** — logic that operates on sets of components (`CombatSystem`, `PhysicsSystem`, `AISystem`)

Systems run in parallel when they have no dependencies on each other. Components are simple structs serializable with `serde`.

---

## rtsim — World simulation

`rtsim` is the module that maintains the world's persistent state between sessions:

- Sites (cities, dungeons, points of interest)
- Factions and their relationships
- NPCs with long-term state (position, relationships, inventory)
- The event chronicle (JSONL rotated by size)

The state is serialized to `rtsim/data.dat` in MessagePack format. There is no relational database — everything lives in that file.

---

## Client-server communication

The client and server communicate exclusively via the **Xindeler protocol** — a proprietary binary protocol over **QUIC** (using the Quinn crate). There is no REST API, no WebSockets for the game.

The only REST API is FastAPI (port 8010), which handles the waitlist and contributors — it has no access to the game state.

---

## ORACLE and AURORA

These are the two AI systems that run inside the server as extensions of `rtsim`:

- **ORACLE** — World director: generates narrative events, manages the ecosystem, controls weather and long-term story arcs.
- **AURORA** — NPC AI: each NPC has a mind with values, fears, episodic memory, and social relationships. AURORA uses an optional LLM layer for generative dialogue.

Both are controlled via admin chat commands (`/oracle`, `/aurora`). Their detailed documentation is in the corresponding sections.

---

## FastAPI (web, separate process)

An independent Python process exposes a minimal REST API for the website:

| Endpoint | Description |
|----------|-------------|
| `POST /api/waitlist` | Register an email on the waitlist |
| `POST /api/contribute` | Contributors form |
| `GET /api/status` | Server status (online/offline, players) |

Persistence: CSV files on the VPS. Does not share a database with the game.
