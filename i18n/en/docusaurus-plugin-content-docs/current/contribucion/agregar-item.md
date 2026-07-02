---
sidebar_position: 7
---

# Adding an item

Step-by-step guide for adding a new item to the game.

Items in Xindeler are defined in RON files under `assets/common/items/`. The game loads every file in that folder on startup — there's no manual code registration for simple items.

---

## Item types

| Type | Folder | Examples |
|------|---------|---------|
| Weapons | `assets/common/items/weapons/` | swords, bows, staves |
| Armor | `assets/common/items/armor/` | helmets, chestplates, boots |
| Consumables | `assets/common/items/consumable/` | potions, food |
| Materials | `assets/common/items/crafting_ing/` | ore, wood, leather |
| Tools | `assets/common/items/tools/` | pickaxe, axe, fishing rod |

---

## Step 1: Create the RON file

Create the file in the appropriate folder. The file's path defines the item's **ID** in the game — use it in loot tables, recipes, and code.

Example — iron sword (`assets/common/items/weapons/sword/iron_sword.ron`):

```ron
ItemDef(
    legacy_names: [],
    name: "Espada de Hierro",
    description: "Una espada básica forjada en hierro.",
    kind: Sword(SwordToolKind(
        hands: OneHand,
    )),
    quality: Common,
    tags: [],
    slots: 0,
)
```

Example — minor potion (`assets/common/items/consumable/potion_minor.ron`):

```ron
ItemDef(
    legacy_names: ["old.potion_minor"],
    name: "Poción Menor",
    description: "Restaura una pequeña cantidad de vida.",
    kind: Consumable(
        kind: Potion,
        effects: [
            Effect::Heal(30.0),
        ],
    ),
    quality: Common,
    tags: [Potion],
    slots: 16,
)
```

### Common fields

| Field | Description |
|-------|-------------|
| `legacy_names` | Previous IDs of the item (for save migration). Leave empty for new items. |
| `name` | Name shown in-game |
| `description` | Tooltip text |
| `kind` | Item type and its specific stats |
| `quality` | `Common`, `Moderate`, `High`, `Epic`, `Legendary`, `Artifact` |
| `tags` | Tags for filters and recipes (e.g. `Potion`, `Metal`, `Armor`) |
| `slots` | Maximum stack size. `0` = not stackable. |

---

## Step 2: Add to loot tables (optional)

For the item to drop from creatures or containers, edit the relevant loot table in `assets/common/loot_tables/`:

```ron
// assets/common/loot_tables/creatures/humanoid/bandit.ron
LootSpec::MultiDrop(
    drops: [
        (1.0, LootSpec::Item("common.items.weapons.sword.iron_sword")),
        (0.5, LootSpec::Item("common.items.consumable.potion_minor")),
        (0.3, LootSpec::Nothing),
    ],
)
```

The numbers are relative weights — they don't have to add up to 1.

---

## Step 3: Add to crafting recipes (optional)

For the item to be craftable, edit `assets/common/recipe_book/` or create a new file:

```ron
// In the corresponding recipe book
Recipe(
    output: ("common.items.weapons.sword.iron_sword", 1),
    inputs: [
        (RecipeInput::Item("common.items.crafting_ing.metal.iron_ingot"), 3),
        (RecipeInput::Item("common.items.crafting_ing.leather.leather"), 1),
    ],
    craft_sprite: Some(Forge),
)
```

`craft_sprite` defines which crafting station the recipe appears at (`Forge`, `CraftingBench`, `SpinningWheel`, etc.).

---

## Step 4: Verify

```bash
cargo build
```

If there are parsing errors in the RON, the server reports them on startup:

```
[ERROR] Failed to deserialize item: assets/common/items/weapons/sword/iron_sword.ron
thread 'main' panicked at 'could not parse RON: ...'
```

To test the item in-game, use the admin command:

```
/give_item common.items.weapons.sword.iron_sword 1
```

Verify that the name, description, stats, and model display correctly in the inventory.

---

## Step 5: Commit

```bash
git add assets/common/items/weapons/sword/iron_sword.ron
git add assets/common/loot_tables/creatures/humanoid/bandit.ron  # if you modified it
git commit -m "feat: add iron sword item with bandit loot table entry"
```
