---
sidebar_position: 4
---

# Razas

Xindeler tiene **6 razas jugables** (`Species` en `common/src/comp/body/humanoid.rs`): Danari, Dwarf, Elf, Human, Orc, Draugr.

## Pasivos raciales

`assets/common/class/racial_traits.ron` define un pasivo por raza (campos opcionales, default neutral vía serde — hot-reload en dev):

| Raza | Pasivo |
|---|---|
| Human | +3% recuperación de energía (`energy_reward_mult: 1.03`) |
| Elf | +3% velocidad de movimiento, +15% resistencia mágica |
| Dwarf | +2% reducción de daño |
| Orc | +3% daño de ataque |
| Danari | +5% energía máxima, +10% resistencia mágica |
| Draugr | +10% resistencia a control de masas, +15% resistencia mágica |

Estos pasivos se aplican cada tick después de `Stats::reset_temp_modifiers`, en el mismo pase que los atributos por clase (`class_attributes.ron`). Ninguna raza es estrictamente superior — cada una favorece un estilo distinto, y ninguna restringe la elección de clase.

Además del pasivo, cada raza tiene una habilidad innata activa (implementada en el lado de cliente/gameplay, no en `racial_traits.ron`) — la referencia completa de las 6 vive en la wiki de jugadores.

## Sin nuevas razas planeadas

El backlog de New Horizon no describe ninguna raza jugable adicional. Nombres como "Gnome" o "Dhampir" que aparecen en algunos documentos de lore son etiquetas de sabor para razas existentes (Danari, Draugr respectivamente), no razas nuevas.
