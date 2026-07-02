---
sidebar_position: 2
---

# World simulation

How the server keeps a world alive between play sessions.

---

## rtsim — Real-Time Simulation

`rtsim` is the module that simulates the world at a slow timescale. While the ECS processes physics and combat at 30 ticks per second, rtsim operates on real seconds and minutes — it handles long-term decisions that don't need tick-level precision.

What lives in rtsim:

- **Persistent NPCs** — position, destination, faction, inventory, mood
- **Sites** — the state of cities, dungeons, points of interest
- **Factions** — relationships between groups (allied, rival, neutral)
- **ORACLE** — the world director's state and narrative arcs
- **AURORA** — each NPC's mind (memory, values, relationships)

---

## The rtsim cycle

The rtsim loop runs on a thread separate from the main ECS:

```
Every rtsim tick (~1-5 real seconds):
1. Update NPC positions (long-distance pathfinding)
2. Process NPC decisions (AURORA: goals, actions)
3. Evaluate world state (ORACLE: event conditions)
4. Emit entities near players to the ECS (spawn/despawn)
5. Serialize state to data.dat (periodically)
```

When an rtsim NPC enters a player's visual range, the server creates an ECS entity for it. When it leaves that range, the ECS entity is removed and the state returns to rtsim.

---

## Sites — World locations

Sites are the world's points of interest: cities, villages, dungeons, ruins, caves. They're generated when the world is created and persist in rtsim.

Each site has:
- A position on the map
- A type (Town, Dungeon, Cave, Ruin, etc.)
- A current state (intact, partially destroyed, conquered)
- A list of resident NPCs (with their persistent states)
- An owning faction (for cities and camps)

Sites are generated in `world/src/site2/` using plots (individual buildings and structures) that combine to form the complete site.

---

## Factions

Factions are groups with relationships between them that change dynamically. A faction can:

- Control sites (cities, camps)
- Have member NPCs loyal to it
- Be at war, peace, or alliance with other factions
- Lose or gain territory depending on world events

ORACLE uses faction state to generate narrative events: if two factions have been at peace for a while, it may propose a trade agreement; if a faction loses too many members, it may declare an emergency.

---

## Long-range pathfinding

rtsim NPCs move between sites using pathfinding on the world map (not on voxel terrain — that's the ECS pathfinding for nearby NPCs).

rtsim pathfinding uses a graph of routes between sites. A merchant deciding to travel from village A to market B chooses the shortest route among the known paths. If a path is dangerous (many recent combat events), NPCs may avoid it.

---

## State persistence

The complete rtsim state is serialized to `rtsim/data.dat` in MessagePack:

- **Periodic save:** every N minutes while the server is running
- **Save on shutdown:** whenever the server closes cleanly (SIGTERM)
- **Data loss:** if the server dies with SIGKILL, changes since the last periodic save are lost

On startup, the server loads `data.dat`. If the file doesn't exist (new world) or can't be read (corruption), it generates a new world and logs the error.

---

## Chronicle events

Every significant change in world state generates a line in `chronicle/events-current.jsonl`:

```json
{"ts":1750000000,"kind":"SiteConquered","site":"Ironholm","by":"Bandits"}
{"ts":1750000300,"kind":"NpcDied","npc":"Aldric el Comerciante","cause":"Combat"}
{"ts":1750001800,"kind":"FactionPeace","a":"Merchants","b":"Guards"}
```

ORACLE reads the chronicle for historical context when generating new events. The chronicle is also useful for debugging — you can see exactly what happened in the world and when.

---

## Debugging

To inspect rtsim state live, use the admin commands:

```
/site list                    — list all sites and their state
/npc list                     — list nearby persistent NPCs
/npc <id> status              — full state of an rtsim NPC
/faction list                 — list factions and their territories
/oracle status                — state of the world director
```

To regenerate the world from scratch (deleting data.dat):

```bash
# Stop the server
rm rtsim/data.dat
# Restart — the server generates a new world
cargo run --bin xindeler-server
```

⚠️ This erases all world state: NPCs, factions, narrative progress.
