---
sidebar_position: 2
---

# ECS Components

Reference for the most commonly used ECS components in Xindeler. All of them are defined in `common/src/comp/`.

To understand the ECS model, see [Architecture](/proyecto/arquitectura).

---

## Position and movement

### `Pos`
```rust
pub struct Pos(pub Vec3<f32>);
```
Position in the world in voxel coordinates. Present on every entity with a physical existence.

### `Vel`
```rust
pub struct Vel(pub Vec3<f32>);
```
Current velocity in meters per tick. Modified every tick by the physics system according to forces and collisions.

### `Ori`
```rust
pub struct Ori(/* internal quaternion */);
```
Orientation of the entity. Exposes methods such as `look_dir()`, `right()`, `up()`.

---

## Stats and health

### `Health`
```rust
pub struct Health {
    pub current: u32,
    pub maximum: u32,
    pub is_dead: bool,
}
```
Current and maximum health. When `current` reaches 0, `is_dead` is set to true and the death system processes the entity.

### `Energy`
```rust
pub struct Energy {
    pub current: u32,
    pub maximum: u32,
}
```
Resource consumed by abilities. Regenerates passively. Some classes call it mana, stamina, or rage — the underlying type is the same.

### `Stats`
```rust
pub struct Stats {
    pub name: String,
    pub level: u32,
    pub exp: u32,
    pub endurance: u32,
    pub fitness: u32,
    pub willpower: u32,
}
```
The entity's base stats. They affect damage calculations, maximum health, and energy regeneration.

### `Poise`
```rust
pub struct Poise {
    pub current: f32,
    pub maximum: f32,
    pub poise_change_rate: f32,
}
```
Resistance to being staggered. If it reaches 0, the entity enters the `Stunned` state. It recovers over time.

---

## Inventory and equipment

### `Inventory`
```rust
pub struct Inventory {
    slots: Vec<Option<Item>>,
    loadout: Loadout,
}
```
Holds the character's items (backpack) and their active equipment (`Loadout`). Equipment slots include: mainhand, offhand, head, chest, back, hands, ring, neck, feet.

### `SkillSet`
```rust
pub struct SkillSet {
    pub skills: HashMap<Skill, u8>,
    pub exp: HashMap<SkillGroupKind, u32>,
}
```
Unlocked skills and their level. The `Skill` key is an enum covering every skill in the game.

---

## Behavior and alignment

### `Alignment`
```rust
pub enum Alignment {
    Wild,       // wild creatures — attack if provoked
    Enemy,      // always hostile to players
    Npc,        // neutral, doesn't attack
    Tame,       // pets or tamed NPCs
    Owned(Uid), // belongs to a specific entity
    Passive,    // never attacks
}
```
Defines the entity's default combat behavior.

### `Agent`
Component that activates the server-side AI for an entity. Without `Agent`, the entity is static (doesn't patrol, doesn't react). Holds the current behavior state: patrolling, attacking, fleeing, interacting.

### `CharacterState`
Current animation/action state of the character: `Idle`, `Run`, `Jump`, `Attack(ComboMelee { .. })`, `Roll`, `Glide`, etc. The client uses it to animate the character; the server validates it.

---

## Networking and synchronization

### `Uid`
```rust
pub struct Uid(pub u64);
```
Universal unique ID of an entity, synchronized between client and server. The specs `Entity` is local to the process — `Uid` is the network identifier.

### `Client`
Component present only on entities that have a connected player. Holds the QUIC stream used to send messages to the client.

### `Presence`
Indicates that the entity has an active player and defines its view range (which chunks and entities get synced to the client).

---

## World and terrain

### `ChunkPos`
Position of a chunk in chunk coordinates (not voxel coordinates). `ChunkPos(x, y)` corresponds to the chunk that contains voxel `(x*32, y*32)`.

---

## Usage conventions

- Components are registered with specs' `World` when the server starts up
- To access a component in a system: `ReadStorage<'a, Health>` or `WriteStorage<'a, Health>`
- To add a new component, define it in `common/src/comp/`, register it in `common/src/comp/mod.rs`, and register its storage on the server
- Components must implement specs' `Component` and typically `Clone`, `Debug`, and `serde::Serialize`/`Deserialize` if they need to be synchronized over the network
