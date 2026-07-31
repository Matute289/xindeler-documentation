---
sidebar_position: 1
---

# Combat

Combat resolution lives in `common/src/combat.rs` (~4200 lines) and runs inside the server ECS's `CombatSystem` — see [Server architecture](/servidor/arquitectura). Everything goes through `Attack::apply_attack`: a single entry point that resolves hit/miss, damage, poise, buffs, and side effects for any attack, whether it's a martial swing or a spell.

Balance numbers (base probabilities, curves, caps) aren't hardcoded in Rust — they live in the `assets/common/combat_tuning.ron` asset (`CombatTuning`), cached and re-read on every `apply_attack`. These are first-pass numbers (BL-52) subject to retuning from telemetry, same as `class_attributes.ron` — see [Classes](/sistemas/clases).

---

## Hit resolution: accuracy vs evasion

A **single-target** attack (`AttackSource::Melee` or `Projectile`) rolls a hit check before any damage is applied:

```
hit% = clamp(base_hit + (accuracy − evasion) · hit_k, hit_floor, hit_ceil)
```

With the current `combat_tuning.ron` values:

| Constant | Value | Meaning |
|---|---|---|
| `base_hit` | 0.85 | hit% when accuracy == evasion |
| `hit_k` | 0.015 | +1.5pp of hit% per net point of advantage |
| `hit_floor` / `hit_ceil` | 0.05 / 1.0 | never below 5% miss chance; optimal investment can guarantee a hit |

Magic attacks (any ability whose `AbilityMeta.source` is set) roll `magic_accuracy` against `magic_evasion`; physical attacks use `accuracy`/`evasion`. The target's physical evasion also adds a contribution from equipped armor (`compute_armor_evasion`): heavier armor lowers it, going unarmored maximizes it (`gear_evasion_cap: 12.0`, `gear_evasion_floor: -10.0`, a flat `-2.0` if the target is carrying a shield). Both stat pairs (physical and magic) are per-class/level curves defined in `class_attributes.ron` — see [Classes](/sistemas/clases).

A miss (`attack_missed`) cancels damage and hostile effects entirely — the same gate an active dodge uses — and shows a "Miss" floater over the target. A spell that misses simply fizzles, with no further penalty.

**AoE never rolls to-hit.** `Beam`, `Shockwave`, `Explosion`, `Arc`, and `Pool` auto-hit the radius and are mitigated passively via typed elemental resistance (`aoe_resistance`, soft-capped at 75% so stacked resistance can never reach immunity) — the multi-target hot path stays RNG-free by design.

