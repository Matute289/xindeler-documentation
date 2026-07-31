---
sidebar_position: 8
---

# Abilities

The ability system lives in `common/src/comp/skillset/mod.rs` (`SkillSet`, `SkillGroup`) and `common/src/comp/skillset/skills.rs` (the `Skill` enum). A character doesn't have a single tree: it has several independent **skill groups** (`SkillGroupKind`), each with its own experience and its own skill points (SP).

For the class roster and its implementation status, see [Classes](/sistemas/clases). This page focuses on how points are earned and spent.

---

## Character level: derived, not saved

Character level is **not persisted**. `SkillSet::character_level` is always recomputed from lifetime total earned experience:

```rust
pub const MAX_CHARACTER_LEVEL: u16 = 60;
pub const LEVEL_XP_BASE: u32 = 250;

pub fn level_from_total_exp(total_exp: u32) -> u16 { /* ... */ }
```

`level_from_total_exp` uses `LEVEL_XP_BASE * (L - 1)^2` as the cumulative XP required for level `L`, capped at `MAX_CHARACTER_LEVEL = 60`. The `character_level` field is marked `#[serde(skip)]` — it never goes over the wire and is never saved to the DB, so it can't desync: it's rebuilt on every deserialization (`SkillSetMeta` → `SkillSet`) by summing `earned_exp` across all `SkillGroup`s.

---

## Skill groups (`SkillGroupKind`)

```rust
pub enum SkillGroupKind {
    General,
    Weapon(ToolKind),
    Class(ClassKind),
    Feats,
}
```

| Group | How it's unlocked | How it earns XP |
|---|---|---|
| `General` | Always available from character creation (`initial_skills()`) | Every kill/activity that grants combat XP |
| `Weapon(ToolKind)` | The player spends a `General` skill (`UnlockGroup(Weapon(..))`) to unlock it | Only while that weapon is equipped (mainhand/offhand, active or inactive) |
| `Class(ClassKind)` | Granted directly at character creation / `/set_class` (`unlock_skill_group`) | Always active, like `General` — it's the only source of SP for the class tree |
| `Feats` | Granted directly by level milestones (see below) | Doesn't earn XP — SP is granted outright, no XP economy |

`Class` and `Feats` are the two groups flagged `is_directly_granted()` — they're granted explicitly instead of being unlocked by spending a skill from another tree, which is why they need their `UnlockGroup` skill re-seeded when loading from the database (`load_from_database`, see [Persistence](/servidor/persistencia)).

### Where combat XP comes from

`server/src/events/entity_manipulation.rs` builds the set of XP "pools" to split each combat reward across:

- `General` is always included.
- Every equipped weapon (mainhand/offhand, active and inactive) that has an accessible `SkillGroupKind::Weapon` gets added to the pool.
- The character's `Class(_)` group(s) count as **a single slot**, regardless of whether the character is multiclassed (two class groups split that slice 50/50 between them instead of diluting `General` and the weapons).

The XP reward is divided evenly across all active pools. Fighting with a sword equipped splits XP between `General`, `Weapon(Sword)`, and the character's class(es) — there's no need to "train" the tree of a weapon you aren't using.

---

## Skill points (SP): how they're earned and spent

Each `SkillGroup` tracks `earned_exp`/`available_exp` (XP) and `earned_sp`/`available_sp` (points). `add_experience` on a group tries to convert XP into SP automatically in a loop (`earn_skill_point`), so a single large reward can grant several points at once.

The XP cost of the *next* point rises with how many points have already been earned in that group (`skill_point_cost`, a different curve for `Weapon`/`Class` than for `General`/`Feats`). Spending an SP on a specific skill goes through `unlock_skill`, which validates:

- that the group has available SP,
- that the skill isn't already at max level (`SKILL_MAX_LEVEL`),
- that prerequisites are met (`SKILL_PREREQUISITES`, with `All`/`Any` variants).

### Feats: points from level milestones, no XP

Feats are the exception to the XP economy. `SkillSet::grant_skill_point` grants them directly, bypassing `earn_skill_point`:

```rust
// server/src/events/entity_manipulation.rs
for milestone in [15, 25, 35, 45] {
    if level_before < milestone && level_after >= milestone {
        skill_set.grant_skill_point(SkillGroupKind::Feats);
    }
}
```

