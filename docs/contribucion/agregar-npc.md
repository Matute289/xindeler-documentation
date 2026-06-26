---
sidebar_position: 5
---

# Agregar un NPC

Guía paso a paso para agregar un nuevo NPC al juego.

Un NPC en Xindeler tiene dos capas:
1. **Definición de entidad** — qué cuerpo, stats y equipamiento tiene
2. **Comportamiento rtsim** — cómo actúa en la simulación del mundo (opcional para NPCs simples)

Esta guía cubre un NPC estático con comportamiento básico. Para NPCs con IA AURORA compleja, ver la sección [AURORA](/aurora/intro).

---

## Archivos que vas a tocar

| Archivo | Qué define |
|---------|-----------|
| `assets/common/entity/humanoid/` | Plantilla RON del NPC |
| `world/src/site2/plot/` | Dónde aparece en el mundo (opcional) |
| `server/src/rtsim/entity.rs` | Registro en rtsim (solo si tiene estado persistente) |

---

## Paso 1: Crear la plantilla de entidad

Creá un archivo RON en `assets/common/entity/humanoid/` (o la carpeta que corresponda a su tipo):

```
assets/common/entity/humanoid/vendedor_pociones.ron
```

```ron
EntityConfig(
    name: Name("Vendedor de Pociones"),
    body: Body(
        kind: Humanoid(HumanoidBody(
            species: Human,
            body_type: Male,
        )),
    ),
    alignment: Alignment::Npc,
    loot: LootSpec::Item(
        "common.items.consumable.potion_minor",
    ),
    inventory: Inventory(
        items: [
            (
                item: "common.items.consumable.potion_minor",
                amount: 5,
            ),
        ],
    ),
    skillset_asset: Some("common.skillset.merchant"),
)
```

Los campos clave:

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre que aparece sobre el NPC |
| `body` | Apariencia: especie, tipo de cuerpo |
| `alignment` | `Npc` (neutral), `Enemy`, `Friendly` |
| `loot` | Qué dropea al morir |
| `inventory` | Ítems que carga (para comerciantes) |
| `skillset_asset` | Habilidades de combate que usa |

---

## Paso 2: Registrar el spawn en el mundo

Para que el NPC aparezca en una ciudad, editá el plot correspondiente en `world/src/site2/plot/`. Por ejemplo, para un comerciante en una aldea:

```rust
// En world/src/site2/plot/town.rs (o el plot relevante)
spawns.push(EntityInfo::at(pos)
    .with_asset_expect("common.entity.humanoid.vendedor_pociones")
    .with_alignment(Alignment::Npc));
```

Si querés que aparezca en múltiples sitios del mismo tipo, el sistema de generación lo distribuye automáticamente.

---

## Paso 3: (Opcional) Darle estado persistente en rtsim

Si el NPC necesita recordar cosas entre sesiones (inventario persistente, relaciones con jugadores, rutas comerciales), registralo en `server/src/rtsim/entity.rs`:

```rust
// Agregar una variante en el enum de tipos de NPC rtsim
pub enum NpcKind {
    // ... existentes
    Merchant,
}
```

Y en la lógica de spawneo de rtsim, asociar tu plantilla RON al kind:

```rust
NpcKind::Merchant => "common.entity.humanoid.vendedor_pociones",
```

Para NPCs sin estado persistente (decorativos, guardias estáticos), este paso no es necesario.

---

## Paso 4: Verificar

```bash
cargo build
cargo run --bin xindeler-server
```

Conectate con el cliente, viajá a una zona con tu tipo de site y verificá que el NPC aparece. Si no aparece, revisá:

- Que el path en el archivo RON sea correcto (sin errores de tipeo)
- Que el site donde intentás spawnearlo use el plot que editaste
- Los logs del servidor para errores de asset loading:
  ```
  [ERROR] Failed to load asset: common.entity.humanoid.vendedor_pociones
  ```

---

## Paso 5: Commitear

```bash
git add assets/common/entity/humanoid/vendedor_pociones.ron
git add world/src/site2/plot/town.rs   # si lo modificaste
git commit -m "feat: add potion vendor NPC to town sites"
```

Abrí el PR con una descripción de qué tipo de NPC es y en qué sitios aparece.