Resisted effects like charm/domination/banishment (`power_word_divine_word`) use a separate saving-throw roll, `saving_throw_chance` (caster `magic_accuracy` vs the target's effective `magic_evasion`, adjusted by magic resistance and a -20pp penalty if the target is already fighting the caster). It's the same function for any future resisted effect — there's no second curve.

---

## Crits and positional precision (backstab)

A single-target attack that lands can roll a critical hit:

```
crit_chance = clamp(Stats::crit_chance, crit_chance_floor, crit_chance_cap)
```

`crit_chance_floor = 0.03` (nobody has 0% crit) and `crit_chance_cap = 0.75` for random rolls — the base multiplier is `crit_damage_mult = 1.5`, further scaled by the caster's gear `precision_power`.

On top of that, the engine has a **guaranteed positional critical** that replaces the random roll when it applies: hitting a target's back or flank (based on the angle between its `Ori` and the attack direction), a poised/stunned target, or a few other conditions (`ImminentCritical`, precision vulnerability). `precision_mult_from_flank` in `common/src/combat.rs:3213` defines the angles and multipliers:

| Zone | Angle | Base multiplier |
|---|---|---|
| Backstab | < 45° (`FULL_FLANK_ANGLE`) | `MAX_BACK_FLANK_PRECISION` = 0.75 |
| Side flank | < 135° (`PARTIAL_FLANK_ANGLE`) | `MAX_SIDE_FLANK_PRECISION` = 0.25 |
| Frontal | ≥ 135° | no positional bonus |

These multipliers are further scaled by `FlankMults` (`back`/`front`/`side`), which a weapon or passive can adjust — and by `precision_flank_invert`, which flips which side of the target counts as "back" (used by abilities that reward frontal attacks, e.g. duelist-style kits). If no positional condition fires, it falls back to the random `crit_chance` roll described above — the two are mutually exclusive, not additive.

---

## Poise and stagger

Poise (`common/src/comp/poise.rs`, the `Poise` component) is a bar separate from health that, once emptied, interrupts the target. `PoiseState` has 5 states:

| State | Threshold (`POISE_THRESHOLDS`) | Stun duration | Poise→health damage multiplier |
|---|---|---|---|
| `Normal` | — | — | — |
| `Interrupted` | 50 | 200ms + 200ms recover | 0.1 |
| `Stunned` | 30 | 350ms + 350ms recover | 0.25 |
| `Dazed` | 15 | 750ms + 750ms recover, movement at 20% | 0.5 |
| `KnockedDown` | 5 | 1.5s + 1.5s recover, movement at 0%, 10.0 knockback impulse | 1.0 |

After a poise-break, `POISE_BUFFER_TIME` (1 second) protects the target from taking poise damage again immediately. Poise damage comes from two paths: an attack's `CombatEffect::Poise(f32)` field, and — passively — **`Crushing` damage**, which converts part of the damage absorbed by armor into extra poise (`CRUSHING_POISE_FRACTION = 1.0`), scaling with how armored the target is.

`compute_poise_resilience` gives the poise-damage reduction from equipped armor; sufficiently heavy armor can make an entity fully immune to poise damage.

---

## Damage kinds

`DamageKind` (`common/src/combat.rs:2498`) splits physical from magic/elemental, and some kinds carry their own secondary effect applied inside `apply_attack`:

| Kind | Category | Secondary effect |
|---|---|---|
| `Piercing` | physical | ignores part of armor's protection (`PIERCING_PENETRATION_FRACTION = 0.75`) |
| `Slashing` | physical | drains the target's energy (`SLASHING_ENERGY_FRACTION = 0.5`); any shortfall converts to health damage |
| `Crushing` | physical | extra poise damage (see above); content alias `Bludgeoning` |
| `Energy` | legacy | generic magic catch-all, mitigated generically |
| `Acid`, `Cold`, `Fire`, `Force`, `Lightning`, `Necrotic`, `Poison`, `Psychic`, `Radiant`, `Thunder` | magic/elemental | content taxonomy (ENG-A2); `Necrotic` and `Radiant` are meant as opposite poles, with the affinity interplay still unimplemented |

---

## Buffs and debuffs

An attack's effects beyond raw damage live in `CombatEffect` (`common/src/combat.rs:1736`): `Heal`, `Buff`/`SelfBuff` (applies a `CombatBuff` to the target or the attacker itself), `Knockback`, `EnergyReward`, `Lifesteal`, `Poise`, `Combo`, `AdditionalDamage`, `RefreshBuff` (refreshes a buff kind's duration with some probability), `Energy`, `Transform` (temporary transformation into another entity), and `DebuffsVulnerable` (bonus damage scaling with the target's active debuff count).

The buffs/debuffs themselves (`BuffKind`, `common/src/comp/buff.rs`) are a broader catalog — `Regeneration`, `Shielded` (absorb shield), `ProtectingWard`, `Frenzied`, `Hastened`, `FreedomOfMovement`, and several more — each with its own `strength` curve. This page doesn't enumerate them exhaustively; they belong as much to the magic and consumables systems as to combat — see [Magic](/sistemas/magia) for the casting side.

Which requirements gate an effect (`CombatRequirement`, e.g. `TargetPoised`) and how they're modified (`CombatModification`) are the same generic framework used by martial and spell attacks alike — there's no separate buff system for magic vs. melee combat.
