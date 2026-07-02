---
sidebar_position: 5
---

# Adding an NPC

Step-by-step guide for adding a new NPC to the game.

An NPC in Xindeler has two layers:
1. **Entity definition** — what body, stats, and equipment it has
2. **rtsim behavior** — how it acts in the world simulation (optional for simple NPCs)

This guide covers a static NPC with basic behavior. For NPCs with complex AURORA AI, see the [AURORA](/aurora/intro) section.

---

## Files you'll touch

| File | What it defines |
|---------|-----------|
| `assets/common/entity/humanoid/` | RON template for the NPC |
| `world/src/site2/plot/` | Where it spawns in the world (optional) |
| `server/src/rtsim/entity.rs` | rtsim registration (only if it has persistent state) |

---

## Step 1: Create the entity template

Create a RON file in `assets/common/entity/humanoid/` (or the folder matching its type):

```
assets/common/entity/humanoid/vendedor_pociones.ron
```

```ron
EntityConfig(
    name: Name("Vendedor de Pociones"),
    body: Body(
        kind: Humanoid(HumanoidBody(
            species: Human,
            body_type: Male,
        )),
    ),
    alignment: Alignment::Npc,
    loot: LootSpec::Item(
        "common.items.consumable.potion_minor",
    ),
    inventory: Inventory(
        items: [
            (
                item: "common.items.consumable.potion_minor",
                amount: 5,
            ),
        ],
    ),
    skillset_asset: Some("common.skillset.merchant"),
)
```

Key fields:

| Field | Description |
|-------|-------------|
| `name` | Name shown above the NPC |
| `body` | Appearance: species, body type |
| `alignment` | `Npc` (neutral), `Enemy`, `Friendly` |
| `loot` | What it drops on death |
| `inventory` | Items it carries (for merchants) |
| `skillset_asset` | Combat abilities it uses |

---

## Step 2: Register the spawn in the world

For the NPC to appear in a city, edit the relevant plot in `world/src/site2/plot/`. For example, for a merchant in a village:

```rust
// In world/src/site2/plot/town.rs (or the relevant plot)
spawns.push(EntityInfo::at(pos)
    .with_asset_expect("common.entity.humanoid.vendedor_pociones")
    .with_alignment(Alignment::Npc));
```

If you want it to appear at multiple sites of the same type, the generation system distributes it automatically.

---

## Step 3: (Optional) Give it persistent state in rtsim

If the NPC needs to remember things across sessions (persistent inventory, relationships with players, trade routes), register it in `server/src/rtsim/entity.rs`:

```rust
// Add a variant to the rtsim NPC kind enum
pub enum NpcKind {
    // ... existing variants
    Merchant,
}
```

And in the rtsim spawn logic, associate your RON template with the kind:

```rust
NpcKind::Merchant => "common.entity.humanoid.vendedor_pociones",
```

For NPCs without persistent state (decorative, static guards), this step isn't necessary.

---

## Step 4: Verify

```bash
cargo build
cargo run --bin xindeler-server
```

Connect with the client, travel to an area with your site type, and verify the NPC appears. If it doesn't appear, check:

- That the path in the RON file is correct (no typos)
- That the site where you're trying to spawn it uses the plot you edited
- The server logs for asset loading errors:
  ```
  [ERROR] Failed to load asset: common.entity.humanoid.vendedor_pociones
  ```

---

## Step 5: Commit

```bash
git add assets/common/entity/humanoid/vendedor_pociones.ron
git add world/src/site2/plot/town.rs   # if you modified it
git commit -m "feat: add potion vendor NPC to town sites"
```

Open the PR with a description of what type of NPC it is and where it appears.
