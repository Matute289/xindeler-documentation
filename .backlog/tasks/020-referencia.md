# 020 — Referencia: asset-formats, ecs-components, glosario

**Estado:** `[ ]` Pendiente  
**Prioridad:** Baja  
**Sprint:** 6

## Páginas a completar

### referencia/asset-formats.md
- RON (Rusty Object Notation): formato de assets de Veloren
- TOML: configuración del servidor
- Formato de items: campos obligatorios, calidad, restricciones
- Formato de abilities: SpellDef, CharacterAbility
- Ejemplo completo de item RON y ability RON

### referencia/ecs-components.md
Componentes ECS más comunes que un contributor necesita conocer:
- `Health`, `Energy`, `Poise`, `Stats`
- `Body`, `PhysicsState`
- `Inventory`, `InventoryUpdate`
- `Buffs`, `Auras`
- `Agent` (comportamiento de NPC)
- `rtsim::Body` (NPC del rtsim)

### referencia/glosario.md
Términos técnicos del proyecto:
- ECS (Entity-Component-System)
- rtsim, ORACLE, AURORA, WorldFact
- rmp-serde (MessagePack serializer)
- wgpu, Quinn, voxygen
- Site, Settlement, Faction (en contexto de world sim)
- Sprint 1–6 (sprints del backlog)
