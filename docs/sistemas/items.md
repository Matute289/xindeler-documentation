---
sidebar_position: 6
---

# Items

Como las recetas (ver [Crafting](/sistemas/crafting)), los items en Xindeler son **assets RON**, no structs hardcodeadas en Rust. Cada item del juego es un archivo `.ron` bajo `assets/common/items/`, cargado en runtime como un `ItemDef` (`common/src/comp/inventory/item/mod.rs`). Agregar un item nuevo es agregar un archivo — no requiere recompilar.

---

## La estructura `ItemDef`

```rust
pub struct ItemDef {
    item_definition_id: String,   // el path del asset, ej "common.items.weapons.sword.iron_sword"
    pub kind: ItemKind,
    pub quality: Quality,
    pub tags: Vec<ItemTag>,
    pub slots: u16,                // slots que aporta si es un contenedor (bolsa)
    pub ability_spec: Option<AbilitySpec>,
    pub requirements: Option<ItemRequirements>, // gate de equipo, ver más abajo
}
```

Ejemplo real, un ítem de armadura simple (`assets/common/items/armor/misc/head/straw.ron`):

```ron
ItemDef(
    legacy_name: "Straw Hat",
    legacy_description: "...",
    kind: Armor((
        kind: Head,
        stats: Direct((
            energy_max: Some(7.0),
            energy_reward: Some(0.04),
        )),
    )),
    quality: Common,
    tags: [
        SalvageInto(PlantFiber, 1),
    ],
)
```

---

## `ItemKind` — las categorías de item

`common/src/comp/inventory/item/mod.rs` define el enum central:

```rust
pub enum ItemKind {
    Tool(Tool),                 // armas
    ModularComponent(ModularComponent), // filo/mango de un arma modular
    Lantern(Lantern),
    Armor(armor::Armor),
    Glider,
    Consumable { kind: ConsumableKind, effects: Effects, container: Option<..> },
    Utility { kind: Utility },  // monedas, llaves, collares...
    Ingredient { .. },          // material de crafteo puro
    TagExamples { .. },         // uso interno de UI (representante de un tag)
    RecipeGroup { recipes: Vec<String> }, // ver Crafting — desbloquea recetas
    Quest,
}
```

`Armor` a su vez tiene su propio subtipo `ArmorKind` (`common/src/comp/inventory/item/armor.rs`): `Head`, `Chest`, `Shoulder`, `Hand`, `Pants`, `Foot`, `Back`, `Belt`, `Neck`, `Ring`, `Tabard`, `Bag`, `Backpack` — cada uno mapea a un slot de equipo específico (ver [Inventario](/sistemas/inventario#slots-de-equipo)).

`ConsumableKind` distingue `Drink`, `Food`, `ComplexFood`, `Charm` y `Recipe` (un consumible que enseña una receta al comerse/usarse, la contraparte de `ItemKind::RecipeGroup`).

---

## Calidad (`Quality`)

```rust
pub enum Quality {
    Low,       // gris
    Common,    // celeste
    Moderate,  // verde
    High,      // azul
    Epic,      // violeta
    Legendary, // dorado
    Artifact,  // naranja
    Debug,     // rojo — solo testing
}
```

Es puramente informativa/visual a nivel `ItemDef` — no altera automáticamente stats. El color se usa para tintar el borde del slot en el inventario (`voxygen/src/hud/slot_grid.rs`, mapea cada `Quality` a un sprite `inv_slot_*` distinto).

---

## Tags (`ItemTag`)

Los tags son lo que permite que las recetas (ver [Crafting](/sistemas/crafting#c%C3%B3mo-se-especifica-un-input)) y otras mecánicas hagan match "por categoría" en vez de por item exacto:

```rust
pub enum ItemTag {
    Material(Material),       // ej: item hecho de "iron"
    MaterialKind(MaterialKind), // Metal, Gem, Wood, Stone, Cloth, Hide
    Cultist, Gnarling, Witch, Pirate,   // asociado a una facción/loot table
    Potion, Charm, Food,
    BaseMaterial,   // cuero, retazos de tela, etc.
    CraftingTool,   // picota, martillo de artesano, kit de costura
    Utility, Bag,
    SalvageInto(Material, u32), // qué produce al desarmarse (ver Crafting)
    RequiresAttunement,
}
```

`RequiresAttunement` es una adición propia de Xindeler (no upstream de Veloren): marca items cuyo efecto mágico solo aplica si el que lo lleva puesto está *atunado* — es puramente data-driven, se agrega a la lista `tags` del RON y listo, sin tocar código.

---

## Requisitos de equipo (`ItemRequirements`)

Este es el gate que conecta items con [Clases](/sistemas/clases) y [Razas](/sistemas/razas): un `ItemDef` puede declarar quién puede equiparlo.

```rust
pub struct ItemRequirements {
    pub classes: Option<Vec<ClassKind>>,   // None = cualquier clase
    pub min_level: Option<u16>,             // nivel de personaje derivado (SkillSet::character_level)
    pub races: Option<Vec<humanoid::Species>>, // None = cualquier especie
}
```

Ejemplo real de item de testing con gate activo (`assets/common/items/testing/test_draugr_blade.ron`):

```ron
requirements: Some((
    min_level: Some(10),
    races: Some([Draugr]),
)),
```

La validación vive en `ItemRequirements::unmet(character_class, level, species) -> Vec<UnmetRequirement>`, con tres variantes de fallo: `Class`, `Level { needed }`, `Race`. Reglas puntuales de esa función:

- Con multiclase, un personaje pasa el gate de clase si **cualquiera** de sus clases está en la whitelist — un Warrior que multiclasea a Warlock puede equipar gear restringido a cualquiera de las dos, no solo a la primaria.
- Entidades sin `CharacterClass` (NPCs, espectadores) fallan cualquier gate de clase automáticamente.
- Bodies no-humanoides fallan cualquier gate de raza automáticamente (`species` es `None`).

`Item::meets_requirements_with_class` es el atajo booleano sobre `unmet_requirements_with_class` que usa el resto del código cuando solo importa sí/no.

Para cómo esto se refleja en la UI (slots grisados, tooltip con el detalle de qué falta), ver [Inventario](/sistemas/inventario#gate-de-equipo-en-la-ui).

---

## Referencia de archivos

| Qué | Dónde |
|---|---|
| `ItemDef`, `ItemKind`, `Quality`, `ItemTag`, `ItemRequirements` | `common/src/comp/inventory/item/mod.rs` |
| `Armor`, `ArmorKind` | `common/src/comp/inventory/item/armor.rs` |
| Definiciones de items (RON) | `assets/common/items/**/*.ron` |
