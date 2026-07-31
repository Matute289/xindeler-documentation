---
sidebar_position: 3
---

# Classes

Xindeler has **14 playable classes** (`ClassKind` in `common/src/comp/class.rs`), plus `Adventurer` as a legacy/default class that isn't selectable at character creation.

## Full roster

| Class | Magic source (gating) | Identity |
|---|---|---|
| Warrior | — (martial) | weapons master |
| Barbarian | — (martial) | rage as a self-buff; highest health curve in the game |
| Rogue | — (martial) | precision, stealth |
| Mage | Arcane (study) | versatile spellbook, multiple schools |
| Sorcerer | Arcane (bloodline) | innate surges, metamagic |
| Warlock | Arcane (pact) | patron-granted power; lowest health curve in the game |
| Bard | Arcane (art) | support/control via music |
| Cleric | Divine | divine channel |
| Paladin | Divine (oath) | smites, auras |
| Druid | Primordial | shapeshift + nature magic |
| Ranger | Primordial | hunter half-caster |
| Monk | Ki | unarmed discipline; ki as an energy rework |
| Artificer | Arcane (half) | infusions (mechanic not yet implemented) |
| Blood Slayer | Hemomancy + martial | spells paid with the caster's own HP instead of energy |

The first 4 (Warrior, Rogue, Mage, Cleric) were the original wave. The remaining 10 were added in BL-04 ("classes-wave", `specs/2026-06-22-classes-wave-design.md`).

## Implementation status

All 14 are selectable at character creation and have: their own `ClassKind`, per-class attributes (`class_attributes.ron`), persistence, a starting kit (weapon + outfit + consumable), and equipment restrictions. What the 10 newer ones **don't** have yet is a populated skill tree of their own — the BL-04 spec states this explicitly ("skill trees empty, populate later" = BL-06, not yet shipped). Until that lands, those 10 classes play on their base kit with no specialized abilities layered on top.

Several of the 10 newer classes' starting kits are placeholders reused from the original 4 (e.g. Sorcerer's outfit reuses the Mage's purple robes, Warlock reuses the Cleric's vestments) — this is noted as such directly in the loadout RONs (`assets/common/loadout/class/*.ron`).

## Per-class attributes

`assets/common/class/class_attributes.ron` defines, per class: `base_health`/`per_level_health`, `base_energy`/`per_level_energy`, `per_level_damage`, `energy_reward_mult`, and physical/magic accuracy/evasion/crit curves. Applied each tick after `Stats::reset_temp_modifiers`, same as racial passives. These are first-pass numbers (game-balance-designer) subject to telemetry-driven retuning — don't treat them as final values.

## Multiclassing

From level 20 onward, a character can take on a second class without losing progress in the first (`grant_second_class`, `MULTICLASS_MIN_LEVEL = 20` in `common/src/comp/class.rs`). Maximum two classes (`CharacterClass{primary, secondary}`). Levels earned after taking the second class are split between both.
