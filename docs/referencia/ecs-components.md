---
sidebar_position: 2
---

# Componentes ECS

Referencia de los componentes ECS más usados en Xindeler. Todos están definidos en `common/src/comp/`.

Para entender el modelo ECS, ver [Arquitectura](/proyecto/arquitectura).

---

## Posición y movimiento

### `Pos`
```rust
pub struct Pos(pub Vec3<f32>);
```
Posición en el mundo en coordenadas de vóxel. Presente en todas las entidades con existencia física.

### `Vel`
```rust
pub struct Vel(pub Vec3<f32>);
```
Velocidad actual en metros por tick. El sistema de física la modifica cada tick según fuerzas y colisiones.

### `Ori`
```rust
pub struct Ori(/* quaternion interno */);
```
Orientación de la entidad. Expone métodos como `look_dir()`, `right()`, `up()`.

---

## Stats y vida

### `Health`
```rust
pub struct Health {
    pub current: u32,
    pub maximum: u32,
    pub is_dead: bool,
}
```
Vida actual y máxima. Cuando `current` llega a 0, `is_dead` se marca true y el sistema de muerte procesa la entidad.

### `Energy`
```rust
pub struct Energy {
    pub current: u32,
    pub maximum: u32,
}
```
Recurso consumido por habilidades. Se regenera pasivamente. Algunas clases lo llaman maná, stamina, o rage — el tipo subyacente es el mismo.

### `Stats`
```rust
pub struct Stats {
    pub name: String,
    pub level: u32,
    pub exp: u32,
    pub endurance: u32,
    pub fitness: u32,
    pub willpower: u32,
}
```
Stats base de la entidad. Afectan los cálculos de daño, vida máxima y regeneración de energía.

### `Poise`
```rust
pub struct Poise {
    pub current: f32,
    pub maximum: f32,
    pub poise_change_rate: f32,
}
```
Resistencia a aturdimientos. Si llega a 0, la entidad entra en estado `Stunned`. Se recupera con el tiempo.

---

## Inventario y equipamiento

### `Inventory`
```rust
pub struct Inventory {
    slots: Vec<Option<Item>>,
    loadout: Loadout,
}
```
Contiene los ítems del personaje (mochila) y el equipamiento activo (`Loadout`). Los slots de equipamiento incluyen: mainhand, offhand, head, chest, back, hands, ring, neck, feet.

### `SkillSet`
```rust
pub struct SkillSet {
    pub skills: HashMap<Skill, u8>,
    pub exp: HashMap<SkillGroupKind, u32>,
}
```
Habilidades desbloqueadas y su nivel. La llave `Skill` es un enum que cubre todas las habilidades del juego.

---

## Comportamiento y alineación

### `Alignment`
```rust
pub enum Alignment {
    Wild,       // criaturas salvajes — atacan si se las provoca
    Enemy,      // hostiles a jugadores siempre
    Npc,        // neutrales, no atacan
    Tame,       // mascotas o NPCs domesticados
    Owned(Uid), // pertenece a una entidad específica
    Passive,    // nunca atacan
}
```
Define el comportamiento de combate por defecto de la entidad.

### `Agent`
Componente que activa la IA del servidor para una entidad. Sin `Agent`, la entidad es estática (no patrulle, no reacciona). Contiene el estado del comportamiento actual: patrolling, attacking, fleeing, interacting.

### `CharacterState`
Estado actual de animación/acción del personaje: `Idle`, `Run`, `Jump`, `Attack(ComboMelee { .. })`, `Roll`, `Glide`, etc. El cliente lo usa para animar al personaje; el servidor lo valida.

---

## Red y sincronización

### `Uid`
```rust
pub struct Uid(pub u64);
```
ID único universal de una entidad, sincronizado entre cliente y servidor. El `Entity` de specs es local al proceso — `Uid` es el identificador de red.

### `Client`
Componente presente solo en entidades que tienen un jugador conectado. Contiene el stream QUIC para enviar mensajes al cliente.

### `Presence`
Indica que la entidad tiene un jugador activo y define el rango de visión (qué chunks y entidades se sincronizan al cliente).

---

## Mundo y terreno

### `ChunkPos`
Posición de un chunk en coordenadas de chunk (no de vóxel). `ChunkPos(x, y)` corresponde al chunk que contiene el vóxel `(x*32, y*32)`.

---

## Convenciones de uso

- Los componentes se registran en el `World` de specs al arrancar el servidor
- Para acceder a un componente en un sistema: `ReadStorage<'a, Health>` o `WriteStorage<'a, Health>`
- Para agregar un componente nuevo, definilo en `common/src/comp/`, registralo en `common/src/comp/mod.rs`, y registrá el storage en el servidor
- Los componentes deben implementar `Component` de specs y típicamente `Clone`, `Debug`, y `serde::Serialize`/`Deserialize` si necesitan ser sincronizados por red
