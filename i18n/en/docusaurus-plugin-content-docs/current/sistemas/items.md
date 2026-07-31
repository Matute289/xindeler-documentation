---
sidebar_position: 6
---

# Items

Like recipes (see [Crafting](/sistemas/crafting)), items in Xindeler are **RON assets**, not hardcoded Rust structs. Every item in the game is a `.ron` file under `assets/common/items/`, loaded at runtime as an `ItemDef` (`common/src/comp/inventory/item/mod.rs`). Adding a new item means adding a file — no recompile needed.

---

## The `ItemDef` struct

```rust
pub struct ItemDef {
    item_definition_id: String,   // the asset path, e.g. "common.items.weapons.sword.iron_sword"
    pub kind: ItemKind,
    pub quality: Quality,
    pub tags: Vec<ItemTag>,
    pub slots: u16,                // slots it grants if it's a container (bag)
    pub ability_spec: Option<AbilitySpec>,
    pub requirements: Option<ItemRequirements>, // equip gate, see below
}
```

Real example, a simple armor item (`assets/common/items/armor/misc/head/straw.ron`):

```ron
ItemDef(
    legacy_name: "Straw Hat",
    legacy_description: "...",
    kind: Armor((
        kind: Head,
        stats: Direct((
            energy_max: Some(7.0),
            energy_reward: Some(0.04),
        )),
    )),
    quality: Common,
    tags: [
        SalvageInto(PlantFiber, 1),
    ],
)
```

---

## `ItemKind` — item categories

`common/src/comp/inventory/item/mod.rs` defines the central enum:

```rust
pub enum ItemKind {
    Tool(Tool),                 // weapons
    ModularComponent(ModularComponent), // the blade/haft of a modular weapon
    Lantern(Lantern),
    Armor(armor::Armor),
    Glider,
    Consumable { kind: ConsumableKind, effects: Effects, container: Option<..> },
    Utility { kind: Utility },  // coins, keys, collars...
    Ingredient { .. },          // pure crafting material
    TagExamples { .. },         // internal UI use (representative of a tag)
    RecipeGroup { recipes: Vec<String> }, // see Crafting — unlocks recipes
    Quest,
}
```

`Armor` in turn has its own subtype, `ArmorKind` (`common/src/comp/inventory/item/armor.rs`): `Head`, `Chest`, `Shoulder`, `Hand`, `Pants`, `Foot`, `Back`, `Belt`, `Neck`, `Ring`, `Tabard`, `Bag`, `Backpack` — each one maps to a specific equip slot (see [Inventory](/sistemas/inventario#equip-slots)).

`ConsumableKind` distinguishes `Drink`, `Food`, `ComplexFood`, `Charm` and `Recipe` (a consumable that teaches a recipe on use, the counterpart to `ItemKind::RecipeGroup`).

---

## Quality (`Quality`)

```rust
pub enum Quality {
    Low,       // grey
    Common,    // light blue
    Moderate,  // green
    High,      // blue
    Epic,      // purple
    Legendary, // gold
    Artifact,  // orange
    Debug,     // red — testing only
}
```

It's purely informational/visual at the `ItemDef` level — it doesn't automatically alter stats. The color is used to tint the slot border in the inventory (`voxygen/src/hud/slot_grid.rs`, which maps each `Quality` to a distinct `inv_slot_*` sprite).

---

## Tags (`ItemTag`)

Tags are what lets recipes (see [Crafting](/sistemas/crafting#how-an-input-is-specified)) and other mechanics match "by category" instead of by exact item:

```rust
pub enum ItemTag {
    Material(Material),       // e.g.: item made of "iron"
    MaterialKind(MaterialKind), // Metal, Gem, Wood, Stone, Cloth, Hide
    Cultist, Gnarling, Witch, Pirate,   // tied to a faction/loot table
    Potion, Charm, Food,
    BaseMaterial,   // leather, cloth scraps, etc.
    CraftingTool,   // pickaxe, craftsman hammer, sewing set
    Utility, Bag,
    SalvageInto(Material, u32), // what it yields when broken down (see Crafting)
    RequiresAttunement,
}
```

`RequiresAttunement` is a Xindeler-specific addition (not upstream Veloren): it marks items whose magical effect only applies if the wearer is *attuned* to it — it's purely data-driven, added to an item's `tags` list in RON, no code changes required.

---

## Equip requirements (`ItemRequirements`)

This is the gate that connects items to [Classes](/sistemas/clases) and [Races](/sistemas/razas): an `ItemDef` can declare who's allowed to equip it.

```rust
pub struct ItemRequirements {
    pub classes: Option<Vec<ClassKind>>,   // None = any class
    pub min_level: Option<u16>,             // derived character level (SkillSet::character_level)
    pub races: Option<Vec<humanoid::Species>>, // None = any species
}
```

Real example from a testing item with an active gate (`assets/common/items/testing/test_draugr_blade.ron`):

```ron
requirements: Some((
    min_level: Some(10),
    races: Some([Draugr]),
)),
```

Validation lives in `ItemRequirements::unmet(character_class, level, species) -> Vec<UnmetRequirement>`, with three failure variants: `Class`, `Level { needed }`, `Race`. Specific rules from that function:

- With multiclassing, a character passes the class gate if **any** of their held classes is on the whitelist — a Warrior who multiclasses into Warlock can equip gear restricted to either class, not just the primary one.
- Entities without a `CharacterClass` (NPCs, spectators) automatically fail any class gate.
- Non-humanoid bodies automatically fail any race gate (`species` is `None`).

`Item::meets_requirements_with_class` is the boolean shortcut over `unmet_requirements_with_class` that the rest of the codebase uses when only a yes/no answer matters.

For how this shows up in the UI (greyed-out slots, tooltip with what's missing), see [Inventory](/sistemas/inventario#equip-gate-in-the-ui).

---

## File reference

| What | Where |
|---|---|
| `ItemDef`, `ItemKind`, `Quality`, `ItemTag`, `ItemRequirements` | `common/src/comp/inventory/item/mod.rs` |
| `Armor`, `ArmorKind` | `common/src/comp/inventory/item/armor.rs` |
| Item definitions (RON) | `assets/common/items/**/*.ron` |
