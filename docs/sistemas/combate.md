---
sidebar_position: 1
---

# Combate

La resolución de combate vive en `common/src/combat.rs` (~4200 líneas) y corre dentro del `CombatSystem` del ECS del servidor — ver [Arquitectura del servidor](/servidor/arquitectura). Todo pasa por `Attack::apply_attack`: un único punto de entrada que resuelve golpe/fallo, daño, poise, buffs y efectos secundarios para cualquier ataque, sea un swing marcial o un hechizo.

Los números de balance (probabilidades base, curvas, topes) no están hardcodeados en Rust — viven en el asset `assets/common/combat_tuning.ron` (`CombatTuning`), cacheado y releído en cada `apply_attack`. Son números de primera pasada (BL-52) sujetos a retune por telemetría, igual que `class_attributes.ron` — ver [Clases](/sistemas/clases).

---

## Resolución del golpe: accuracy vs evasion

Un ataque **single-target** (`AttackSource::Melee` o `Projectile`) tira una moneda de impacto antes de aplicar cualquier daño:

```
hit% = clamp(base_hit + (accuracy − evasion) · hit_k, hit_floor, hit_ceil)
```

Con los valores actuales de `combat_tuning.ron`:

| Constante | Valor | Significado |
|---|---|---|
| `base_hit` | 0.85 | hit% con accuracy == evasion |
| `hit_k` | 0.015 | +1.5 pp de hit% por cada punto neto de ventaja |
| `hit_floor` / `hit_ceil` | 0.05 / 1.0 | nunca menos de 5% de fallo; inversión óptima puede garantizar el golpe |

Ataques mágicos (cualquier habilidad cuyo `AbilityMeta.source` esté seteado) tiran `magic_accuracy` contra `magic_evasion`; ataques físicos usan `accuracy`/`evasion`. La evasión física del objetivo suma además una contribución del armor equipado (`compute_armor_evasion`): armor más pesado la baja, ir desarmado la maximiza (`gear_evasion_cap: 12.0`, `gear_evasion_floor: -10.0`, `-2.0` flat si el objetivo lleva escudo). Ambos pares de stats (físico y mágico) son curvas por clase/nivel definidas en `class_attributes.ron` — ver [Clases](/sistemas/clases).

Un fallo (`attack_missed`) anula daño y efectos hostiles por completo — mismo gate que un dodge activo — y muestra un floater de "Miss" sobre el objetivo. Un cast que falla simplemente fizzlea, sin más penalidad.

**AoE nunca tira a impactar.** `Beam`, `Shockwave`, `Explosion`, `Arc` y `Pool` golpean el radio automáticamente y se mitigan de forma pasiva vía resistencia elemental tipada (`aoe_resistance`, con un soft cap de 75% para que el stack de resistencias nunca llegue a inmunidad) — el hot path multi-target queda libre de RNG por diseño.

Efectos resistidos como charm/dominación/banishment (`power_word_divine_word`) usan una tirada de salvación separada, `saving_throw_chance` (`magic_accuracy` del caster vs `magic_evasion` efectiva del objetivo, ajustada por resistencia mágica y una penalización de -20pp si el objetivo ya está peleando contra el caster). Es la misma función para cualquier efecto resistido futuro; no hay una segunda curva.

---

## Críticos y precisión posicional (backstab)

Un golpe single-target que conecta puede rolear un crítico:

```
crit_chance = clamp(Stats::crit_chance, crit_chance_floor, crit_chance_cap)
```

`crit_chance_floor = 0.03` (nadie tiene 0% de crit) y `crit_chance_cap = 0.75` para tiradas aleatorias — el multiplicador base es `crit_damage_mult = 1.5`, escalado además por `precision_power` del equipo.

Por encima de eso, el motor tiene un **crítico posicional garantizado** que reemplaza la tirada aleatoria cuando aplica: atacar por la espalda o el flanco de un objetivo (según el ángulo entre su `Ori` y la dirección del golpe), un objetivo poised/stunneado, u otras condiciones (`ImminentCritical`, vulnerabilidad a precisión). `precision_mult_from_flank` en `common/src/combat.rs:3213` define los ángulos y multiplicadores:

| Zona | Ángulo | Multiplicador base |
|---|---|---|
| Espalda (backstab) | < 45° (`FULL_FLANK_ANGLE`) | `MAX_BACK_FLANK_PRECISION` = 0.75 |
| Flanco lateral | < 135° (`PARTIAL_FLANK_ANGLE`) | `MAX_SIDE_FLANK_PRECISION` = 0.25 |
| De frente | ≥ 135° | sin bonus posicional |

