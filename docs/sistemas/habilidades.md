---
sidebar_position: 8
---

# Habilidades

El sistema de habilidades vive en `common/src/comp/skillset/mod.rs` (`SkillSet`, `SkillGroup`) y `common/src/comp/skillset/skills.rs` (el enum `Skill`). Un personaje no tiene un único árbol: tiene varios **grupos de habilidades** (`SkillGroupKind`) independientes, cada uno con su propia experiencia y sus propios puntos de habilidad (SP).

Para el roster de clases y su estado de implementación general, ver [Clases](/sistemas/clases). Esta página se enfoca en cómo se ganan y gastan los puntos.

---

## Nivel de personaje: derivado, no guardado

El nivel de personaje **no se persiste**. `SkillSet::character_level` se recalcula siempre a partir de la experiencia total ganada de por vida:

```rust
pub const MAX_CHARACTER_LEVEL: u16 = 60;
pub const LEVEL_XP_BASE: u32 = 250;

pub fn level_from_total_exp(total_exp: u32) -> u16 { /* ... */ }
```

`level_from_total_exp` usa `LEVEL_XP_BASE * (L - 1)^2` como XP acumulada requerida para el nivel `L`, con tope en `MAX_CHARACTER_LEVEL = 60`. El campo `character_level` está marcado `#[serde(skip)]` — nunca viaja por red ni se guarda en la DB, así que no puede desincronizarse: se reconstruye en cada deserialización (`SkillSetMeta` → `SkillSet`) sumando el `earned_exp` de todos los `SkillGroup`.

---

## Grupos de habilidades (`SkillGroupKind`)

```rust
pub enum SkillGroupKind {
    General,
    Weapon(ToolKind),
    Class(ClassKind),
    Feats,
}
```

| Grupo | Cómo se desbloquea | Cómo gana XP |
|---|---|---|
| `General` | Siempre disponible desde la creación del personaje (`initial_skills()`) | Todo kill/actividad que dé XP de combate |
| `Weapon(ToolKind)` | El jugador gasta un skill de `General` (`UnlockGroup(Weapon(..))`) para desbloquearlo | Solo cuando esa arma está equipada (mainhand/offhand, activa o inactiva) |
| `Class(ClassKind)` | Otorgado directamente en la creación de personaje / `/set_class` (`unlock_skill_group`) | Siempre activo, como `General` — es la única fuente de SP para el árbol de clase |
| `Feats` | Otorgado directamente por hitos de nivel (ver abajo) | No gana XP — los SP se otorgan de golpe, sin economía de XP |

`Class` y `Feats` son los dos grupos marcados `is_directly_granted()` — se conceden explícitamente en vez de desbloquearse gastando un skill de otro árbol, y por eso necesitan resembrar su skill `UnlockGroup` al cargar desde la base de datos (`load_from_database`, ver [Persistencia](/servidor/persistencia)).

### De dónde sale la XP en cada kill

`server/src/events/entity_manipulation.rs` arma el conjunto de "pools" de XP a repartir en cada recompensa de combate:

- `General` siempre entra.
- Por cada arma equipada (mainhand/offhand, activa e inactiva) que tenga un `SkillGroupKind::Weapon` accesible, esa arma entra al pool.
- El o los grupos `Class(_)` del personaje cuentan como **un solo slot**, sin importar si el personaje es multiclase (dos grupos de clase reparten esa porción 50/50 entre ellos en vez de diluir a `General` y a las armas).

La recompensa de XP se divide en partes iguales entre todos los pools activos. Pelear con una espada equipada reparte XP entre `General`, `Weapon(Sword)` y la(s) clase(s) del personaje — no hace falta "entrenar" el árbol de un arma que no estás usando.

---

## Puntos de habilidad (SP): cómo se ganan y se gastan

Cada `SkillGroup` trackea `earned_exp`/`available_exp` (XP) y `earned_sp`/`available_sp` (puntos). `add_experience` en un grupo intenta convertir XP en SP automáticamente en un loop (`earn_skill_point`), así que una sola recompensa grande puede otorgar varios puntos de una.

El costo en XP del *próximo* punto sube con la cantidad de puntos ya ganados en ese grupo (`skill_point_cost`, curva distinta para `Weapon`/`Class` que para `General`/`Feats`). Gastar un SP en un skill específico se hace con `unlock_skill`, que valida:

- que el grupo tenga SP disponibles,
- que el skill no esté ya al nivel máximo (`SKILL_MAX_LEVEL`),
- que los prerrequisitos estén cumplidos (`SKILL_PREREQUISITES`, con variantes `All`/`Any`).

### Feats: puntos por hito de nivel, sin XP

Los `Feats` son la excepción a la economía de XP. `SkillSet::grant_skill_point` los otorga directamente, sin pasar por `earn_skill_point`:

```rust
// server/src/events/entity_manipulation.rs
for milestone in [15, 25, 35, 45] {
    if level_before < milestone && level_after >= milestone {
        skill_set.grant_skill_point(SkillGroupKind::Feats);
    }
}
```

