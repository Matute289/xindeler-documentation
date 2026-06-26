---
sidebar_position: 2
---

# Simulación del mundo

Cómo el servidor mantiene un mundo vivo entre sesiones de juego.

---

## rtsim — Real-Time Simulation

`rtsim` es el módulo que simula el mundo a una escala de tiempo lenta. Mientras el ECS procesa física y combate a 30 ticks por segundo, rtsim opera en segundos y minutos reales — maneja decisiones de largo plazo que no necesitan precisión de tick.

Lo que vive en rtsim:

- **NPCs persistentes** — posición, destino, facción, inventario, estado de ánimo
- **Sitios** — estado de ciudades, dungeons, puntos de interés
- **Facciones** — relaciones entre grupos (aliadas, rivales, neutrales)
- **ORACLE** — estado del director del mundo y arcos narrativos
- **AURORA** — mente de cada NPC (memoria, valores, relaciones)

---

## El ciclo de rtsim

El loop de rtsim corre en un thread separado al ECS principal:

```
Cada tick de rtsim (~1-5 segundos reales):
1. Actualizar posiciones de NPCs (pathfinding a larga distancia)
2. Procesar decisiones de NPCs (AURORA: goals, acciones)
3. Evaluar el estado del mundo (ORACLE: condiciones de eventos)
4. Emitir entidades cercanas a jugadores al ECS (spawn/despawn)
5. Serializar estado a data.dat (periódicamente)
```

Cuando un NPC de rtsim entra en el rango de visión de un jugador, el servidor crea una entidad ECS para él. Cuando sale del rango, la entidad ECS se elimina y el estado vuelve a rtsim.

---

## Sites — Sitios del mundo

Los sitios son los puntos de interés del mundo: ciudades, aldeas, dungeons, ruinas, cuevas. Se generan al crear el mundo y persisten en rtsim.

Cada sitio tiene:
- Posición en el mapa
- Tipo (Town, Dungeon, Cave, Ruin, etc.)
- Estado actual (intacto, parcialmente destruido, conquistado)
- Lista de NPCs residentes (con sus estados persistentes)
- Facción propietaria (para ciudades y campamentos)

Los sitios se generan en `world/src/site2/` usando plots (edificios y estructuras individuales) que se combinan para formar el sitio completo.

---

## Facciones

Las facciones son grupos con relaciones entre sí que cambian dinámicamente. Una facción puede:

- Controlar sitios (ciudades, campamentos)
- Tener NPCs miembros con lealtad a ella
- Estar en guerra, paz o alianza con otras facciones
- Perder o ganar territorio según los eventos del mundo

ORACLE usa el estado de las facciones para generar eventos narrativos: si dos facciones llevan tiempo en paz, puede proponer un acuerdo comercial; si una facción pierde demasiados miembros, puede declarar una emergencia.

---

## Pathfinding de largo alcance

Los NPCs de rtsim se mueven entre sitios usando pathfinding en el mapa del mundo (no en terreno de vóxel — ese es el pathfinding del ECS para NPCs cercanos).

El pathfinding de rtsim usa un grafo de rutas entre sitios. Un comerciante que decide ir de la aldea A al mercado B elige la ruta más corta entre los caminos conocidos. Si un camino es peligroso (muchos eventos de combate recientes), los NPCs pueden evitarlo.

---

## Persistencia del estado

El estado completo de rtsim se serializa a `rtsim/data.dat` en MessagePack:

- **Guardado periódico:** cada N minutos durante la ejecución del servidor
- **Guardado al apagar:** siempre que el servidor se cierre limpiamente (SIGTERM)
- **Pérdida de datos:** si el servidor muere con SIGKILL, se pierden los cambios desde el último guardado periódico

Al arrancar, el servidor carga `data.dat`. Si el archivo no existe (mundo nuevo) o no se puede leer (corrupción), genera un mundo nuevo y registra el error.

---

## Eventos del chronicle

Cada cambio significativo en el estado del mundo genera una línea en `chronicle/events-current.jsonl`:

```json
{"ts":1750000000,"kind":"SiteConquered","site":"Ironholm","by":"Bandits"}
{"ts":1750000300,"kind":"NpcDied","npc":"Aldric el Comerciante","cause":"Combat"}
{"ts":1750001800,"kind":"FactionPeace","a":"Merchants","b":"Guards"}
```

ORACLE lee el chronicle para tener contexto histórico al generar nuevos eventos. El chronicle también es útil para debugging — podés ver exactamente qué pasó en el mundo y cuándo.

---

## Debugging

Para inspeccionar el estado de rtsim en vivo, usá los comandos de admin:

```
/site list                    — listar todos los sitios y su estado
/npc list                     — listar NPCs persistentes cercanos
/npc <id> status              — estado completo de un NPC rtsim
/faction list                 — listar facciones y sus territorios
/oracle status                — estado del director del mundo
```

Para regenerar el mundo desde cero (borrando data.dat):

```bash
# Detener el servidor
rm rtsim/data.dat
# Reiniciar — el servidor genera un mundo nuevo
cargo run --bin xindeler-server
```

⚠️ Esto borra todo el estado del mundo: NPCs, facciones, progreso narrativo.