Estos multiplicadores están además escalados por `FlankMults` (`back`/`front`/`side`), que un arma o pasiva puede ajustar — y por `precision_flank_invert`, que invierte qué cara del objetivo cuenta como "espalda" (usado por habilidades que premian atacar de frente, ej. duelistas). Si ninguna condición posicional dispara, se cae a la tirada aleatoria de `crit_chance` descrita arriba — son mutuamente excluyentes, no acumulativos.

---

## Poise y stagger

El poise (`common/src/comp/poise.rs`, componente `Poise`) es una barra separada de la vida que, al vaciarse, interrumpe al objetivo. `PoiseState` tiene 5 estados:

| Estado | Umbral (`POISE_THRESHOLDS`) | Duración stun | Multiplicador de daño de poise→vida |
|---|---|---|---|
| `Normal` | — | — | — |
| `Interrupted` | 50 | 200 ms + 200 ms recover | 0.1 |
| `Stunned` | 30 | 350 ms + 350 ms recover | 0.25 |
| `Dazed` | 15 | 750 ms + 750 ms recover, movimiento a 20% | 0.5 |
| `KnockedDown` | 5 | 1.5 s + 1.5 s recover, movimiento a 0%, impulso de knockback 10.0 | 1.0 |

Después de un poise-break, `POISE_BUFFER_TIME` (1 segundo) protege al objetivo de volver a tomar daño de poise inmediatamente. El daño de poise entra por dos vías: el campo `CombatEffect::Poise(f32)` de un ataque, y — de forma pasiva — **daño `Crushing`**, que convierte parte del daño absorbido por armor en poise adicional (`CRUSHING_POISE_FRACTION = 1.0`) cuanto más armado esté el objetivo.

`compute_poise_resilience` da la reducción de daño de poise recibido por armor equipado; una armadura suficientemente pesada puede volver a la entidad inmune al poise damage por completo.

---

## Tipos de daño

`DamageKind` (`common/src/combat.rs:2498`) distingue físico de mágico/elemental, y algunos tipos tienen un efecto secundario propio aplicado en `apply_attack`:

| Kind | Categoría | Efecto secundario |
|---|---|---|
| `Piercing` | físico | ignora parte de la protección de armor (`PIERCING_PENETRATION_FRACTION = 0.75`) |
| `Slashing` | físico | drena energía del objetivo (`SLASHING_ENERGY_FRACTION = 0.5`); si la energía no alcanza, el excedente se convierte en daño de vida |
| `Crushing` | físico | daño de poise adicional (ver arriba); alias de contenido `Bludgeoning` |
| `Energy` | legacy | catch-all mágico genérico, mitigado de forma genérica |
| `Acid`, `Cold`, `Fire`, `Force`, `Lightning`, `Necrotic`, `Poison`, `Psychic`, `Radiant`, `Thunder` | mágico/elemental | taxonomía de contenido (ENG-A2); `Necrotic` y `Radiant` son polos opuestos en la interacción de afinidades, todavía sin implementar |

---

## Buffs y debuffs

Los efectos de un ataque más allá del daño puro viven en `CombatEffect` (`common/src/combat.rs:1736`): `Heal`, `Buff`/`SelfBuff` (aplica un `CombatBuff` al objetivo o al propio atacante), `Knockback`, `EnergyReward`, `Lifesteal`, `Poise`, `Combo`, `AdditionalDamage`, `RefreshBuff` (refresca duración de buffs de cierto tipo con cierta probabilidad), `Energy`, `Transform` (transformación temporal en otra entidad), y `DebuffsVulnerable` (daño extra según cantidad de debuffs activos en el objetivo).

Los buffs/debuffs en sí (`BuffKind`, `common/src/comp/buff.rs`) son un catálogo más amplio — `Regeneration`, `Shielded` (absorb shield), `ProtectingWard`, `Frenzied`, `Hastened`, `FreedomOfMovement`, y varios más — cada uno con su propia curva de `strength`. No es exhaustivo listarlos acá; son parte del sistema de magia y consumibles, no específicos de combate — ver [Magia](/sistemas/magia) para el lado de casteo.

Qué requisitos gatillan un efecto (`CombatRequirement`, ej. `TargetPoised`) y cómo se modifican (`CombatModification`) son el mismo framework genérico que usan tanto ataques marciales como hechizos — no hay un sistema de buffs separado para magia vs combate cuerpo a cuerpo.
