---
sidebar_position: 4
---

# Razas

Xindeler tiene **6 razas jugables**: Human, Elf, Dwarf, Orc, Gnome y Dhampir. Estos son los nombres canon que ve el jugador — pero **ojo con el código**: el enum `Species` (`common/src/comp/body/humanoid.rs`) todavía usa `Danari` y `Draugr` como nombres de variante, no `Gnome`/`Dhampir`. Ver la sección de abajo antes de asumir que un nombre en el código coincide con lo que se muestra en pantalla.

## Pasivos raciales

`assets/common/class/racial_traits.ron` define un pasivo por raza (campos opcionales, default neutral vía serde — hot-reload en dev). La clave RON usa el nombre interno del enum, no el nombre canon:

| Raza (nombre canon) | Clave en `racial_traits.ron` | Pasivo |
|---|---|---|
| Human | `Human` | +3% recuperación de energía (`energy_reward_mult: 1.03`) |
| Elf | `Elf` | +3% velocidad de movimiento, +15% resistencia mágica |
| Dwarf | `Dwarf` | +2% reducción de daño |
| Orc | `Orc` | +3% daño de ataque |
| Gnome | `Danari` | +5% energía máxima, +10% resistencia mágica |
| Dhampir | `Draugr` | +10% resistencia a control de masas, +15% resistencia mágica |

Estos pasivos se aplican cada tick después de `Stats::reset_temp_modifiers`, en el mismo pase que los atributos por clase (`class_attributes.ron`). Ninguna raza es estrictamente superior — cada una favorece un estilo distinto, y ninguna restringe la elección de clase.

Además del pasivo, cada raza tiene una habilidad innata activa (implementada en el lado de cliente/gameplay, no en `racial_traits.ron`) — la referencia completa de las 6 vive en la wiki de jugadores.

## El rename Danari→Gnome y Draugr→Dhampir

Estas dos razas se renombraron en el canon de lore (`docs/design/lore/chargen/lineages/00-master.md`, status: canon). **La decisión de diseño es que el nombre interno del engine se queda como estaba para siempre** — `Species::Danari`/`Species::Draugr` en Rust, las claves de `racial_traits.ron`, los paths de assets (`figure.head.draugr.male`, etc.), las skin-color consts (`DANARI_SKIN_COLORS`) — todo eso nunca se toca, es puramente un costo de legibilidad del código/assets. Lo único que cambia es el nombre que ve el jugador.

Ese rename todavía **no está completamente propagado en el cliente del juego** (`specs/2026-07-02-race-rename-ingame.md`, BL-74, scope LOCKED, todavía sin implementar al momento de escribir esto):
- Solo 2 de 32 locales (`en`, `es`) tienen la clave Fluent `common-species-danari`/`common-species-draugr` corregida a "Gnome"/"Dhampir" en `common.ftl` — los otros 30 locales todavía muestran el nombre viejo.
- Ni siquiera en `en`/`es` se corrigió la familia de claves `name.ftl` (generador de nombres aleatorios por especie) — sigue generando con el string literal viejo.
- El inspector de debug de `voxygen-egui` imprime el nombre del enum de Rust directo (`{:?}`, sin pasar por i18n) — un leak de dev-tool conocido, no afecta al HUD normal.

Si estás escribiendo o revisando contenido nuevo (wiki, landing, esta doc), usá siempre **Gnome**/**Dhampir** — nunca Danari/Draugr, salvo que estés hablando específicamente del identificador interno del código.
