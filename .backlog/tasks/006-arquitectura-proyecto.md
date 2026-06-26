# 006 — proyecto/arquitectura.md

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 2

## Objetivo
Mapa mental del workspace Rust de Xindeler: qué crates existen, cómo fluyen los datos,
y dónde vive cada subsistema.

## Contenido a cubrir

### Workspace overview
Xindeler es un Cargo workspace con estos crates principales:

| Crate | Descripción |
|-------|-------------|
| `voxygen` | Cliente: render, UI, input |
| `server` | Proceso del servidor; tick ECS |
| `world` | Generación procedural de terreno y sites |
| `rtsim` | Real-time simulation: NPCs, facciones, ORACLE, AURORA |
| `common` | Tipos compartidos: componentes ECS, items, abilities |
| `common-net` | Protocolo de red compartido |
| `assets` | Assets del juego (RON, PNG, WAV) — no es un crate Rust |

### Diagrama de flujo de datos (texto)
```
[voxygen cliente] <-> protocolo binario (Quinn/QUIC) <-> [server process]
                                                               |
                                              +----------------+-----------------+
                                              |           ECS tick              |
                                              |   [world] [rtsim] [combat sys]  |
                                              |       |        |                |
                                              |   [ORACLE]  [AURORA]            |
                                              |       +--------+                |
                                              |     WorldFacts queue            |
                                              +---------------------------------+
                                                           |
                                                    MessagePack
                                                    rtsim/data.dat
```

### El servidor es MONOLÍTICO
**Crítico:** No existen Login Server, Chat Server, World Server como procesos separados.
Son subsistemas dentro de **un único proceso Rust**. Documentar como tal.

### Persistencia
- `rtsim/data.dat` — MessagePack, ~25 MB proyectados, toda la simulación del mundo
- JSONL chronicle — archival de eventos, rotado por tamaño
- `/srv/xindeler/data/waitlist.csv` — solo la waitlist web (no es persistencia del juego)