Un punto de feat por cada 10 niveles a partir del 15, hasta 4 puntos totales a nivel 45. Si un solo salto de XP cruza varios hitos a la vez (por ejemplo un `/set_level` de nivel 13 a 30), se otorga un punto por cada hito cruzado. El grupo `Feats` es class-agnostic: está disponible para cualquier personaje en paralelo a `General`.

Como estos puntos no vienen de XP, se guardan en columnas separadas en la base de datos (`direct_earned_sp`/`direct_available_sp`, migración `V74__skill_group_direct_sp.sql`) para no perderse en cada recarga — ver [Persistencia](/servidor/persistencia).

---

## Árboles definidos (`skills_skill-groups_manifest.ron`)

El contenido real de cada árbol —qué skills pertenecen a qué grupo— vive en `assets/common/skill_trees/skills_skill-groups_manifest.ron`, no en el código Rust. Esto es lo que hay ahí hoy:

- **`General`**: desbloqueos de armas (`UnlockGroup(Weapon(Sword|Axe|Hammer|Bow|Staff|Sceptre))`) más mejoras de traversal (`Climb(Cost)`, `Climb(Speed)`, `Swim(Speed)`).
- **`Weapon(Sword)`** y análogos para `Axe`, `Hammer`, `Bow`, `Staff`, `Sceptre`, `Pick`: árboles de combate completos por arma (familias tipo Heavy/Cleaving/Agile/Crippling/Defensive según el arma, ej. `Sword(HeavySweep)`, `Sword(AgileFlurry)`, `Sword(DefensiveRiposte)`).
- **`Class(Warrior)`, `Class(Mage)`, `Class(Cleric)`, `Class(Rogue)`**: 12 skills cada uno (las 4 clases originales, wave "BL-06 proof slice"). Ejemplo, Mage: `FocusedMind`, `TrueAim`, `ArcaneSurge`, `SpellPotency`, `PyromanticAttunement`, `CryomanticAttunement`, `QuickCasting`, `PenetratingMagic`, `WardedSkin`, `ManaEfficiency`, `Overcharge`, `ArcaneMastery`.
- **`Class(Barbarian)`, `Class(Sorcerer)`, `Class(Warlock)`, `Class(Bard)`, `Class(Paladin)`, `Class(Druid)`, `Class(Ranger)`, `Class(Monk)`, `Class(Artificer)`, `Class(BloodSlayer)`**: **listas vacías** (`[]`) en el manifest, comentadas explícitamente como `"Classes-wave (BL-04): empty trees now; populated per-class in BL-06"`. Estas 10 clases son jugables y tienen kit inicial + atributos propios (ver [Clases](/sistemas/clases)), pero **todavía no tienen árbol de habilidades propio** — el grupo `Class(_)` existe y acumula XP/SP igual, simplemente no hay skills en los que gastar esos puntos todavía.
- **`Feats`**: lista larga y class-agnostic, agrupada por comentarios en secciones temáticas (`Combat`, `Magic`, y más — ver el RON directamente para el listado completo, no se detalla acá).

Si estás implementando un árbol de clase nuevo (BL-06), este manifest es el punto de entrada: agregar los `Skill(...)` correspondientes a la lista de `Class(TuClase)` los hace automáticamente elegibles para gastar SP ahí, siempre que el enum `Skill` en `skills.rs` ya tenga las variantes necesarias.

---

## Presets de `SkillSetBuilder`: no son el árbol del jugador

`common/src/skillset_builder.rs` define un `SkillSetBuilder` con un enum `Preset` (`Rank1`..`Rank5`) que carga RON desde `assets/common/skillset/preset/rank{1..5}/{general,sword,axe,hammer,bow,staff,sceptre,fullskill}.ron`. **Esto no es el sistema de progresión del jugador** — es un generador de skillsets completos usado para construir NPCs y entidades invocadas (`server/src/states/basic_summon.rs`, invocaciones de conjuros) con un nivel de poder de combate predefinido.

Los archivos por rank escalan la cantidad de skills desbloqueados del árbol de esa arma: `rank1/sword.ron` solo trae `Group(Weapon(Sword))` (el grupo desbloqueado, sin skills), mientras que `rank5/sword.ron` trae el árbol de espada casi completo (`HeavySweep`, `CleavingEarthSplitter`, `AgileFlurry`, `DefensiveDeflect`, etc., todos a nivel 1). `fullskill.ron` en cada rank es un nodo `Tree(...)` que concatena todos los árboles de arma más `general` de ese mismo rank — útil para dar a un summon un kit "completo" de cierto poder sin listar cada skill a mano.

---

## Ver también

- [Clases](/sistemas/clases) — roster completo, atributos por clase, multiclase
- [Persistencia (servidor)](/servidor/persistencia) — cómo se guardan `SkillSet` y sus grupos
- [Combate (servidor)](/servidor/combat) — de dónde sale la recompensa de XP que alimenta este sistema
