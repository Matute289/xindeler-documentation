---
sidebar_position: 5
---

# Crafting

Crafting in Xindeler is **server-authoritative and data-driven**. The client puts together a proposal (which recipe, which inventory slots supply each input) and sends it to the server — the server is the one that validates and executes it. The client never creates items on its own.

For the structure of items themselves (RON, `ItemKind`, quality, equip requirements), see [Items](/sistemas/items). For inventory slots, see [Inventory](/sistemas/inventario).

---

## Recipes as RON assets, not code

Recipes aren't hardcoded in Rust. They live in `assets/common/recipe_book_manifest.ron`, a `String -> Recipe` map loaded as a `RecipeBookManifest` (`common/src/recipe.rs`). That means adding or rebalancing a recipe doesn't require touching the server binary — just the RON file.

Real example, straight from the manifest:

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

Notice the `craftsman_hammer` with quantity `0`: it's a tool that's **required but not consumed** — the hammer has to be in the inventory to craft, but it doesn't disappear when the craft finishes.

### The `Recipe` struct

```rust
pub struct Recipe {
    pub output: (Arc<ItemDef>, u32),
    pub inputs: Vec<(RecipeInput, u32, bool)>, // input, amount, is it a modular component?
    pub craft_sprite: Option<SpriteKind>,
}
```

`craft_sprite` is the crafting station required in the world (anvil, bench, cauldron...). If it's `None`, the recipe can be crafted from anywhere, without standing near anything.

---

## How an input is specified

`RecipeInput` (in `common/src/recipe.rs`) doesn't always ask for an exact item. It has four variants:

```rust
pub enum RecipeInput {
    Item(Arc<ItemDef>),           // exactly this ItemDef
    Tag(ItemTag),                 // any item with this tag
    TagSameItem(ItemTag),         // with the tag, but all the same item
    ListSameItem(Vec<Arc<ItemDef>>), // from a centralized list, all matching
}
```

`Tag`/`TagSameItem` are what makes recipes like "any leather" possible instead of having to enumerate every leather variant individually — the item just needs to be tagged with `ItemTag::BaseMaterial` (or whatever tag applies) in its RON definition. See [Items](/sistemas/items#tags-itemtag) for the full tag list.

---

## Executing a recipe

The actual end-to-end flow:

1. The client builds a `CraftEvent::Simple { recipe, slots, .. }` specifying which inventory slots to use for each input and sends it to the server.
2. The server (`server/src/events/inventory_manip.rs`) receives the event and calls `Recipe::craft_simple` (`common/src/recipe.rs`).
3. `craft_simple` walks each input, validates that the given slots contain enough of something that matches (`item.matches_recipe_input`), and if **everything** is satisfied:
   - it removes the consumed items from the inventory,
   - it instantiates the output item (`Item::new_from_item_base`) as many times as `output.1` specifies.
4. If something's missing, it returns `Err(Vec<(&RecipeInput, u32)>)` — the unsatisfied input and how much is missing — which the client uses to show the player what they're short on.

```
Client                          Server
   │  CraftEvent::Simple          │
   ├─────────────────────────────►│
   │                               │  Recipe::craft_simple()
   │                               │  ├─ validates slots vs inputs
   │                               │  ├─ removes consumed items
   │                               │  └─ instantiates output
   │  ◄─── updated inventory ──────┤
```

`RecipeBookManifest::get_available(inv)` is what the UI uses to filter, across every known recipe, which ones are craftable *right now* with the current inventory (it calls `inventory_contains_ingredients` for each one).

---

## Modular component crafting

Besides `Recipe` (simple crafting), there's `ComponentRecipe` / `ComponentRecipeBook` (`assets/common/component_recipe_book.ron`) for modular weapons: a material (e.g. an ingot) plus an optional modifier produce the **component** of a tool (the blade, the haft), which is then combined with another component via `modular_weapon()` to form the final weapon. It's a separate system from `RecipeBookManifest` because the lookup key is different (`ComponentKey { toolkind, material, modifier }` instead of a fixed recipe name).

---

## Salvage — the reverse path

`try_salvage` (`common/src/recipe.rs`) breaks a craftable item back down into its base materials, if the item has a non-empty `salvage_output()` (typically items tagged with `ItemTag::SalvageInto(Material, amount)`). It's not a `Recipe` — it's a standalone function that doesn't depend on the recipe book at all, only on the item's own definition.

---

## Learning recipes: `RecipeGroup`

Not every recipe is available from the start. `ItemKind::RecipeGroup { recipes: Vec<String> }` is an item type — usually a "book" or "blueprint" — that unlocks that set of recipe keys for the player when consumed. The base group (`assets/common/items/recipes/default.ron`) is what every new character starts out knowing; groups like `charms.ron` (`burning_charm`, `frozen_charm`, `lifesteal_charm`) are granted separately, as progression.

---

## File reference

| What | Where |
|---|---|
| Crafting logic (`Recipe`, `RecipeInput`, `craft_simple`) | `common/src/recipe.rs` |
| Handling the craft event on the server | `server/src/events/inventory_manip.rs` |
| Simple recipes | `assets/common/recipe_book_manifest.ron` |
| Modular component recipes | `assets/common/component_recipe_book.ron` |
| Unlockable recipe groups | `assets/common/items/recipes/*.ron` |
