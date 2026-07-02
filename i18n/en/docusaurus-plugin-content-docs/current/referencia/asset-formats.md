---
sidebar_position: 1
---

# Asset formats

Reference for the file formats used to define game content. All game assets use **RON (Rusty Object Notation)**.

---

## RON — Rusty Object Notation

RON is a structured text format designed for Rust types. It's the standard format for all Xindeler assets.

### Basic syntax

```ron
// Line comment

// Struct with named fields
ItemDef(
    name: "Espada de Hierro",
    quality: Common,
    slots: 0,
)

// Enum with variant
alignment: Alignment::Enemy,

// Enum with data
body: Body::BipedLarge(BipedLargeBody(
    species: Troll,
    body_type: Male,
))

// Option
skillset_asset: Some("common.skillset.warrior"),
skillset_asset: None,

// Vec (list)
drops: [
    (1.0, LootSpec::Item("common.items.ore.iron")),
    (0.5, LootSpec::Nothing),
],

// Tuple
group_size: (1, 3),

// RGB colors
col: Rgb(1.0, 0.4, 0.0),
```

---

## Asset ID format

The Asset ID is the unique identifier for each RON file in the game. It's formed from the path relative to `assets/`, with `/` replaced by `.` and without the `.ron` extension:

```
assets/common/items/weapons/sword/iron_sword.ron
→ "common.items.weapons.sword.iron_sword"

assets/common/entity/wild/aggressive/cave_troll.ron
→ "common.entity.wild.aggressive.cave_troll"
```

Asset IDs are used in Rust code (`asset_server.load(...)`) and in other RON files to reference assets.

---

## Items (`ItemDef`)

**Location:** `assets/common/items/`

```ron
ItemDef(
    legacy_names: [],           // Previous IDs for save migration
    name: "Nombre del ítem",
    description: "Texto del tooltip.",
    kind: /* item type */,
    quality: Common,            // Common | Moderate | High | Epic | Legendary | Artifact
    tags: [],                   // tags for filters and recipes
    slots: 0,                   // stack size (0 = not stackable)
)
```

### Item types (`kind`)

```ron
// Melee weapon
Sword(SwordToolKind(hands: OneHand))
Axe(AxeToolKind(hands: TwoHand))
Hammer(HammerToolKind(hands: TwoHand))

// Ranged weapon
Bow(BowToolKind)
Staff(StaffToolKind)

// Armor
Armor(ArmorKind(
    kind: Chest,   // Head | Chest | Back | Hands | Belt | Legs | Feet | Neck | Ring
    stats: ArmorStats(protection: 15.0, resilience: 0.1),
))

// Consumable
Consumable(
    kind: Potion,
    effects: [Effect::Heal(30.0)],
)

// Crafting material
Ingredient(descriptor: "Mineral")

// Tool
Tool(ToolKind::Pick)
```

---

## Entities (`EntityConfig`)

**Location:** `assets/common/entity/`

```ron
EntityConfig(
    name: Name("Nombre"),
    body: Body(kind: /* body type */),
    alignment: Alignment::Enemy,     // Wild | Enemy | Npc | Friendly | Passive
    loot: LootSpec::LootTable("common.loot_tables.creatures.troll"),
    skillset_asset: Some("common.skillset.troll"),
    flee_health: 0.1,       // % health to start fleeing (0.0 = never)
    aggro_range: 15.0,      // player detection radius
    idle_wander_factor: 0.5,
)
```

### Body types (`Body`)

```ron
Humanoid(HumanoidBody(species: Human, body_type: Male))
BipedLarge(BipedLargeBody(species: Troll, body_type: Male))
QuadrupedMedium(QuadrupedMediumBody(species: Wolf, body_type: Male))
QuadrupedSmall(QuadrupedSmallBody(species: Rat, body_type: Female))
BirdMedium(BirdMediumBody(species: Eagle, body_type: Male))
Dragon(DragonBody(species: Drake, body_type: Male))
```

---

## Loot tables (`LootSpec`)

**Location:** `assets/common/loot_tables/`

```ron
// Single item
LootSpec::Item("common.items.weapons.sword.iron_sword")

// Nothing
LootSpec::Nothing

// Weighted random drop
LootSpec::MultiDrop(
    drops: [
        (2.0, LootSpec::Item("common.items.ore.iron")),
        (1.0, LootSpec::Item("common.items.consumable.potion_minor")),
        (0.3, LootSpec::Nothing),
    ],
)

// Reference another table
LootSpec::LootTable("common.loot_tables.tier_2")

// Variable quantity
LootSpec::Quantity(
    loot: LootSpec::Item("common.items.ore.iron"),
    // min: 1, max: 3
    range: (1, 3),
)
```

Weights in `MultiDrop` are relative to each other — they don't need to add up to 1.

---

## Recipes (`Recipe`)

**Location:** `assets/common/recipe_book/`

```ron
Recipe(
    output: ("common.items.weapons.sword.iron_sword", 1),
    inputs: [
        (RecipeInput::Item("common.items.crafting_ing.metal.iron_ingot"), 3),
        (RecipeInput::Item("common.items.crafting_ing.leather.leather"), 1),
    ],
    craft_sprite: Some(Forge),   // None | Forge | CraftingBench | SpinningWheel | etc.
    disabled: false,
)
```

---

## Abilities (`CharacterAbility`)

**Location:** `assets/common/abilities/`

See [Adding a spell](/contribucion/agregar-hechizo) for full examples by type.

Fields common to all types:

```ron
energy_cost: 20.0,          // energy consumed
buildup_duration: 0.3,      // charge time (seconds)
recover_duration: 0.2,      // cooldown after execution
```

---

## Conventions

- Use `snake_case` for file names: `iron_sword.ron`, `cave_troll.ron`
- Organize by type in subfolders: `weapons/sword/`, `wild/aggressive/`
- `legacy_names` is only for renaming existing assets — leave it empty for new assets
- `//` comments are valid in RON and recommended for non-obvious fields
