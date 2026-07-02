---
sidebar_position: 8
---

# Adding a creature

Guide for adding a new creature to the game — from the entity definition to the spawn rules.

---

## Files you'll touch

| File | What it defines |
|---------|-----------|
| `assets/common/entity/wild/` | RON template for the creature |
| `assets/common/abilities/` | Abilities it uses in combat |
| `world/src/layer/wildlife.rs` | Spawn rules by biome |
| `assets/world/wildlife/` | Spawn tables in RON |

---

## Step 1: Create the entity template

Creatures go in `assets/common/entity/wild/` organized by type:

```
assets/common/entity/wild/aggressive/cave_troll.ron
assets/common/entity/wild/peaceful/deer.ron
```

Example — cave troll:

```ron
EntityConfig(
    name: Name("Trol de Cueva"),
    body: Body(
        kind: BipedLarge(BipedLargeBody(
            species: Troll,
            body_type: Male,
        )),
    ),
    alignment: Alignment::Enemy,
    loot: LootSpec::LootTable(
        "common.loot_tables.creatures.biped_large.troll",
    ),
    skillset_asset: Some("common.skillset.biped_large.troll"),
    flee_health: 0.1,
    idle_wander_factor: 0.5,
    aggro_range: 15.0,
)
```

Example — deer (peaceful creature):

```ron
EntityConfig(
    name: Name("Ciervo"),
    body: Body(
        kind: QuadrupedMedium(QuadrupedMediumBody(
            species: Deer,
            body_type: Male,
        )),
    ),
    alignment: Alignment::Wild,
    loot: LootSpec::LootTable(
        "common.loot_tables.creatures.quadruped_medium.deer",
    ),
    skillset_asset: None,
    flee_health: 0.5,
    idle_wander_factor: 1.0,
    aggro_range: 0.0,
)
```

### Key fields

| Field | Description |
|-------|-------------|
| `alignment` | `Wild` (flees), `Enemy` (attacks), `Passive` (ignores) |
| `flee_health` | % health at which it starts fleeing (0.0 = never flees) |
| `aggro_range` | Radius at which it detects and attacks players |
| `idle_wander_factor` | How much it wanders when calm |
| `skillset_asset` | Combat abilities. `None` for creatures with no attack |

---

## Step 2: Create the loot table

Create the loot table in `assets/common/loot_tables/creatures/`:

```ron
// assets/common/loot_tables/creatures/biped_large/troll.ron
LootSpec::MultiDrop(
    drops: [
        (1.0, LootSpec::Item("common.items.crafting_ing.stone.granite")),
        (0.6, LootSpec::Item("common.items.crafting_ing.leather.tough_leather")),
        (0.2, LootSpec::Item("common.items.weapons.hammer.troll_hammer")),
    ],
)
```

---

## Step 3: Define spawn rules

Add the creature to the wildlife table for the biome where it should appear. The tables are in `assets/world/wildlife/`:

```ron
// In the relevant biome table (e.g. mountains.ron)
SpawnEntry(
    name: "cave_troll",
    rules: [
        SpawnRule(
            // spawns near caves and in rocky areas
            min_time: NoDawn,
            max_time: NoDawn,
            threshold: 0.3,
            group_size: (1, 2),
            entity: EntityConfig(
                asset: "common.entity.wild.aggressive.cave_troll",
            ),
        ),
    ],
),
```

Alternatively, you can register the spawn in code in `world/src/layer/wildlife.rs` if you need more complex logic (spawn conditional on computed biome, variable density, etc.).

---

## Step 4: Assign combat abilities

If the creature attacks, create or reuse a skillset in `assets/common/skillset/`:

```ron
// assets/common/skillset/biped_large/troll.ron
SkillSetConfig(
    guard_resist: 0.6,
    body_size_modifier: 1.5,
    primary: Some("common.abilities.biped_large.troll.basic_attack"),
    secondary: Some("common.abilities.biped_large.troll.shockwave"),
    abilities: [],
)
```

And the individual abilities in `assets/common/abilities/biped_large/troll/`:

```ron
// basic_attack.ron
BasicMelee(
    energy_cost: 0.0,
    buildup_duration: 0.6,
    swing_duration: 0.2,
    recover_duration: 0.5,
    melee_constructor: MeleeConstructor(
        kind: Bash,
        scaled: None,
        range: 4.0,
        angle: 45.0,
        damage: 28.0,
        knockback: 15.0,
        poise_damage: 50.0,
    ),
)
```

---

## Step 5: Verify in-game

```bash
cargo build
cargo run --bin xindeler-server
```

To spawn the creature directly and test it without hunting for it in the world:

```
/summon common.entity.wild.aggressive.cave_troll
```

Verify:
- Correct model and name
- Combat behavior (aggro, fleeing)
- Loot on death
- That the server doesn't crash on death or when it leaves a player's range

---

## Step 6: Commit

```bash
git add assets/common/entity/wild/aggressive/cave_troll.ron
git add assets/common/loot_tables/creatures/biped_large/troll.ron
git add assets/common/skillset/biped_large/troll.ron
git add assets/common/abilities/biped_large/troll/
git add assets/world/wildlife/mountains.ron  # if you modified it
git commit -m "feat: add cave troll creature with loot and spawn rules"
```
