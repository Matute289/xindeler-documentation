---
sidebar_position: 1
---

# ORACLE — World Director

ORACLE is the artificial intelligence system that directs Xindeler's world at the macro level. It doesn't control individual NPCs — that's [AURORA](/aurora/intro)'s job. ORACLE controls the world itself: which events occur, how factions evolve, which narrative arcs unfold, how the creature ecosystem behaves.

---

## The problem it solves

In a traditional MMORPG, the world is static. Dragons respawn in the same cave every hour. Factions are always at war because someone scripted it that way. Seasonal events are the same every year.

Xindeler aims for a world that **changes with or without players**. A faction can conquer a territory while players sleep. A plague of creatures can decimate a region if no one intervenes. An important character can die of old age and be succeeded by their heir.

ORACLE is the engine behind that change.

---

## What ORACLE does

### Procedural narrative

ORACLE generates and manages long-term **narrative arcs**: a war between factions, the rise of a cult, the corruption of a forest. Each arc has phases, progression conditions, and multiple possible outcomes depending on player actions and world events.

### Ecosystem simulation

The world runs a creature population simulation based on predator-prey dynamics (a Lotka-Volterra model). If players hunt too many wolves, deer overpopulate and ravage the villages' crops. ORACLE monitors these balances and generates events when they break down.

### Astronomy and natural cycles

ORACLE manages the world's astronomical state: the position of the sun and moons, seasons, tides of magical energy. These cycles affect creature behavior, resource availability, and some magic mechanics.

### World events

ORACLE generates events that players can discover and participate in: the appearance of an ancient dragon, conflict between guilds, famine in a region. Events have a scale (local, regional, world) and a variable duration.

---

## How it works inside the server

ORACLE runs as a module inside the server, integrated into the `rtsim` loop. It's not a separate process or a call to an external API — it's Rust code that runs in the same process as the game.

```
Server (single process)
├── ECS (specs) — tick by tick: physics, combat, movement
└── rtsim — slow simulation (seconds/minutes scale)
    ├── ORACLE — world state, events, narrative
    └── AURORA — each NPC's mind
```

ORACLE operates on a different timescale than the ECS. The ECS processes game ticks (tens per second). ORACLE processes world events on a scale of seconds to real hours.

---

## The contract with AURORA

ORACLE and AURORA communicate through **WorldFacts** — verified facts about the world's state that ORACLE writes and AURORA can read asynchronously.

Examples of WorldFacts:
- `FactionConqueredSite { faction: Bandit, site: IronholmVillage }`
- `CreatureExtinct { species: Wolf, region: NorthForest }`
- `NarrativeArcAdvanced { arc: BanditRise, phase: 3 }`

NPCs with AURORA AI can react to these facts in their behavior and dialogue — without ORACLE needing to know about each individual NPC.

---

## Admin control

ORACLE is controlled from the server via admin chat commands:

```
/oracle status              — current state of the director
/oracle pause               — pause event generation
/oracle event <type>        — force an event manually
/oracle arc list            — view active narrative arcs
```

See [ORACLE Admin](/oracle/admin) for the full reference.

---

## LLM integration (optional)

ORACLE includes an integration layer with language models for narrative generation. In offline mode (no LLM), it uses predefined templates. With a local llama.cpp server configured, it can generate event descriptions, character names, and dynamic narrative text.

This layer is optional and doesn't affect game mechanics — only the descriptive text for events.