One feat point per 10 character levels starting at 15, up to 4 total points at level 45. If a single XP gain crosses several milestones at once (e.g. a `/set_level` jump from 13 to 30), one point is granted per milestone crossed. `Feats` is class-agnostic: it's available to any character in parallel to `General`.

Since these points don't come from XP, they're stored in separate database columns (`direct_earned_sp`/`direct_available_sp`, migration `V74__skill_group_direct_sp.sql`) so they aren't lost on every reload — see [Persistence](/servidor/persistencia).

---

## Defined trees (`skills_skill-groups_manifest.ron`)

The actual contents of each tree — which skills belong to which group — live in `assets/common/skill_trees/skills_skill-groups_manifest.ron`, not in Rust code. Here's what's in it today:

- **`General`**: weapon unlocks (`UnlockGroup(Weapon(Sword|Axe|Hammer|Bow|Staff|Sceptre))`) plus traversal upgrades (`Climb(Cost)`, `Climb(Speed)`, `Swim(Speed)`).
- **`Weapon(Sword)`** and equivalents for `Axe`, `Hammer`, `Bow`, `Staff`, `Sceptre`, `Pick`: full per-weapon combat trees (Heavy/Cleaving/Agile/Crippling/Defensive-style families depending on the weapon, e.g. `Sword(HeavySweep)`, `Sword(AgileFlurry)`, `Sword(DefensiveRiposte)`).
- **`Class(Warrior)`, `Class(Mage)`, `Class(Cleric)`, `Class(Rogue)`**: 12 skills each (the 4 original classes, "BL-06 proof slice" wave). Example, Mage: `FocusedMind`, `TrueAim`, `ArcaneSurge`, `SpellPotency`, `PyromanticAttunement`, `CryomanticAttunement`, `QuickCasting`, `PenetratingMagic`, `WardedSkin`, `ManaEfficiency`, `Overcharge`, `ArcaneMastery`.
- **`Class(Barbarian)`, `Class(Sorcerer)`, `Class(Warlock)`, `Class(Bard)`, `Class(Paladin)`, `Class(Druid)`, `Class(Ranger)`, `Class(Monk)`, `Class(Artificer)`, `Class(BloodSlayer)`**: **empty lists** (`[]`) in the manifest, explicitly commented as `"Classes-wave (BL-04): empty trees now; populated per-class in BL-06"`. These 10 classes are playable and have their own starting kit and attributes (see [Classes](/sistemas/clases)), but **don't have a populated skill tree yet** — the `Class(_)` group still exists and accumulates XP/SP, there just isn't anything to spend those points on yet.
- **`Feats`**: a long, class-agnostic list, grouped by comments into thematic sections (`Combat`, `Magic`, and more — see the RON file directly for the full listing, not itemized here).

If you're implementing a new class tree (BL-06), this manifest is the entry point: adding the corresponding `Skill(...)` entries to `Class(YourClass)`'s list makes them automatically spendable there, as long as the `Skill` enum in `skills.rs` already has the needed variants.

---

## `SkillSetBuilder` presets: not the player's tree

`common/src/skillset_builder.rs` defines a `SkillSetBuilder` with a `Preset` enum (`Rank1`..`Rank5`) that loads RON from `assets/common/skillset/preset/rank{1..5}/{general,sword,axe,hammer,bow,staff,sceptre,fullskill}.ron`. **This is not the player progression system** — it's a full-skillset generator used to build NPCs and summoned entities (`server/src/states/basic_summon.rs`, spell summons) at a predefined combat power level.

The per-rank files scale up how many skills of that weapon's tree are unlocked: `rank1/sword.ron` only brings `Group(Weapon(Sword))` (the group unlocked, no skills), while `rank5/sword.ron` brings almost the entire sword tree (`HeavySweep`, `CleavingEarthSplitter`, `AgileFlurry`, `DefensiveDeflect`, etc., all at level 1). `fullskill.ron` at each rank is a `Tree(...)` node that concatenates every weapon tree plus `general` for that same rank — useful for giving a summon a "full" kit at a given power level without listing every skill by hand.

---

## See also

- [Classes](/sistemas/clases) — full roster, per-class attributes, multiclassing
- [Persistence (server)](/servidor/persistencia) — how `SkillSet` and its groups are saved
- [Combat (server)](/servidor/combat) — where the XP reward that feeds this system comes from
