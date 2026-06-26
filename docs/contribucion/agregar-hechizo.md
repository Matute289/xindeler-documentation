---
sidebar_position: 6
---

# Agregar un hechizo

Guía paso a paso para agregar una nueva habilidad o hechizo al juego.

En Xindeler, "hechizo" y "habilidad" son el mismo sistema. Tanto un combo de espada como una bola de fuego se definen con el mismo tipo `CharacterAbility` en RON. La diferencia está en el tipo y los efectos.

---

## Archivos que vas a tocar

| Archivo | Qué define |
|---------|-----------|
| `assets/common/abilities/` | Definición RON de la habilidad |
| `assets/common/skillset/` | A qué skillset pertenece |
| `common/src/comp/ability.rs` | El tipo `CharacterAbility` (solo si necesitás un tipo nuevo) |

Para la mayoría de hechizos nuevos solo necesitás los archivos RON.

---

## Paso 1: Elegir el tipo de habilidad

Fijate qué `CharacterAbility` ya existen en `common/src/comp/ability.rs`:

| Tipo | Descripción |
|------|-------------|
| `BasicMelee` | Ataque cuerpo a cuerpo con daño y knockback |
| `BasicRanged` | Proyectil que viaja y aplica daño al impactar |
| `BasicBeam` | Rayo continuo (fuego, hielo, magia) |
| `ComboMelee2` | Combo de múltiples hits encadenados |
| `BasicAura` | Aura que afecta entidades en radio |
| `SpinMelee` | Ataque giratorio en área |
| `Shockwave` | Onda expansiva con knockback |
| `LeapMelee` | Salto hacia objetivo + ataque al impactar |

Si el hechizo encaja en alguno, solo necesitás RON. Si no, ver Paso 5.

---

## Paso 2: Crear el archivo RON

Creá el archivo en `assets/common/abilities/`. Organizá por tipo o por clase:

```
assets/common/abilities/magic/fireball.ron
```

Ejemplo — bola de fuego:

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

Ejemplo — aura de curación:

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

Campos clave comunes:

| Campo | Descripción |
|-------|-------------|
| `energy_cost` | Energía consumida al activar |
| `buildup_duration` | Tiempo de carga antes de ejecutar (segundos) |
| `recover_duration` | Cooldown después de ejecutar |

---

## Paso 3: Asignar al skillset

Para que los jugadores puedan usar el hechizo, agregalo al skillset correspondiente en `assets/common/skillset/` y referencialó como habilidad principal, secundaria, o auxiliar en la definición de entidad:

```ron
ability_set: AbilitySet(
    primary: "common.abilities.magic.fireball",
    secondary: None,
    abilities: [],
)
```

---

## Paso 4: Verificar en juego

```bash
cargo build
cargo run --bin xindeler-server
```

Si el hechizo no aparece, revisá los logs por errores de parsing RON:

```
[ERROR] Failed to load ability: common.abilities.magic.fireball
```

Para probar rápido podés modificar temporalmente el skillset de un NPC de test sin tocar el de jugadores.

---

## Paso 5: Agregar un tipo nuevo (avanzado)

Si ningún `CharacterAbility` existente sirve para lo que querés, necesitás agregar uno en Rust:

1. Agregar la variante al enum `CharacterAbility` en `common/src/comp/ability.rs`
2. Implementar el estado en `common/src/states/`
3. Registrar la lógica en `server/src/sys/combat.rs`
4. Implementar la animación en `voxygen/src/anim/`

Esto es trabajo significativo — abrí una issue en GitHub para coordinar con el equipo antes de encararlo.

---

## Paso 6: Commitear

```bash
git add assets/common/abilities/magic/fireball.ron
git commit -m "feat: add fireball ability"
```
