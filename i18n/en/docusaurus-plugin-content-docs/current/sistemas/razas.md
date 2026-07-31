---
sidebar_position: 4
---

# Races

Xindeler has **6 playable races** (`Species` in `common/src/comp/body/humanoid.rs`): Danari, Dwarf, Elf, Human, Orc, Draugr.

## Racial passives

`assets/common/class/racial_traits.ron` defines one passive per race (optional fields, neutral default via serde — hot-reloads in dev):

| Race | Passive |
|---|---|
| Human | +3% energy recovery (`energy_reward_mult: 1.03`) |
| Elf | +3% movement speed, +15% magic resistance |
| Dwarf | +2% damage reduction |
| Orc | +3% attack damage |
| Danari | +5% max energy, +10% magic resistance |
| Draugr | +10% crowd-control resistance, +15% magic resistance |

These passives apply each tick after `Stats::reset_temp_modifiers`, in the same pass as per-class attributes (`class_attributes.ron`). No race is strictly superior — each favors a different playstyle, and none restrict class choice.

Beyond the passive, each race also has an active innate ability (implemented on the client/gameplay side, not in `racial_traits.ron`) — the full reference for all 6 lives on the player wiki.

## No new races planned

The New Horizon backlog doesn't describe any additional playable race. Names like "Gnome" or "Dhampir" that show up in some lore documents are flavor labels for existing races (Danari and Draugr respectively), not new races.
