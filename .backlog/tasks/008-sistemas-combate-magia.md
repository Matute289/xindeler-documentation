# 008 — sistemas/combate.md + sistemas/magia.md

**Estado:** `[ ]` Pendiente  
**Prioridad:** Media  
**Sprint:** 3

## sistemas/combate.md
Mecánicas de combate implementadas en el ECS:
- **Poise system** — barra de resistencia al stagger; se resetea al esquivar
- **Combos** — ataques encadenados que desbloquean finisher moves
- **Buffs/Debuffs** — stack de effects en el componente `Buffs`
- **Backstab** — multiplicador de daño si el target no detecta al atacante
- **Parry** — ventana de frames para reducir daño y staggar al atacante
- **Proyectiles** — componente `Projectile`, velocidad, tiempo de vida, fuente de daño

Fuente de verdad: `common/src/comp/buff.rs`, `common/src/combat.rs`, specs en `xindeler-design`

## sistemas/magia.md
- **MagicSource enum** — Arcane, Divine, Primal, Psionic, Ki
- **Escuelas** — Evocación, Hemomancy, Axiomancy, Necromancy, Abjuration (+ más por definir)
- **SpellDef** en compendium.ron — estructura de definición de hechizos
- **Status effects** — veneno, fuego, hielo, bendición, etc.
- **Energy system** — la barra de energía como recurso de casting

Nota: Hemomancy y Axiomancy son las más originales — darles espacio descriptivo.
Fuente: `assets/common/abilities/`, specs en `xindeler-design`
