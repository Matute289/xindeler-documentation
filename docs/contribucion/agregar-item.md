---
sidebar_position: 7
---

# Agregar un ítem

Guía paso a paso para agregar un nuevo ítem al juego.

Los ítems en Xindeler se definen en archivos RON bajo `assets/common/items/`. El juego carga todos los archivos de esa carpeta al arrancar — no hay registro manual en código para ítems simples.

---

## Tipos de ítem

| Tipo | Carpeta | Ejemplos |
|------|---------|---------|
| Armas | `assets/common/items/weapons/` | espadas, arcos, bastones |
| Armaduras | `assets/common/items/armor/` | cascos, petos, botas |
| Consumibles | `assets/common/items/consumable/` | pociones, comida |
| Materiales | `assets/common/items/crafting_ing/` | mineral, madera, cuero |
| Herramientas | `assets/common/items/tools/` | pico, hacha, caña de pescar |

---

## Paso 1: Crear el archivo RON

Creá el archivo en la carpeta que corresponda. El path del archivo define el **ID del ítem** en el juego — usalo en loot tables, recetas y código.

Ejemplo — espada de hierro (`assets/common/items/weapons/sword/iron_sword.ron`):

```ron
ItemDef(
    legacy_names: [],
    name: "Espada de Hierro",
    description: "Una espada básica forjada en hierro.",
    kind: Sword(SwordToolKind(
        hands: OneHand,
    )),
    quality: Common,
    tags: [],
    slots: 0,
)
```

Ejemplo — poción menor (`assets/common/items/consumable/potion_minor.ron`):

```ron
ItemDef(
    legacy_names: ["old.potion_minor"],
    name: "Poción Menor",
    description: "Restaura una pequeña cantidad de vida.",
    kind: Consumable(
        kind: Potion,
        effects: [
            Effect::Heal(30.0),
        ],
    ),
    quality: Common,
    tags: [Potion],
    slots: 16,
)
```

### Campos comunes

| Campo | Descripción |
|-------|-------------|
| `legacy_names` | IDs anteriores del ítem (para migración de saves). Dejar vacío en ítems nuevos. |
| `name` | Nombre visible en el juego |
| `description` | Texto del tooltip |
| `kind` | Tipo de ítem y sus stats específicos |
| `quality` | `Common`, `Moderate`, `High`, `Epic`, `Legendary`, `Artifact` |
| `tags` | Etiquetas para filtros y recetas (ej. `Potion`, `Metal`, `Armor`) |
| `slots` | Tamaño del stack máximo. `0` = no apilable. |

---

## Paso 2: Agregar a loot tables (opcional)

Para que el ítem dropee de criaturas o contenedores, editá la loot table correspondiente en `assets/common/loot_tables/`:

```ron
// assets/common/loot_tables/creatures/humanoid/bandit.ron
LootSpec::MultiDrop(
    drops: [
        (1.0, LootSpec::Item("common.items.weapons.sword.iron_sword")),
        (0.5, LootSpec::Item("common.items.consumable.potion_minor")),
        (0.3, LootSpec::Nothing),
    ],
)
```

Los números son pesos relativos — no tienen que sumar 1.

---

## Paso 3: Agregar a recetas de crafting (opcional)

Para que el ítem sea crafteable, editá `assets/common/recipe_book/` o creá un archivo nuevo:

```ron
// En el recipe book correspondiente
Recipe(
    output: ("common.items.weapons.sword.iron_sword", 1),
    inputs: [
        (RecipeInput::Item("common.items.crafting_ing.metal.iron_ingot"), 3),
        (RecipeInput::Item("common.items.crafting_ing.leather.leather"), 1),
    ],
    craft_sprite: Some(Forge),
)
```

`craft_sprite` define en qué estación de crafteo aparece la receta (`Forge`, `CraftingBench`, `SpinningWheel`, etc.).

---

## Paso 4: Verificar

```bash
cargo build
```

Si hay errores de parsing en el RON, el servidor los reporta al arrancar:

```
[ERROR] Failed to deserialize item: assets/common/items/weapons/sword/iron_sword.ron
thread 'main' panicked at 'could not parse RON: ...'
```

Para probar el ítem en juego, usá el comando de admin:

```
/give_item common.items.weapons.sword.iron_sword 1
```

Verificá que el nombre, descripción, stats y model se ven correctamente en el inventario.

---

## Paso 5: Commitear

```bash
git add assets/common/items/weapons/sword/iron_sword.ron
git add assets/common/loot_tables/creatures/humanoid/bandit.ron  # si lo modificaste
git commit -m "feat: add iron sword item with bandit loot table entry"
```
