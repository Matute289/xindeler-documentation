---
sidebar_position: 7
---

# Inventario

El inventario de un personaje (`Inventory`, `common/src/comp/inventory/mod.rs`) combina dos cosas distintas: slots de **equipo** (loadout) y slots de **bolsa** (bag). Para qué puede ir en cada uno, ver [Items](/sistemas/items); para cómo se consumen esos slots al craftear, ver [Crafting](/sistemas/crafting).

---

## La estructura `Inventory`

```rust
pub struct Inventory {
    loadout: Loadout,
    /// Slots "built-in" del propio inventario — el resto de los slots
    /// los aportan los items equipados (bolsas)
    slots: Vec<InvSlot>,
    /// Slots remove-only para cuando el inventario no entra después de
    /// una migración de save/rebalanceo
    overflow_items: Vec<Item>,
    recipe_book: RecipeBook,
}
```

`InvSlot` es simplemente `Option<Item>`. La base de slots propios del inventario es una constante fija:

```rust
const DEFAULT_INVENTORY_SLOTS: usize = 36;
```

`Inventory::capacity()` no devuelve ese número fijo — devuelve `self.slots().count()`, y `slots()` encadena los 36 slots base con los que aporten las bolsas equipadas (`loadout.inv_slots_with_id()`). O sea: la capacidad real del inventario es dinámica y depende de qué bolsas tenés puestas.

`overflow_items` existe para un caso específico: si el inventario se achica (rebalanceo de contenido, migración de datos) y ya no entran todos los items guardados, los que sobran van a `overflow_items` en vez de perderse. Solo se puede sacar de ahí, nunca meter.

---

## Slots de equipo

`EquipSlot` (`common/src/comp/inventory/slot.rs`) es el enum de las posiciones de loadout:

```rust
pub enum EquipSlot {
    Armor(ArmorSlot),
    ActiveMainhand, ActiveOffhand,
    InactiveMainhand, InactiveOffhand, // segundo set de armas, swap en combate
    Lantern,
    Glider,
}

pub enum ArmorSlot {
    Head, Neck, Shoulders, Chest, Hands,
    Ring1, Ring2, Back, Belt, Legs, Feet, Tabard,
    Bag1, Bag2, Bag3, Bag4,
}
```

`EquipSlot::can_hold(item_kind)` es el chequeo de compatibilidad estructural — que un `ItemKind::Armor` con `ArmorKind::Head` solo entre en `Armor(ArmorSlot::Head)`, que una herramienta a una mano pueda ir en el offhand pero una a dos manos no, etc. Este chequeo es independiente del gate de nivel/clase/raza (`ItemRequirements`, ver [Items](/sistemas/items#requisitos-de-equipo-itemrequirements)) — uno valida que la *forma* del item entra en el slot, el otro valida si el *personaje* puede usarlo.

Los cuatro slots `Bag1`-`Bag4` son especiales: un item equipado ahí (una mochila, un morral) le agrega sus propios slots al inventario. `Inventory::get_slot_range_for_equip_slot(equip_slot)` devuelve el rango de índices que le corresponde a esa bolsa dentro de `slots()` — es lo que la UI usa para resaltar qué casilleros pertenecen a qué bolsa cuando pasás el mouse por encima.

---

## Slots de bolsa (bag)

Son los 36 `InvSlot` base más los que sumen las bolsas equipadas. No tienen restricción de tipo — cualquier `Item` entra en cualquier slot de bolsa, a diferencia de los de equipo que están tipados por `EquipSlot::can_hold`.

---

## Renderizado — `SlotGrid`

La grilla de inventario en el HUD la dibuja el widget `SlotGrid` (`voxygen/src/hud/slot_grid.rs`), consumido tanto por la bolsa del jugador como por vistas de inventario ajeno (comercio, loot compartido). Colorea cada slot según la calidad del item (`Quality::Low` → gris, `Legendary` → dorado, etc., ver [Items](/sistemas/items#calidad-quality)) y expone un hook, `SlotTint`, para que el juego le inyecte lógica de tinte propia sin tocar el widget:

```rust
/// Tinte de fondo por-slot, evaluado después de los highlights propios de
/// SlotGrid (hover de loadout, salvage, overflow). Mantiene reglas
/// game-specific (como el gate de equipo) fuera de este widget, que por lo
/// demás espeja de cerca la versión upstream.
pub type SlotTint<'a> = &'a dyn Fn(Slot, Option<&Item>) -> Option<Color>;
```

### Gate de equipo en la UI

`voxygen/src/hud/bag.rs` usa exactamente ese hook para grisar, en la bolsa, los items que el jugador **no puede** equiparse todavía:

```rust
let gray_out = |_pos: Slot, item: Option<&Item>| -> Option<Color> {
    let (skill_set, body) = requirement_ctx?;
    let item = item?;
    (!item.meets_requirements_with_class(player_class, skill_set, body))
        .then_some(Color::Rgba(0.45, 0.45, 0.45, 1.0))
};
```

El gate se evalúa siempre contra el jugador local (`player_entity`), incluso cuando la bolsa que se está mirando es la de otro personaje — no tiene sentido grisar según los requisitos de otro. El tooltip del item (armado en `voxygen/src/hud/util.rs`) desglosa cada requisito individual (clase, nivel, raza) en dos listas, cumplidos y no cumplidos, usando las claves de traducción `hud-bag-requirement_class`, `hud-bag-requirement_level`, `hud-bag-requirement_race` — así el jugador ve exactamente qué le falta, no solo que el item está bloqueado.

Este es el mismo comportamiento documentado a nivel jugador en la guía de creación de personaje del wiki: un item que todavía no podés usar aparece atenuado en la bolsa, con el detalle en el tooltip.

---

## Referencia de archivos

| Qué | Dónde |
|---|---|
| `Inventory`, capacidad, overflow | `common/src/comp/inventory/mod.rs` |
| `EquipSlot`, `ArmorSlot` | `common/src/comp/inventory/slot.rs` |
| Widget de grilla (`SlotGrid`, `SlotTint`) | `voxygen/src/hud/slot_grid.rs` |
| Gate de equipo en la bolsa (gray-out) | `voxygen/src/hud/bag.rs` |
| Construcción del tooltip de requisitos | `voxygen/src/hud/util.rs` |
