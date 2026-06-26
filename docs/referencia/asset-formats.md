---
sidebar_position: 1
---

# Formatos de assets

Referencia de los formatos de archivo usados para definir contenido del juego. Todos los assets de juego usan **RON (Rusty Object Notation)**.

---

## RON — Rusty Object Notation

RON es un formato de texto estructurado diseñado para tipos Rust. Es el formato estándar para todos los assets de Xindeler.

### Sintaxis básica

```ron
// Comentario de línea

// Struct con campos nombrados
ItemDef(
    name: "Espada de Hierro",
    quality: Common,
    slots: 0,
)

// Enum con variante
alignment: Alignment::Enemy,

// Enum con datos
body: Body::BipedLarge(BipedLargeBody(
    species: Troll,
    body_type: Male,
))

// Option
skillset_asset: Some("common.skillset.warrior"),
skillset_asset: None,

// Vec (lista)
drops: [
    (1.0, LootSpec::Item("common.items.ore.iron")),
    (0.5, LootSpec::Nothing),
],

// Tupla
group_size: (1, 3),

// Colores RGB
col: Rgb(1.0, 0.4, 0.0),
```

---

## Formato de Asset ID

El Asset ID es el identificador único de cada archivo RON en el juego. Se forma a partir del path relativo a `assets/`, con `/` reemplazado por `.` y sin la extensión `.ron`:

```
assets/common/items/weapons/sword/iron_sword.ron
→ "common.items.weapons.sword.iron_sword"

assets/common/entity/wild/aggressive/cave_troll.ron
→ "common.entity.wild.aggressive.cave_troll"
```

Los Asset IDs se usan en código Rust (`asset_server.load(...)`) y en otros archivos RON para referenciar assets.

---

## Ítems (`ItemDef`)

**Ubicación:** `assets/common/items/`

```ron
ItemDef(
    legacy_names: [],           // IDs anteriores para migración de saves
    name: "Nombre del ítem",
    description: "Texto del tooltip.",
    kind: /* tipo de ítem */,
    quality: Common,            // Common | Moderate | High | Epic | Legendary | Artifact
    tags: [],                   // etiquetas para filtros y recetas
    slots: 0,                   // tamaño de stack (0 = no apilable)
)
```

### Tipos de ítem (`kind`)

```ron
// Arma cuerpo a cuerpo
Sword(SwordToolKind(hands: OneHand))
Axe(AxeToolKind(hands: TwoHand))
Hammer(HammerToolKind(hands: TwoHand))

// Arma a distancia
Bow(BowToolKind)
Staff(StaffToolKind)

// Armadura
Armor(ArmorKind(
    kind: Chest,   // Head | Chest | Back | Hands | Belt | Legs | Feet | Neck | Ring
    stats: ArmorStats(protection: 15.0, resilience: 0.1),
))

// Consumible
Consumable(
    kind: Potion,
    effects: [Effect::Heal(30.0)],
)

// Material de crafting
Ingredient(descriptor: "Mineral")

// Herramienta
Tool(ToolKind::Pick)
```

---

## Entidades (`EntityConfig`)

**Ubicación:** `assets/common/entity/`

```ron
EntityConfig(
    name: Name("Nombre"),
    body: Body(kind: /* tipo de cuerpo */),
    alignment: Alignment::Enemy,     // Wild | Enemy | Npc | Friendly | Passive
    loot: LootSpec::LootTable("common.loot_tables.creatures.troll"),
    skillset_asset: Some("common.skillset.troll"),
    flee_health: 0.1,       // % de vida para empezar a huir (0.0 = nunca)
    aggro_range: 15.0,      // radio de detección de jugadores
    idle_wander_factor: 0.5,
)
```

### Tipos de cuerpo (`Body`)

```ron
Humanoid(HumanoidBody(species: Human, body_type: Male))
BipedLarge(BipedLargeBody(species: Troll, body_type: Male))
QuadrupedMedium(QuadrupedMediumBody(species: Wolf, body_type: Male))
QuadrupedSmall(QuadrupedSmallBody(species: Rat, body_type: Female))
BirdMedium(BirdMediumBody(species: Eagle, body_type: Male))
Dragon(DragonBody(species: Drake, body_type: Male))
```

---

## Loot tables (`LootSpec`)

**Ubicación:** `assets/common/loot_tables/`

```ron
// Ítem único
LootSpec::Item("common.items.weapons.sword.iron_sword")

// Nada
LootSpec::Nothing

// Drop aleatorio con pesos
LootSpec::MultiDrop(
    drops: [
        (2.0, LootSpec::Item("common.items.ore.iron")),
        (1.0, LootSpec::Item("common.items.consumable.potion_minor")),
        (0.3, LootSpec::Nothing),
    ],
)

// Referenciar otra tabla
LootSpec::LootTable("common.loot_tables.tier_2")

// Cantidad variable
LootSpec::Quantity(
    loot: LootSpec::Item("common.items.ore.iron"),
    // min: 1, max: 3
    range: (1, 3),
)
```

Los pesos en `MultiDrop` son relativos entre sí — no tienen que sumar 1.

---

## Recetas (`Recipe`)

**Ubicación:** `assets/common/recipe_book/`

```ron
Recipe(
    output: ("common.items.weapons.sword.iron_sword", 1),
    inputs: [
        (RecipeInput::Item("common.items.crafting_ing.metal.iron_ingot"), 3),
        (RecipeInput::Item("common.items.crafting_ing.leather.leather"), 1),
    ],
    craft_sprite: Some(Forge),   // None | Forge | CraftingBench | SpinningWheel | etc.
    disabled: false,
)
```

---

## Habilidades (`CharacterAbility`)

**Ubicación:** `assets/common/abilities/`

Ver [Agregar un hechizo](/contribucion/agregar-hechizo) para ejemplos completos por tipo.

Campos comunes a todos los tipos:

```ron
energy_cost: 20.0,          // energía consumida
buildup_duration: 0.3,      // tiempo de carga (segundos)
recover_duration: 0.2,      // cooldown después de ejecutar
```

---

## Convenciones

- Usá `snake_case` para nombres de archivo: `iron_sword.ron`, `cave_troll.ron`
- Organizá por tipo en subcarpetas: `weapons/sword/`, `wild/aggressive/`
- `legacy_names` solo para renombrar assets existentes — dejalo vacío en assets nuevos
- Los comentarios `//` son válidos en RON y recomendados para campos no obvios
