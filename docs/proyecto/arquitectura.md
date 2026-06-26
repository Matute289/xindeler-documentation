---
sidebar_position: 2
---

# Arquitectura

Xindeler es un fork del engine Veloren. Sigue su arquitectura central y agrega los sistemas propios del juego (ORACLE, AURORA, FastAPI web) encima.

## Vista general

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (Voxygen)                  │
│         wgpu renderer · egui UI · audio              │
└──────────────────────┬──────────────────────────────┘
                       │ Protocolo Xindeler (QUIC/Quinn)
                       │ puerto 14004
┌──────────────────────▼──────────────────────────────┐
│               Servidor (proceso único)               │
│                                                      │
│  ┌──────────┐  ┌─────────┐  ┌────────────────────┐  │
│  │  ECS     │  │  rtsim  │  │   ORACLE / AURORA  │  │
│  │ (specs)  │  │ world   │  │   (world director  │  │
│  │          │  │ sim     │  │    + NPC AI)        │  │
│  └──────────┘  └─────────┘  └────────────────────┘  │
│                                                      │
│  Persistencia: rtsim/data.dat (MessagePack)          │
│  Eventos:      chronicle/*.jsonl                     │
└──────────────────────────────────────────────────────┘
                       │ REST (puerto 8010)
┌──────────────────────▼──────────────────────────────┐
│              FastAPI (proceso separado)              │
│         /api/waitlist · /api/contribute              │
│         Persistencia: CSV en VPS                     │
└─────────────────────────────────────────────────────┘
```

---

## El servidor es un proceso monolítico

El servidor es **un único binario Rust**. No hay microservicios, no hay "Login Server" ni "Combat Server" separados. Los subsistemas (combate, economía, simulación del mundo, ORACLE, AURORA) son módulos dentro del mismo proceso que comparten memoria y se comunican directamente.

Esto simplifica el deploy, la consistencia de estado, y el desarrollo local — con `cargo run --bin xindeler-server` tenés todo funcionando.

---

## ECS (Entity Component System)

El núcleo del juego usa el paradigma **ECS** vía la crate `specs`. En lugar de objetos con herencia, todo se modela como:

- **Entidad** — un ID numérico (un jugador, un NPC, un ítem en el mundo)
- **Componente** — datos adjuntos a una entidad (`Health`, `Pos`, `Vel`, `Stats`, `Inventory`)
- **Sistema** — lógica que opera sobre conjuntos de componentes (`CombatSystem`, `PhysicsSystem`, `AISystem`)

Los sistemas corren en paralelo cuando no tienen dependencias entre sí. Los componentes son structs simples serializables con `serde`.

---

## rtsim — Simulación del mundo

`rtsim` es el módulo que mantiene el estado persistente del mundo entre sesiones:

- Sitios (ciudades, dungeons, puntos de interés)
- Facciones y sus relaciones
- NPCs con estado a largo plazo (posición, relaciones, inventario)
- El chronicle de eventos (JSONL rotado por tamaño)

El estado se serializa a `rtsim/data.dat` en formato MessagePack. No hay base de datos relacional — todo vive en ese archivo.

---

## Comunicación cliente-servidor

El cliente y el servidor se comunican exclusivamente mediante el **protocolo Xindeler** — un protocolo binario propietario sobre **QUIC** (usando la crate Quinn). No hay REST API, no hay WebSockets para el juego.

La única REST API es FastAPI (puerto 8010), que maneja la lista de espera y contribuidores — no tiene acceso al estado del juego.

---

## ORACLE y AURORA

Son los dos sistemas de IA que corren dentro del servidor como extensiones de `rtsim`:

- **ORACLE** — Director del mundo: genera eventos narrativos, gestiona el ecosistema, controla el clima y los arcos de historia a largo plazo.
- **AURORA** — IA de NPCs: cada NPC tiene una mente con valores, miedos, memoria episódica, y relaciones sociales. AURORA usa una capa LLM opcional para diálogo generativo.

Ambos se controlan vía comandos de chat de admin (`/oracle`, `/aurora`). Su documentación detallada está en las secciones correspondientes.

---

## FastAPI (web, proceso separado)

Un proceso Python independiente expone una REST API mínima para la web:

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/waitlist` | Registrar email en la lista de espera |
| `POST /api/contribute` | Formulario de contribuidores |
| `GET /api/status` | Estado del servidor (online/offline, jugadores) |

Persistencia: archivos CSV en el VPS. No comparte base de datos con el juego.
