---
sidebar_position: 5
---

# Persistencia (Servidor)

> *Nota de edición: esta página figuraba como completa en otra parte del repo, pero en el árbol de docs seguía siendo el stub de "en construcción". La corregimos acá.*

Todo lo relacionado a guardar y cargar datos de personaje vive en `server/src/persistence/` (`mod.rs`, `character_loader.rs`, `character_updater.rs`, `json_models.rs`, `models.rs`, y el submódulo `character/`). Para la simulación del mundo (NPCs, sitios, facciones, ORACLE/AURORA) — que **no** vive acá — ver [Simulación del mundo](/servidor/world-simulation).

---

## Qué se persiste por personaje

`PersistedComponents` (`server/src/persistence/mod.rs`) es la lista canónica de lo que se guarda al crear o actualizar un personaje:

```rust
pub struct PersistedComponents {
    pub body: comp::Body,
    pub hardcore: Option<comp::Hardcore>,
    pub character_class: comp::CharacterClass,
    pub stats: comp::Stats,
    pub skill_set: comp::SkillSet,
    pub inventory: comp::Inventory,
    pub waypoint: Option<comp::Waypoint>,
    pub pets: Vec<PetPersistenceData>,
    pub active_abilities: comp::ActiveAbilities,
    pub map_marker: Option<comp::MapMarker>,
    pub ethos: comp::Ethos,
    pub background: comp::Background,
}
```

En criollo: cuerpo/raza, modo hardcore, clase (primaria + secundaria si hay multiclase), stats, árboles de habilidades ([ver Habilidades](/sistemas/habilidades)), inventario, posición (waypoint), mascotas, barra de habilidades activas, marcador de mapa, alineamiento (`Ethos`) y trasfondo narrativo (`Background`, agregado en BL-31).

**Lo que NO está acá**: el estado del mundo — posiciones de NPCs de rtsim, estado de sitios/facciones, arcos narrativos de ORACLE, memoria de AURORA. Eso vive en `rtsim/data.dat`, se serializa en su propio loop lento, y es responsabilidad de rtsim, no de este módulo. Ver [Simulación del mundo](/servidor/world-simulation) y [Arquitectura del servidor](/servidor/arquitectura).

---

## Formato de almacenamiento: SQLite + campos JSON anidados

La base es un archivo **SQLite** único, `db.sqlite`, abierto con `rusqlite` en modo WAL (write-ahead logging, para mejor concurrencia) en el directorio de saves del servidor:

```rust
// server/src/persistence/mod.rs
let connection = Connection::open_with_flags(
    settings.db_dir.join("db.sqlite"),
    open_flags,
)
```

No es "un JSON por personaje" — es una base relacional normal con tablas (`character`, `item`, `body`, `skill_group`, `pet`, `ability_sets`, etc., definidas en `models.rs`). Lo que sí es cierto es que varias columnas guardan **JSON serializado como texto** para estructuras anidadas que no vale la pena normalizar en más tablas: el listado de skills desbloqueados de un `SkillGroup` (columna `skills`), las propiedades extra de un `Item` (columna `properties`), y los datos de cuerpo no-humanoide (`body_data`). `json_models.rs` es la capa de conversión entre los tipos Rust del ECS y estas representaciones — funciones como `skill_group_to_db_string`/`db_string_to_skill_group` traducen `SkillGroupKind` a/desde el string que se guarda en la columna `skill_group_kind` (ej. `"Class Mage"`, `"Weapon Sword"`), y hay equivalentes para clase (`class_to_db_string`) y trasfondo (`background_to_db_string`).

La posición se guarda como un `Waypoint` serializado en la columna `waypoint` de `character` (parseado por `parse_waypoint`); el modelo `CharacterPosition` en `json_models.rs` también existe para transportar `waypoint: Option<Vec3<f32>>` + `map_marker: Option<Vec2<i32>>` juntos donde hace falta.

---

## Cuándo se guarda

Dos disparadores, no solo el logout:

1. **Periódico** — el servidor corre un `PersistenceScheduler` cada 10 segundos (`sys::PersistenceScheduler::every(Duration::from_secs(10))`, registrado en `server/src/lib.rs`), que llama a `updater.batch_update(...)` (`server/src/sys/persistence.rs`) para volcar los cambios pendientes de todos los personajes conectados.
2. **Al desconectar** — `CharacterUpdater::add_pending_logout_update` encola el estado final del personaje para el próximo batch.

Los guardados se agrupan en **batches transaccionales** (`execute_batch_update`, dentro de una transacción SQLite): si un batch falla a mitad de camino, se desconecta a todos los clientes en vez de dejar la base en un estado parcialmente escrito.

---

## Migraciones: numeradas y (mayormente) aditivas

El esquema se versiona con [`refinery`](https://docs.rs/refinery), archivos `.sql` en `server/src/migrations/` con el patrón `V<n>__<nombre>.sql`. Al arrancar, `run_migrations` corre todo lo pendiente contra la conexión antes de levantar el servidor — si una migración falla, el servidor no arranca. Al momento de escribir esto van **77 migraciones** (`V1` a `V77`).

El patrón dominante es `ALTER TABLE ... ADD COLUMN` — agregar una columna nueva, casi siempre nullable o con `DEFAULT`, para no romper personajes ya guardados. Ejemplo concreto, `V73__character_background.sql` (el trasfondo narrativo de BL-31):

```sql
ALTER TABLE "character" ADD COLUMN background TEXT;
ALTER TABLE "character" ADD COLUMN background_custom_note TEXT;
```

Ambas columnas son `NULL`-eables a propósito: un personaje guardado antes de esta migración carga con `Background(None)` ("Uncommitted") sin forzar ninguna elección ni perder datos. Es el patrón típico de estas migraciones — agregar, nunca romper lo que ya existe.

Otro ejemplo en la misma familia: `V74__skill_group_direct_sp.sql` agrega `direct_earned_sp`/`direct_available_sp` a `skill_group` para persistir los puntos de Feats otorgados por hito de nivel, que antes se perdían en cada recarga porque no pasaban por la economía de XP normal (ver [Habilidades](/sistemas/habilidades)). Y la secuencia `V75`–`V77` (`secondary_class`, `secondary_class_level`, `secondary_class_future_levels`) fue agregando, migración por migración, el soporte de multiclase a la tabla `character` sin tocar las columnas existentes.

No es una regla absoluta — hay algún `DROP COLUMN` puntual más atrás en el historial (`V4`, `V22`, `V46`) para casos donde una columna quedó obsoleta de verdad — pero la norma de facto es aditiva: sumar columnas nullable antes que romper el esquema existente.

Después de correr las migraciones, el servidor también ejecuta `VACUUM main` sobre la base (`vacuum_database`) para recuperar espacio en disco.

---

## Ver también

- [Arquitectura del servidor](/servidor/arquitectura) — dónde encaja este módulo en el proceso del servidor
- [Simulación del mundo](/servidor/world-simulation) — la otra mitad del estado persistente: rtsim, no la base de personajes
- [Habilidades](/sistemas/habilidades) — el detalle de qué es `SkillSet`/`SkillGroup`, la estructura que este módulo serializa
