---
sidebar_position: 6
---

# Comandos de admin

Referencia de comandos de administrador del servidor. Se ejecutan desde el chat del juego con el prefijo `/`, o desde la consola del servidor.

Para usar comandos de admin, tu cuenta necesita permisos de admin en el servidor. En un servidor local, todos los jugadores tienen permisos de admin por defecto.

---

## Jugadores

| Comando | Descripción |
|---------|-------------|
| `/give_item <asset_id> [cantidad]` | Dar un ítem al jugador actual |
| `/give_item_npc <asset_id> [cantidad]` | Dar un ítem al NPC objetivo |
| `/tp <jugador>` | Teleportar al jugador destino |
| `/goto <x> <y> <z>` | Teleportar a coordenadas |
| `/kill` | Matar al jugador actual |
| `/respawn` | Respawnear al jugador actual |
| `/kill_npcs` | Matar todos los NPCs en el área |
| `/players` | Listar jugadores conectados |
| `/ban <jugador> <razón>` | Banear a un jugador |
| `/unban <jugador>` | Desbanear a un jugador |
| `/kick <jugador> <razón>` | Kickear a un jugador |

---

## Mundo y tiempo

| Comando | Descripción |
|---------|-------------|
| `/time` | Ver la hora actual del mundo |
| `/time set <valor>` | Cambiar la hora (`noon`, `midnight`, `dawn`, `dusk`, o número 0.0–1.0) |
| `/weather <tipo>` | Cambiar el clima (`clear`, `rain`, `snow`, `storm`) |
| `/lightning` | Invocar un rayo en la posición actual |

---

## Entidades y spawns

| Comando | Descripción |
|---------|-------------|
| `/summon <asset_id>` | Spawnear una entidad en la posición actual |
| `/make_npc <asset_id> [cantidad]` | Spawnear N NPCs |
| `/entity` | Ver información de la entidad seleccionada |

Ejemplo:
```
/summon common.entity.wild.aggressive.cave_troll
/give_item common.items.weapons.sword.iron_sword 1
```

---

## rtsim — Simulación del mundo

| Comando | Descripción |
|---------|-------------|
| `/site list` | Listar todos los sitios del mundo |
| `/site <id>` | Ver estado de un sitio |
| `/npc list` | Listar NPCs persistentes cercanos |
| `/npc <id> status` | Estado completo de un NPC rtsim |
| `/faction list` | Listar facciones y territorios |
| `/faction <id>` | Ver estado de una facción |

---

## ORACLE

| Comando | Descripción |
|---------|-------------|
| `/oracle status` | Estado actual del director del mundo |
| `/oracle pause` | Pausar la generación de eventos |
| `/oracle resume` | Reanudar la generación de eventos |
| `/oracle event <tipo>` | Forzar un evento manualmente |
| `/oracle arc list` | Ver arcos narrativos activos |
| `/oracle arc <id>` | Ver detalle de un arco narrativo |
| `/oracle arc advance <id>` | Avanzar un arco a la siguiente fase |

---

## AURORA

| Comando | Descripción |
|---------|-------------|
| `/aurora npc <id> status` | Ver la mente actual de un NPC |
| `/aurora npc <id> memory` | Ver los recuerdos del NPC |
| `/aurora npc <id> relationships` | Ver la red social del NPC |
| `/aurora npc <id> force_action <acción>` | Forzar una acción específica |

---

## Servidor

| Comando | Descripción |
|---------|-------------|
| `/version` | Ver la versión del servidor |
| `/adminify <jugador>` | Dar permisos de admin temporales |
| `/server_info` | Información del servidor (jugadores, uptime, memoria) |
| `/shutdown <segundos>` | Programar apagado del servidor con aviso |

---

## Permisos

Los comandos están clasificados por nivel de permiso. En un servidor de producción, solo los admins registrados pueden ejecutarlos. Para configurar admins, editá el archivo de configuración del servidor:

```toml
# server_settings.ron
admins: ["nombre_jugador_1", "nombre_jugador_2"],
```

Los comandos de ORACLE y AURORA requieren nivel de permiso `Admin` o superior.
