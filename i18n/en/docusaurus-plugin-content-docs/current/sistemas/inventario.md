---
sidebar_position: 7
---

# Inventory

A character's inventory (`Inventory`, `common/src/comp/inventory/mod.rs`) combines two different things: **equip** slots (loadout) and **bag** slots. For what can go in each, see [Items](/sistemas/items); for how those slots get consumed while crafting, see [Crafting](/sistemas/crafting).

---

## The `Inventory` struct

```rust
pub struct Inventory {
    loadout: Loadout,
    /// The inventory's own "built-in" slots — every other slot is
    /// provided by equipped items (bags)
    slots: Vec<InvSlot>,
    /// Remove-only slots for when the inventory doesn't have enough
    /// room after a save migration or a slot-count rebalance
    overflow_items: Vec<Item>,
    recipe_book: RecipeBook,
}
```

`InvSlot` is simply `Option<Item>`. The inventory's own base slot count is a fixed constant:

```rust
const DEFAULT_INVENTORY_SLOTS: usize = 36;
```

`Inventory::capacity()` doesn't return that fixed number — it returns `self.slots().count()`, and `slots()` chains the 36 base slots with whatever slots equipped bags contribute (`loadout.inv_slots_with_id()`). In other words: actual inventory capacity is dynamic and depends on which bags you have equipped.

`overflow_items` exists for one specific case: if the inventory shrinks (content rebalance, data migration) and not every saved item fits anymore, the extras go into `overflow_items` instead of being lost. Items can only be taken out of it, never put in.

---

## Equip slots

`EquipSlot` (`common/src/comp/inventory/slot.rs`) is the enum of loadout positions:

```rust
pub enum EquipSlot {
    Armor(ArmorSlot),
    ActiveMainhand, ActiveOffhand,
    InactiveMainhand, InactiveOffhand, // second weapon set, swapped mid-combat
    Lantern,
    Glider,
}

pub enum ArmorSlot {
    Head, Neck, Shoulders, Chest, Hands,
    Ring1, Ring2, Back, Belt, Legs, Feet, Tabard,
    Bag1, Bag2, Bag3, Bag4,
}
```

`EquipSlot::can_hold(item_kind)` is the structural compatibility check — that an `ItemKind::Armor` with `ArmorKind::Head` only fits in `Armor(ArmorSlot::Head)`, that a one-handed tool can go in the offhand but a two-handed one can't, and so on. This check is independent of the level/class/race gate (`ItemRequirements`, see [Items](/sistemas/items#equip-requirements-itemrequirements)) — one validates that the item's *shape* fits the slot, the other validates whether the *character* is allowed to use it.

The four `Bag1`-`Bag4` slots are special: an item equipped there (a backpack, a satchel) adds its own slots to the inventory. `Inventory::get_slot_range_for_equip_slot(equip_slot)` returns the range of indices that bag owns within `slots()` — this is what the UI uses to highlight which slots belong to which bag when you hover over it.

---

## Bag slots

These are the 36 base `InvSlot`s plus whatever equipped bags add. They have no type restriction — any `Item` fits in any bag slot, unlike equip slots, which are typed via `EquipSlot::can_hold`.

---

## Rendering — `SlotGrid`

The inventory grid in the HUD is drawn by the `SlotGrid` widget (`voxygen/src/hud/slot_grid.rs`), used both for the player's own bag and for viewing someone else's inventory (trading, shared loot). It colors each slot by the item's quality (`Quality::Low` → grey, `Legendary` → gold, etc., see [Items](/sistemas/items#quality-quality)) and exposes a hook, `SlotTint`, so the game can inject its own tinting logic without touching the widget itself:

```rust
/// Per-slot background-colour override, evaluated after SlotGrid's own
/// highlights (loadout-hover, salvage, overflow). Keeps game-specific
/// slot-gating rules (like the equip gate) out of this widget, which
/// otherwise mirrors upstream closely.
pub type SlotTint<'a> = &'a dyn Fn(Slot, Option<&Item>) -> Option<Color>;
```

### Equip gate in the UI

`voxygen/src/hud/bag.rs` uses exactly that hook to grey out, in the bag, items the player **can't** equip yet:

```rust
let gray_out = |_pos: Slot, item: Option<&Item>| -> Option<Color> {
    let (skill_set, body) = requirement_ctx?;
    let item = item?;
    (!item.meets_requirements_with_class(player_class, skill_set, body))
        .then_some(Color::Rgba(0.45, 0.45, 0.45, 1.0))
};
```

The gate is always evaluated against the local player (`player_entity`), even when the bag being viewed belongs to someone else — greying items out based on another character's requirements wouldn't make sense. The item's tooltip (built in `voxygen/src/hud/util.rs`) breaks down each individual requirement (class, level, race) into two lists, met and unmet, using the translation keys `hud-bag-requirement_class`, `hud-bag-requirement_level`, `hud-bag-requirement_race` — so the player sees exactly what's missing, not just that the item is locked.

This is the same behavior documented at the player level in the wiki's character-creation guide: an item you can't use yet shows up dimmed in your bag, with the details in the tooltip.

---

## File reference

| What | Where |
|---|---|
| `Inventory`, capacity, overflow | `common/src/comp/inventory/mod.rs` |
| `EquipSlot`, `ArmorSlot` | `common/src/comp/inventory/slot.rs` |
| Grid widget (`SlotGrid`, `SlotTint`) | `voxygen/src/hud/slot_grid.rs` |
| Equip gate in the bag (gray-out) | `voxygen/src/hud/bag.rs` |
| Requirement tooltip construction | `voxygen/src/hud/util.rs` |
