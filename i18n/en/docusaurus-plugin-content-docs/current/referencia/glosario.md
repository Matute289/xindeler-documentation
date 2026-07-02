---
sidebar_position: 3
---

# Glossary

Technical terms used in Xindeler's codebase and documentation.

---

## A

**Asset ID**
Identifier for a game asset, formed from the RON file's path relative to `assets/`, with `/` replaced by `.` and no extension. Example: `common.items.weapons.sword.iron_sword`.

**AURORA**
NPC AI system. Every NPC has a mind (`Mind`) with values, fears, episodic memory, and social relationships. Runs inside the server as an extension of `rtsim`. See [AURORA](/aurora/intro).

---

## B

**Body**
ECS component that defines an entity's physical appearance: species (`Human`, `Orc`, `Dwarf`...), body type, and parts that determine its 3D voxel model.

**Buff**
Temporary effect applied to an entity that modifies its stats. Can be positive (buff) or negative (debuff). Defined in `common/src/comp/buff.rs`.

---

## C

**Cargo workspace**
Rust project with multiple crates coordinated from a root `Cargo.toml`. Xindeler is a workspace — `cargo build` at the root compiles everything.

**Chronicle**
JSONL file in `chronicle/` where the server logs world events (battles, deaths, faction changes). Rotated automatically by size.

**Component (ECS Component)**
Data struct attached to an entity. Has no logic — only data. Example: `Health { current: 80.0, maximum: 100.0 }`.

**Chunk**
Terrain unit of 32×32×16 blocks. The world is divided into chunks that load/unload dynamically based on player position.

---

## E

**ECS (Entity Component System)**
Game architecture paradigm. Entities are numeric IDs; data is stored in components; logic lives in systems that operate on sets of components. Xindeler uses the `specs` crate.

**Entity**
Unique numeric ID representing any game object: player, NPC, item on the ground, projectile. Has no data of its own — the data lives in its components.

---

## F

**Faction**
Political/social group in the game world. NPCs belong to factions that have relationships with one another (allied, rival, neutral). Faction state persists in `rtsim`.

---

## L

**LOD (Level of Detail)**
Rendering technique that uses lower-resolution models/textures for distant objects. Xindeler's client applies LOD to terrain chunks and entity models.

**LootSpec**
RON type that defines which item(s) an entity drops on death. It can be a specific item, a weighted table, or nothing (`Nothing`).

---

## O

**ORACLE**
World narrative direction system. Generates events, manages creature ecosystems, and controls weather and long-term story arcs. Runs inside the server as an extension of `rtsim`. See [ORACLE](/oracle/intro).

---

## P

**Poise**
Stat that determines resistance to being staggered. If an entity's poise reaches zero, it enters the `Stunned` state briefly. It recovers over time.

**Protocol (Xindeler Protocol)**
Proprietary binary protocol used for client-server communication. Runs over QUIC (Quinn). Not REST, not WebSocket.

---

## Q

**QUIC**
Modern transport protocol (RFC 9000) over UDP. Xindeler uses it for game communication via the Quinn crate. Offers stream multiplexing and lower latency than TCP on lossy networks.

---

## R

**RON (Rusty Object Notation)**
Text format for defining game assets (items, abilities, creatures, recipes). Similar to JSON but with native support for Rust types. Extension: `.ron`.

**rtsim**
Real-time world simulation module. Maintains the persistent state of NPCs, sites, and factions between sessions. Serializes to `rtsim/data.dat` in MessagePack format.

---

## S

**Site**
Point of interest generated in the world: city, village, dungeon, ruins. Sites have plots (buildings, structures) and can host persistent NPCs in rtsim.

**SkillSet**
Set of skills and levels for an entity. Determines which abilities it can use in combat. Referenced by asset ID in RON entity definitions.

**System (ECS System)**
Logic that operates on a set of components every tick. Systems are registered with the `specs` dispatcher and can run in parallel when they have no data conflicts.

---

## V

**Voxygen**
Xindeler's graphical client. Binary: `cargo run --bin voxygen`.

---

## W

**WorldFact**
Data type that ORACLE writes and AURORA can read. Represents a verified fact about the world's state (a faction conquered a site, a mythical creature was sighted, etc.). It's the communication contract between the two systems.
