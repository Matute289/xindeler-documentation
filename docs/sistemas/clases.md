---
sidebar_position: 3
---

# Clases

Xindeler tiene **14 clases jugables** (`ClassKind` en `common/src/comp/class.rs`), más `Adventurer` como clase legacy/default no seleccionable en la creación de personaje.

## Roster completo

| Clase | Fuente mágica (gating) | Identidad |
|---|---|---|
| Warrior | — (marcial) | maestro de armas |
| Barbarian | — (marcial) | furia como self-buff; mayor curva de vida del juego |
| Rogue | — (marcial) | precisión, sigilo |
| Mage | Arcane (estudio) | spellbook versátil, múltiples escuelas |
| Sorcerer | Arcane (linaje) | surges innatos, metamagia |
| Warlock | Arcane (pacto) | poder otorgado por un patrón; menor curva de vida del juego |
| Bard | Arcane (arte) | soporte/control vía música |
| Cleric | Divine | canal divino |
| Paladin | Divine (juramento) | smites, auras |
| Druid | Primordial | shapeshift + magia de naturaleza |
| Ranger | Primordial | semi-caster cazador |
| Monk | Ki | disciplina desarmada; ki como rework de energía |
| Artificer | Arcane (mitad) | infusiones (mecánica todavía no implementada) |
| Blood Slayer | Hemomancia + marcial | conjuros pagados con HP propio en vez de energía |

Las 4 primeras (Warrior, Rogue, Mage, Cleric) fueron la wave original. Las 10 restantes se agregaron en BL-04 ("classes-wave", `specs/2026-06-22-classes-wave-design.md`).

## Estado de implementación

Todas las 14 son seleccionables en la creación de personaje y tienen: `ClassKind` propio, atributos por clase (`class_attributes.ron`), persistencia, kit inicial (arma + outfit + consumible), y restricciones de equipamiento. Lo que **no** tienen las 10 nuevas todavía es un árbol de habilidades propio poblado — la spec de BL-04 lo deja explícito ("skill trees empty, populate later" = BL-06, todavía sin shippear). Hasta que eso llegue, esas 10 clases juegan sobre su kit base sin habilidades especializadas encima.

Varios kits iniciales de las 10 nuevas son placeholders reutilizados de las 4 originales (ej. el outfit de Sorcerer reutiliza las túnicas moradas del Mage, o Warlock reutiliza las vestimentas del Cleric) — está anotado como tal directamente en los RON de loadout (`assets/common/loadout/class/*.ron`).

## Atributos por clase

`assets/common/class/class_attributes.ron` define, por clase: `base_health`/`per_level_health`, `base_energy`/`per_level_energy`, `per_level_damage`, `energy_reward_mult`, y curvas de accuracy/evasion/crit físicas y mágicas. Se aplican cada tick después de `Stats::reset_temp_modifiers`, igual que los pasivos raciales. Son números de primera pasada (game-balance-designer) sujetos a retune por telemetría — no tratar como valores finales.

## Multiclase

Desde el nivel 20, un personaje puede sumar una segunda clase sin perder progreso en la primera (`grant_second_class`, `MULTICLASS_MIN_LEVEL = 20` en `common/src/comp/class.rs`). Máximo dos clases (`CharacterClass{primary, secondary}`). Los niveles ganados después de la segunda clase se reparten entre ambas.
