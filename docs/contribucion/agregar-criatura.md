---
sidebar_position: 8
---

# Agregar una criatura

Guía para agregar una nueva criatura al juego — desde la definición de entidad hasta las reglas de spawn.

---

## Archivos que vas a tocar

| Archivo | Qué define |
|---------|-----------|
| `assets/common/entity/wild/` | Plantilla RON de la criatura |
| `assets/common/abilities/` | Habilidades que usa en combate |
| `world/src/layer/wildlife.rs` | Reglas de spawn por bioma |
| `assets/world/wildlife/` | Tablas de spawn en RON |

---

## Paso 1: Crear la plantilla de entidad

Las criaturas van en `assets/common/entity/wild/` organizadas por tipo:

```
assets/common/entity/wild/aggressive/cave_troll.ron
assets/common/entity/wild/peaceful/deer.ron
```

Ejemplo — trol de cueva:

```ron
EntityConfig(
    name: Name("Trol de Cueva"),
    body: Body(
        kind: BipedLarge(BipedLargeBody(
            species: Troll,
            body_type: Male,
        )),
    ),
    alignment: Alignment::Enemy,
    loot: LootSpec::LootTable(
        "common.loot_tables.creatures.biped_large.troll",
    ),
    skillset_asset: Some("common.skillset.biped_large.troll"),
    flee_health: 0.1,
    idle_wander_factor: 0.5,
    aggro_range: 15.0,
)
```

Ejemplo — ciervo (criatura pacífica):

```ron
EntityConfig(
    name: Name("Ciervo"),
    body: Body(
        kind: QuadrupedMedium(QuadrupedMediumBody(
            species: Deer,
            body_type: Male,
        )),
    ),
    alignment: Alignment::Wild,
    loot: LootSpec::LootTable(
        "common.loot_tables.creatures.quadruped_medium.deer",
    ),
    skillset_asset: None,
    flee_health: 0.5,
    idle_wander_factor: 1.0,
    aggro_range: 0.0,
)
```

### Campos clave

| Campo | Descripción |
|-------|-------------|
| `alignment` | `Wild` (huye), `Enemy` (ataca), `Passive` (ignora) |
| `flee_health` | % de vida al que empieza a huir (0.0 = nunca huye) |
| `aggro_range` | Radio en el que detecta y ataca jugadores |
| `idle_wander_factor` | Qué tanto deambula cuando está en calma |
| `skillset_asset` | Habilidades de combate. `None` para criaturas sin ataque |

---

## Paso 2: Crear la loot table

Creá la tabla de loot en `assets/common/loot_tables/creatures/`:

```ron
// assets/common/loot_tables/creatures/biped_large/troll.ron
LootSpec::MultiDrop(
    drops: [
        (1.0, LootSpec::Item("common.items.crafting_ing.stone.granite")),
        (0.6, LootSpec::Item("common.items.crafting_ing.leather.tough_leather")),
        (0.2, LootSpec::Item("common.items.weapons.hammer.troll_hammer")),
    ],
)
```

---

## Paso 3: Definir reglas de spawn

Agregá la criatura a la tabla de wildlife del bioma donde debe aparecer. Las tablas están en `assets/world/wildlife/`:

```ron
// En la tabla del bioma correspondiente (ej. mountains.ron)
SpawnEntry(
    name: "cave_troll",
    rules: [
        SpawnRule(
            // spawnea cerca de cuevas y en zonas rocosas
            min_time: NoDawn,
            max_time: NoDawn,
            threshold: 0.3,
            group_size: (1, 2),
            entity: EntityConfig(
                asset: "common.entity.wild.aggressive.cave_troll",
            ),
        ),
    ],
),
```

Alternativamente, podés registrar el spawn en código en `world/src/layer/wildlife.rs` si necesitás lógica más compleja (spawn condicional a bioma calculado, densidad variable, etc.).

---

## Paso 4: Asignar habilidades de combate

Si la criatura ataca, creá o reutilizá un skillset en `assets/common/skillset/`:

```ron
// assets/common/skillset/biped_large/troll.ron
SkillSetConfig(
    guard_resist: 0.6,
    body_size_modifier: 1.5,
    primary: Some("common.abilities.biped_large.troll.basic_attack"),
    secondary: Some("common.abilities.biped_large.troll.shockwave"),
    abilities: [],
)
```

Y las habilidades individuales en `assets/common/abilities/biped_large/troll/`:

```ron
// basic_attack.ron
BasicMelee(
    energy_cost: 0.0,
    buildup_duration: 0.6,
    swing_duration: 0.2,
    recover_duration: 0.5,
    melee_constructor: MeleeConstructor(
        kind: Bash,
        scaled: None,
        range: 4.0,
        angle: 45.0,
        damage: 28.0,
        knockback: 15.0,
        poise_damage: 50.0,
    ),
)
```

---

## Paso 5: Verificar en juego

```bash
cargo build
cargo run --bin xindeler-server
```

Para spawnear la criatura directamente y probarla sin buscarla en el mundo:

```
/summon common.entity.wild.aggressive.cave_troll
```

Verificá:
- Modelo y nombre correcto
- Comportamiento de combate (aggro, huida)
- Loot al morir
- Que no crashee el servidor al morir o al salir del rango de un jugador

---

## Paso 6: Commitear

```bash
git add assets/common/entity/wild/aggressive/cave_troll.ron
git add assets/common/loot_tables/creatures/biped_large/troll.ron
git add assets/common/skillset/biped_large/troll.ron
git add assets/common/abilities/biped_large/troll/
git add assets/world/wildlife/mountains.ron  # si lo modificaste
git commit -m "feat: add cave troll creature with loot and spawn rules"
```
