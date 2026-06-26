---
sidebar_position: 1
---

# Arquitectura del servidor

El servidor de Xindeler es un **proceso único** escrito en Rust. No hay microservicios, no hay procesos separados por subsistema. Todo — combate, física, economía, IA, simulación del mundo — corre en el mismo binario compartiendo memoria.

Para la vista general del sistema completo (cliente + servidor + FastAPI), ver [Arquitectura del proyecto](/proyecto/arquitectura).

---

## Estructura interna

```
xindeler-server (proceso único)
│
├── Network layer (Quinn/QUIC)
│   └── Maneja conexiones de jugadores, serialización de mensajes
│
├── ECS dispatcher (specs + rayon)
│   ├── PhysicsSystem       — movimiento, colisiones, gravedad
│   ├── CombatSystem        — daño, poise, death
│   ├── AgentSystem         — IA de NPCs tick a tick (pathfinding, behavior)
│   ├── StatSystem          — regeneración de vida/energía, buffs
│   ├── InventorySystem     — loot, pickup, equip
│   └── ... (~30 sistemas más)
│
└── rtsim (loop separado, escala lenta)
    ├── ORACLE              — director del mundo
    └── AURORA              — mente de NPCs
```

---

## El loop principal

El servidor tiene dos loops principales que corren en threads separados:

### Loop de ECS (tick rápido)

Corre el dispatcher de `specs` a una frecuencia fija (~30 ticks/segundo). Cada tick:

1. Procesa los mensajes entrantes de todos los clientes conectados
2. Ejecuta todos los sistemas ECS en orden (con paralelismo donde es posible)
3. Envía los estados actualizados a los clientes (sync de entidades visibles)

Los sistemas que no tienen dependencias entre sí corren en paralelo gracias a `rayon`. `specs` determina automáticamente qué sistemas pueden paralelizarse según qué componentes leen y escriben.

### Loop de rtsim (tick lento)

Corre en escala de segundos a minutos. Procesa:

- Movimiento de NPCs a larga distancia (rutas entre sitios)
- Actualización de facciones y relaciones
- Ticks de ORACLE (generación de eventos, avance de arcos narrativos)
- Ticks de AURORA (actualización de mentes de NPCs, decaimiento de memoria)
- Serialización periódica del estado a `rtsim/data.dat`

---

## Manejo de conexiones

Cada jugador conectado tiene:

- Un stream QUIC (Quinn) para mensajes confiables (inventario, chat, comandos)
- Opcionalmente canales no confiables para updates de posición frecuentes

El componente `Client` en el ECS representa un jugador conectado. Cuando un jugador se desconecta, su entidad persiste en el mundo por unos segundos (para reconexión) y luego se elimina. Su estado (inventario, posición, stats) se guarda en `rtsim`.

---

## Sincronización de entidades

El servidor no envía el estado de todas las entidades a todos los clientes — eso sería demasiado ancho de banda. Cada cliente tiene un **rango de presencia** (radio de chunks alrededor del jugador). El servidor envía solo las entidades dentro de ese rango.

Cuando una entidad entra o sale del rango de un jugador:
- **Entra**: el servidor envía la entidad completa al cliente
- **Sale**: el cliente la elimina de su ECS local
- **Visible**: el servidor envía diffs de componentes modificados cada tick

---

## Comandos de admin

Los admins controlan el servidor vía comandos de chat prefijados con `/`. Ver [Comandos de admin](/servidor/admin-commands) para la referencia completa.

Los comandos de ORACLE y AURORA también se ejecutan desde el chat de admin:
```
/oracle status
/aurora npc <id> status
/time set noon
/give_item common.items.weapons.sword.iron_sword 1
```

---

## Escalabilidad

El servidor actual está diseñado para **una instancia por mundo** — no hay sharding ni múltiples instancias del mismo mundo. La escala vertical (más CPU/RAM en el mismo servidor) es el camino para soportar más jugadores simultáneos.

El límite práctico depende del hardware y de la densidad de jugadores. Un servidor con 8 cores puede manejar cientos de jugadores sin problemas si están distribuidos en el mundo.
