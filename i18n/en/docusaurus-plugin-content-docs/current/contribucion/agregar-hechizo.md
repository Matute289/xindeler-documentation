---
sidebar_position: 6
---

# Adding a spell

Step-by-step guide for adding a new ability or spell to the game.

In Xindeler, "spell" and "ability" are the same system. Both a sword combo and a fireball are defined with the same `CharacterAbility` type in RON. The difference lies in the type and the effects.

---

## Files you'll touch

| File | What it defines |
|---------|-----------|
| `assets/common/abilities/` | RON definition of the ability |
| `assets/common/skillset/` | Which skillset it belongs to |
| `common/src/comp/ability.rs` | The `CharacterAbility` type (only if you need a new type) |

For most new spells you only need the RON files.

---

## Step 1: Choose the ability type

Check which `CharacterAbility` variants already exist in `common/src/comp/ability.rs`:

| Type | Description |
|------|-------------|
| `BasicMelee` | Melee attack with damage and knockback |
| `BasicRanged` | Projectile that travels and applies damage on impact |
| `BasicBeam` | Continuous beam (fire, ice, magic) |
| `ComboMelee2` | Combo of multiple chained hits |
| `BasicAura` | Aura that affects entities within a radius |
| `SpinMelee` | Spinning area attack |
| `Shockwave` | Expanding wave with knockback |
| `LeapMelee` | Leap toward target + attack on impact |

If the spell fits one of these, you only need RON. If not, see Step 5.

---

## Step 2: Create the RON file

Create the file in `assets/common/abilities/`. Organize by type or by class:

```
assets/common/abilities/magic/fireball.ron
```

Example — fireball:

```ron
BasicRanged(
    energy_cost: 20.0,
    buildup_duration: 0.3,
    recover_duration: 0.2,
    projectile: Fireball,
    projectile_body: Body::Object(Object::FireworkRed),
    projectile_light: Some(LightEmitter(
        col: Rgb(1.0, 0.4, 0.0),
        strength: 2.0,
        flicker: 0.5,
        animated: true,
    )),
    projectile_speed: 25.0,
    num_projectiles: 1,
    projectile_spread: 0.0,
)
```

Example — healing aura:

```ron
BasicAura(
    energy_cost: 40.0,
    buildup_duration: 0.5,
    cast_duration: 0.0,
    recover_duration: 0.5,
    targets: AuraTarget::GroupMembers,
    aura: AuraData(
        kind: AuraKind::Buff(BuffKind::Regeneration),
        strength: 5.0,
        radius: 8.0,
        duration: Some(10.0),
    ),
    specifier: Some(FrontendSpecifier::HealingAura),
)
```

Common key fields:

| Field | Description |
|-------|-------------|
| `energy_cost` | Energy consumed on activation |
| `buildup_duration` | Charge-up time before executing (seconds) |
| `recover_duration` | Cooldown after executing |

---

## Step 3: Assign to a skillset

For players to be able to use the spell, add it to the relevant skillset in `assets/common/skillset/` and reference it as a primary, secondary, or auxiliary ability in the entity definition:

```ron
ability_set: AbilitySet(
    primary: "common.abilities.magic.fireball",
    secondary: None,
    abilities: [],
)
```

---

## Step 4: Verify in-game

```bash
cargo build
cargo run --bin xindeler-server
```

If the spell doesn't show up, check the logs for RON parsing errors:

```
[ERROR] Failed to load ability: common.abilities.magic.fireball
```

To test quickly, you can temporarily modify the skillset of a test NPC without touching the players' skillset.

---

## Step 5: Add a new type (advanced)

If none of the existing `CharacterAbility` variants fit what you need, you'll need to add one in Rust:

1. Add the variant to the `CharacterAbility` enum in `common/src/comp/ability.rs`
2. Implement the state in `common/src/states/`
3. Register the logic in `server/src/sys/combat.rs`
4. Implement the animation in `voxygen/src/anim/`

This is significant work — open a GitHub issue to coordinate with the team before taking it on.

---

## Step 6: Commit

```bash
git add assets/common/abilities/magic/fireball.ron
git commit -m "feat: add fireball ability"
```
