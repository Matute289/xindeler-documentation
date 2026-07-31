---
sidebar_position: 4
---

# Races

Xindeler has **6 playable races**: Human, Elf, Dwarf, Orc, Gnome and Dhampir. These are the canon names shown to players — but **watch out in the code**: the `Species` enum (`common/src/comp/body/humanoid.rs`) still uses `Danari` and `Draugr` as variant names, not `Gnome`/`Dhampir`. See the section below before assuming a name in the code matches what's shown on screen.

## Racial passives

`assets/common/class/racial_traits.ron` defines one passive per race (optional fields, neutral default via serde — hot-reloads in dev). The RON key uses the internal enum name, not the canon display name:

| Race (canon name) | Key in `racial_traits.ron` | Passive |
|---|---|---|
| Human | `Human` | +3% energy recovery (`energy_reward_mult: 1.03`) |
| Elf | `Elf` | +3% movement speed, +15% magic resistance |
| Dwarf | `Dwarf` | +2% damage reduction |
| Orc | `Orc` | +3% attack damage |
| Gnome | `Danari` | +5% max energy, +10% magic resistance |
| Dhampir | `Draugr` | +10% crowd-control resistance, +15% magic resistance |

These passives apply each tick after `Stats::reset_temp_modifiers`, in the same pass as per-class attributes (`class_attributes.ron`). No race is strictly superior — each favors a different playstyle, and none restrict class choice.

Beyond the passive, each race also has an active innate ability (implemented on the client/gameplay side, not in `racial_traits.ron`) — the full reference for all 6 lives on the player wiki.

## The Danari→Gnome and Draugr→Dhampir rename

These two races were renamed at the lore-canon level (`docs/design/lore/chargen/lineages/00-master.md`, status: canon). **The design decision is that the engine's internal name stays as-is forever** — `Species::Danari`/`Species::Draugr` in Rust, the `racial_traits.ron` keys, asset paths (`figure.head.draugr.male`, etc.), skin-color consts (`DANARI_SKIN_COLORS`) — none of that ever changes; it's purely a code/asset-authoring readability cost. Only the player-facing name changes.

That rename is **not yet fully propagated in the game client** (`specs/2026-07-02-race-rename-ingame.md`, BL-74, scope LOCKED, not yet implemented as of this writing):
- Only 2 of 32 locales (`en`, `es`) have the `common-species-danari`/`common-species-draugr` Fluent key corrected to "Gnome"/"Dhampir" in `common.ftl` — the other 30 locales still show the old name.
- Even in `en`/`es`, the separate `name.ftl` key family (random name generator per species) was missed — it still generates with the old literal string.
- The `voxygen-egui` debug inspector prints the raw Rust enum name (`{:?}`, bypassing i18n entirely) — a known dev-tool leak, doesn't affect the normal HUD.

If you're writing or reviewing new content (wiki, landing page, this doc), always use **Gnome**/**Dhampir** — never Danari/Draugr, unless you're specifically talking about the internal code identifier.
