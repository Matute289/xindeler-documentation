# 018 — Servidor profundo: world-sim, combat, economía, persistencia

**Estado:** `[ ]` Pendiente  
**Prioridad:** Baja  
**Sprint:** 6

## Páginas a completar

### servidor/arquitectura.md
- Proceso único Rust: no es microservicios
- ECS tick: cómo el servidor avanza la simulación frame a frame
- Subsistemas principales y sus responsabilidades

### servidor/world-simulation.md
- rtsim: la simulación larga de sites, facciones, NPCs
- Sites: asentamientos, ruinas, mazmorras — generados proceduralmente
- Factions: objetivos, territorios, relaciones

### servidor/combat.md
- ECS systems de combate: orden de ejecución en el tick
- Autoridad del servidor: el servidor es authoritative, el cliente predice

### servidor/persistencia.md
- MessagePack data.dat: cómo se serializa/deserializa el mundo
- Migration strategy: `#[serde(default)]` para campos nuevos
- JSONL chronicle: archival de eventos

### servidor/admin-commands.md
Lista completa de comandos admin disponibles en el chat del servidor.
