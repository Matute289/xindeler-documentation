---
sidebar_position: 2
---

# Magic

The magic model lives in `common/src/comp/ability.rs`, in the `AbilityMeta` struct hanging off every `CharacterAbility`. Each spell tags two independent axes:

- **`source: Option<MagicSource>`** — where the energy comes from (the fuel).
- **`school: Option<School>`** — what physical form the effect takes.

Combat reads the ability as-is; the spellbook UI, class gating, and tooltips read this metadata (`common/src/comp/spell.rs`). For how a magic attack resolves against accuracy/evasion, poise, and crit, see [Combat](/sistemas/combate).

---

## The 5 magic sources (`MagicSource`)

`MagicSource` (`common/src/comp/ability.rs:4054`) has exactly 5 variants:

| Source | What it is (paraphrased from the engine's doc-comment) | Classes that use it |
|---|---|---|
| **Arcane** | The Veil — study, bloodline, pact, or art | Mage (study), Sorcerer (bloodline), Warlock (pact), Bard (art), Artificer (half) |
| **Divine** | The gods' channel through the Veil — faith and oaths | Cleric, Paladin (oath) |
| **Primordial** | The Song still singing in the world — nature and elements, shaped by the Primordials | Druid, Ranger |
| **Psionic** | Leakage from the Beyond — the mind as an unlicensed gate | no class in the current roster claims it yet (see below) |
| **Ki** | The Song flowing through a living body — discipline and ki | Monk |

The full 14-class roster is in [Classes](/sistemas/clases); that's also where Blood Slayer lives, whose identity is Hemomancy + martial. `Psionic` is in the engine's enum and has its own mechanics (see `disable_magic` / the antimagic field below), but none of the 14 current playable classes has it assigned as a source — it's reserved for future content (psionic subclasses, per earlier design drafts).

Source and school are independent axes on purpose: **Ki and Psionic abilities usually have no school** (`school: None`) — a monk's strike or a mind-blast isn't a classic "spell-form", it's the source alone.

---

## Schools: the shape of the spell (`School`)

`School` (`common/src/comp/ability.rs:4021`) covers the 8 classic schools plus 2 original ones:

```
Abjuration · Conjuration · Divination · Enchantment · Evocation ·
Illusion · Necromancy · Transmutation · Axiomancy · Hemomancy
```

The last two are **meta-schools**: `AbilityMeta` carries a separate `form: Option<School>` field holding the classic school the effect physically takes, so a spell can be tagged as `Axiomancy(Subschool · Form)` — e.g. Axiomancy with subschool `Gravimancy` and `form: Evocation`. `AxiomSub` has 2 variants, `Chronomancy` (time/fate) and `Gravimancy` (gravity/mass) — the internal analog to "Chronurgy/Graviturgy", with those specific names deliberately avoided for IP reasons.

**Hemomancy** is "blood-fuelled, self-corrupting magic" per its own doc-comment — the school behind the HP cost (see below).

### The Mage's spellbook

Mage is the most versatile spellbook in the roster (see [Classes](/sistemas/clases)). As of now, the spell compendium (`assets/common/spells/compendium.ron`) gates it spells from **Abjuration, Axiomancy, Enchantment, Evocation, Hemomancy (interim), Necromancy, and Transmutation** — verified by counting the `classes: [Mage]` entries in the compendium, not a fixed list in code. Other classes have their own subsets: Cleric concentrates divine-flavored Enchantment/Necromancy, Paladin has its own smites, and so on — the full compendium is the source of truth; this page doesn't enumerate all of it.

---

## Energy: the resource behind most casting

Every `CharacterAbility` variant (`BasicRanged`, `BasicBeam`, `BasicAura`, `ChargedRanged`, `SelfBuff`, etc.) carries its own `energy_cost` — energy is the default resource spent to cast nearly any ability, martial or magic.

### The exception: Hemomancy's "blood price"

`AbilityMeta` has a separate field, `hp_cost: Option<f32>` — Hemomancy's "blood price" (M4/ENG-C1). When set, casting that spell also takes this much HP from the caster's own health, **on top of** its normal `energy_cost` — it doesn't replace it. For example, `hemal_spike.ron` is a `BasicRanged` with `energy_cost: 70` and `hp_cost: Some(3.0)` in its meta; `crimson_apotheosis.ron` (a self-buff) has `energy_cost: 225` and `hp_cost: Some(30.0)`. The stronger the spell, the more blood it asks for — that's an explicit design guideline, not a fixed per-circle number.

The engine protects a 1-HP floor: `hp_cost_affordable` (`common/src/states/utils.rs:1659`) refuses the cast if it would leave the caster below `cost + 1`. In **hardcore mode** that floor disappears — the cast goes through anyway, blood to the last drop.

Conceptually, Blood Slayer is the class built to live off this HP-for-power trade (see [Classes](/sistemas/clases)); in the current compendium, though, Hemomancy is gated interim to `classes: [Mage]` only while the Blood Slayer rework is finished — re-gating it to Blood Slayer (and eventually Warlock) is pending work, not something already live in the game.

---

## Antimagic

An antimagic field (`Stats::disable_magic`) blocks any ability whose `AbilityMeta.source` is set — physical or innate abilities (`source: None`) pass through unaffected. It's the same filter that gates `hp_cost_affordable` and the rest of an ability's requirements, in `common/src/states/utils.rs`.
