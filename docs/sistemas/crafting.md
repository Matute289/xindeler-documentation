---
sidebar_position: 5
---

# Crafting

El crafteo en Xindeler es **server-autoritativo y data-driven**. El cliente arma una propuesta (qué receta, qué slots del inventario aportan cada input) y el servidor es quien valida y ejecuta — el cliente nunca crea items por su cuenta.

Para la estructura de items en sí (RON, `ItemKind`, calidad, requisitos de equipo), ver [Items](/sistemas/items). Para slots e inventario, ver [Inventario](/sistemas/inventario).

---

## Recetas como assets RON, no como código

Las recetas no están hardcodeadas en Rust. Viven en `assets/common/recipe_book_manifest.ron`, un mapa `String -> Recipe` que se carga como un `RecipeBookManifest` (`common/src/recipe.rs`). Esto significa que agregar o rebalancear una receta no requiere tocar el binario del servidor — solo el RON.

Ejemplo real, tal cual está en el manifest:

```ron
"mortar_pestle": (
    output: ("common.items.crafting_tools.mortar_pestle", 1),
    inputs: [
        (Item("common.items.crafting_ing.stones"), 6, false),
        (Item("common.items.crafting_ing.bowl"), 1, false),
    ],
    craft_sprite: Some(CraftingBench),
),
"velorite_frag": (
    output: ("common.items.mineral.ore.veloritefrag", 3),
    inputs: [
        (Item("common.items.mineral.ore.velorite"), 1, false),
        (Item("common.items.tool.craftsman_hammer"), 0, false),
    ],
    craft_sprite: Some(Anvil),
),
```

Notar el `craftsman_hammer` con cantidad `0`: es una herramienta que se **requiere pero no se consume** — el martillo tiene que estar en el inventario para craftear, pero no desaparece al terminar.

### La estructura `Recipe`

```rust
pub struct Recipe {
    pub output: (Arc<ItemDef>, u32),
    pub inputs: Vec<(RecipeInput, u32, bool)>, // input, cantidad, ¿es componente modular?
    pub craft_sprite: Option<SpriteKind>,
}
```

`craft_sprite` es la estación de crafteo requerida en el mundo (yunque, banco, caldero...). Si es `None`, la receta se puede craftear desde cualquier lado, sin pararse cerca de nada.

---

## Cómo se especifica un input

`RecipeInput` (en `common/src/recipe.rs`) no siempre pide un item exacto. Tiene cuatro variantes:

```rust
pub enum RecipeInput {
    Item(Arc<ItemDef>),           // exactamente este ItemDef
    Tag(ItemTag),                 // cualquier item con este tag
    TagSameItem(ItemTag),         // con el tag, pero todos del mismo item
    ListSameItem(Vec<Arc<ItemDef>>), // de una lista centralizada, todos iguales
}
```

`Tag`/`TagSameItem` son lo que permite recetas como "cualquier cuero" en vez de tener que enumerar cada tipo de cuero por separado — el item solo necesita estar tageado con `ItemTag::BaseMaterial` (o el tag que corresponda) en su definición RON. Ver [Items](/sistemas/items#tags-itemtag) para la lista de tags disponibles.

---

## Ejecución de una receta

El flujo real, de punta a punta:

1. El cliente arma un `CraftEvent::Simple { recipe, slots, .. }` con qué slots del inventario usar para cada input y lo manda al servidor.
2. El servidor (`server/src/events/inventory_manip.rs`) recibe el evento y llama a `Recipe::craft_simple` (`common/src/recipe.rs`).
3. `craft_simple` recorre cada input, valida que los slots indicados contengan cantidad suficiente de algo que matchee (`item.matches_recipe_input`), y si **todo** está satisfecho:
   - remueve los items consumidos del inventario,
   - instancia el item de salida (`Item::new_from_item_base`) la cantidad de veces que indica `output.1`.
4. Si falta algo, devuelve `Err(Vec<(&RecipeInput, u32)>)` — el input insatisfecho y cuánto falta — que el cliente usa para mostrar qué le falta al jugador.

```
Cliente                         Servidor
   │  CraftEvent::Simple          │
   ├─────────────────────────────►│
   │                               │  Recipe::craft_simple()
   │                               │  ├─ valida slots vs inputs
   │                               │  ├─ remueve consumidos
   │                               │  └─ instancia output
   │  ◄── inventario actualizado ──┤
```

`RecipeBookManifest::get_available(inv)` es lo que usa la UI para filtrar, sobre todas las recetas conocidas, cuáles son craftables *ahora mismo* con el inventario actual (llama a `inventory_contains_ingredients` por cada una).

---

## Crafteo de componentes modulares

Además de `Recipe` (crafteo simple), existe `ComponentRecipe` / `ComponentRecipeBook` (`assets/common/component_recipe_book.ron`) para armas modulares: un material (ej. un lingote) más un modificador opcional producen el **componente** de una herramienta (el filo, el mango), que después se combina con otro componente vía `modular_weapon()` para formar el arma final. Es un sistema separado del `RecipeBookManifest` porque la clave de búsqueda es distinta (`ComponentKey { toolkind, material, modifier }` en vez de un nombre de receta fijo).

---

## Salvage — el camino inverso

`try_salvage` (`common/src/recipe.rs`) desarma un item craftable en sus materiales base, si el item tiene `salvage_output()` no vacío (típicamente items con el tag `ItemTag::SalvageInto(Material, cantidad)`). No es una `Recipe` — es una función standalone que no depende del recipe book, solo de la definición del propio item.

---

## Aprender recetas: `RecipeGroup`

No todas las recetas están disponibles desde el arranque. `ItemKind::RecipeGroup { recipes: Vec<String> }` es un tipo de item — normalmente un "libro" o "plano" — que al consumirse desbloquea ese conjunto de claves de receta para el jugador. El grupo base (`assets/common/items/recipes/default.ron`) es el que todo personaje nuevo conoce; grupos como `charms.ron` (`burning_charm`, `frozen_charm`, `lifesteal_charm`) se otorgan aparte, como progresión.

---

## Referencia de archivos

| Qué | Dónde |
|---|---|
| Lógica de crafteo (`Recipe`, `RecipeInput`, `craft_simple`) | `common/src/recipe.rs` |
| Manejo del evento de crafteo en servidor | `server/src/events/inventory_manip.rs` |
| Recetas simples | `assets/common/recipe_book_manifest.ron` |
| Recetas de componentes modulares | `assets/common/component_recipe_book.ron` |
| Grupos de recetas desbloqueables | `assets/common/items/recipes/*.ron` |
