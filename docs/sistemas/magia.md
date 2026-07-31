---
sidebar_position: 2
---

# Magia

El modelo de magia vive en `common/src/comp/ability.rs`, en el struct `AbilityMeta` que cuelga de cada `CharacterAbility`. Cada hechizo etiquea dos ejes independientes:

- **`source: Option<MagicSource>`** — de dónde sale la energía (el combustible).
- **`school: Option<School>`** — qué forma física toma el efecto.

Combate lee la habilidad tal cual; la UI del spellbook, el gating por clase y los tooltips leen estos metadatos (`common/src/comp/spell.rs`). Para cómo se resuelve un ataque mágico contra accuracy/evasion, poise y crítico, ver [Combate](/sistemas/combate).

---

## Las 5 fuentes mágicas (`MagicSource`)

`MagicSource` (`common/src/comp/ability.rs:4054`) tiene exactamente 5 variantes:

| Fuente | Qué es (paráfrasis del doc-comment del engine) | Clases que la usan |
|---|---|---|
| **Arcane** | El Velo — estudio, linaje, pacto o arte | Mage (estudio), Sorcerer (linaje), Warlock (pacto), Bard (arte), Artificer (a medias) |
| **Divine** | El canal de los dioses a través del Velo — fe y juramentos | Cleric, Paladin (juramento) |
| **Primordial** | La Canción que todavía suena en el mundo — naturaleza y elementos, moldeados por los Primordiales | Druid, Ranger |
| **Psionic** | Filtraciones del Más Allá — la mente como un portal sin licencia | ninguna clase del roster actual la reclama todavía (ver abajo) |
| **Ki** | La Canción fluyendo por un cuerpo vivo — disciplina y ki | Monk |

El roster completo de 14 clases está en [Clases](/sistemas/clases); ahí también está Blood Slayer, cuya identidad es Hemomancia + marcial. `Psionic` está en el enum del engine y tiene mecánica propia (ver `disable_magic` / campos antimagia más abajo), pero ninguna de las 14 clases jugables actuales lo tiene como fuente asignada — queda como fuente reservada para contenido futuro (subclases psiónicas, según los diseños previos).

Fuente y escuela son ejes independientes a propósito: **Ki y Psionic suelen no tener escuela** (`school: None`) — un golpe de monje o un mind-blast no es un "spell-form" clásico, es la fuente sola.

---

## Escuelas: la forma del hechizo (`School`)

`School` (`common/src/comp/ability.rs:4021`) cubre las 8 escuelas clásicas más 2 propias:

```
Abjuration · Conjuration · Divination · Enchantment · Evocation ·
Illusion · Necromancy · Transmutation · Axiomancy · Hemomancy
```

Las dos últimas son **meta-escuelas**: `AbilityMeta` tiene un campo separado `form: Option<School>` que carga la escuela clásica que el efecto toma físicamente, así que un hechizo puede tagearse como `Axiomancy(Subschool · Form)` — ej. Axiomancy con subschool `Gravimancy` y `form: Evocation`. `AxiomSub` tiene 2 variantes, `Chronomancy` (tiempo/destino) y `Gravimancy` (gravedad/masa) — el análogo interno a "Chronurgy/Graviturgy", con esos nombres específicamente evitados por IP.

**Hemomancy** es "magia alimentada por sangre, auto-corruptiva" según su propio doc-comment — la escuela detrás del costo en HP (ver abajo).

### El spellbook del Mage

El Mage es la clase con spellbook más versátil del roster (ver [Clases](/sistemas/clases)). A la fecha, el compendio de hechizos (`assets/common/spells/compendium.ron`) le gatea spells de **Abjuration, Axiomancy, Enchantment, Evocation, Hemomancy (interino), Necromancy y Transmutation** — verificado contando las entradas `classes: [Mage]` del compendio, no una lista fija en el código. Otras clases tienen su propio subconjunto: Cleric concentra Enchantment/Necromancy de sabor divino, Paladin tiene sus propios smites, etc. — el compendio completo es la fuente de verdad, esta página no lo enumera entero.

---

## Energía: el recurso que alimenta la mayoría de los conjuros

Cada variante de `CharacterAbility` (`BasicRanged`, `BasicBeam`, `BasicAura`, `ChargedRanged`, `SelfBuff`, etc.) carga su propio `energy_cost` — la energía es el recurso por defecto que gasta lanzar casi cualquier hechizo o habilidad, marcial o mágica.

### La excepción: el "blood price" de Hemomancy

`AbilityMeta` tiene un campo aparte, `hp_cost: Option<f32>` — el "blood price" de Hemomancy (M4/ENG-C1). Cuando está seteado, castear ese hechizo además le saca esa cantidad de HP propia al caster, **encima** de su `energy_cost` normal — no lo reemplaza. Por ejemplo, `hemal_spike.ron` es un `BasicRanged` con `energy_cost: 70` y `hp_cost: Some(3.0)` en su meta; `crimson_apotheosis.ron` (un self-buff) tiene `energy_cost: 225` y `hp_cost: Some(30.0)`. Cuanto más fuerte el hechizo, más sangre pide — es guideline de diseño explícita, no un número fijo por círculo.

El motor protege un piso de 1 HP: `hp_cost_affordable` (`common/src/states/utils.rs:1659`) rechaza el cast si dejaría al caster por debajo de `cost + 1`. En **hardcore** ese piso desaparece — el cast se permite igual, sangre hasta el final.

Conceptualmente, Blood Slayer es la clase pensada para vivir de este intercambio HP-por-poder (ver [Clases](/sistemas/clases)); en el compendio actual, sin embargo, Hemomancy está gateada de forma interina solo a `classes: [Mage]` mientras se termina el rework de Blood Slayer — el re-gateo a Blood Slayer (y eventualmente Warlock) es trabajo pendiente, no algo que ya esté viviendo en el juego.

---

## Antimagia

Un campo de antimagia (`Stats::disable_magic`) bloquea cualquier habilidad cuya `AbilityMeta.source` esté seteada — las habilidades físicas o innatas (`source: None`) pasan sin problema. Es el mismo filtro que gatea `hp_cost_affordable` y el resto de los requisitos de una habilidad, en `common/src/states/utils.rs`.
