---
sidebar_position: 6
---

# Admin commands

Reference for the server's administrator commands. They're executed from the game chat with the `/` prefix, or from the server console.

To use admin commands, your account needs admin permissions on the server. On a local server, all players have admin permissions by default.

---

## Players

| Command | Description |
|---------|-------------|
| `/give_item <asset_id> [amount]` | Give an item to the current player |
| `/give_item_npc <asset_id> [amount]` | Give an item to the target NPC |
| `/tp <player>` | Teleport to the target player |
| `/goto <x> <y> <z>` | Teleport to coordinates |
| `/kill` | Kill the current player |
| `/respawn` | Respawn the current player |
| `/kill_npcs` | Kill all NPCs in the area |
| `/players` | List connected players |
| `/ban <player> <reason>` | Ban a player |
| `/unban <player>` | Unban a player |
| `/kick <player> <reason>` | Kick a player |

---

## World and time

| Command | Description |
|---------|-------------|
| `/time` | View the current world time |
| `/time set <value>` | Change the time (`noon`, `midnight`, `dawn`, `dusk`, or a number 0.0–1.0) |
| `/weather <type>` | Change the weather (`clear`, `rain`, `snow`, `storm`) |
| `/lightning` | Summon a lightning strike at the current position |

---

## Entities and spawns

| Command | Description |
|---------|-------------|
| `/summon <asset_id>` | Spawn an entity at the current position |
| `/make_npc <asset_id> [amount]` | Spawn N NPCs |
| `/entity` | View information about the selected entity |

Example:
```
/summon common.entity.wild.aggressive.cave_troll
/give_item common.items.weapons.sword.iron_sword 1
```

---

## rtsim — World simulation

| Command | Description |
|---------|-------------|
| `/site list` | List all sites in the world |
| `/site <id>` | View the state of a site |
| `/npc list` | List nearby persistent NPCs |
| `/npc <id> status` | Full state of an rtsim NPC |
| `/faction list` | List factions and territories |
| `/faction <id>` | View the state of a faction |

---

## ORACLE

| Command | Description |
|---------|-------------|
| `/oracle status` | Current state of the world director |
| `/oracle pause` | Pause event generation |
| `/oracle resume` | Resume event generation |
| `/oracle event <type>` | Force an event manually |
| `/oracle arc list` | View active narrative arcs |
| `/oracle arc <id>` | View details of a narrative arc |
| `/oracle arc advance <id>` | Advance an arc to the next phase |

---

## AURORA

| Command | Description |
|---------|-------------|
| `/aurora npc <id> status` | View an NPC's current mind |
| `/aurora npc <id> memory` | View the NPC's memories |
| `/aurora npc <id> relationships` | View the NPC's social network |
| `/aurora npc <id> force_action <action>` | Force a specific action |

---

## Server

| Command | Description |
|---------|-------------|
| `/version` | View the server version |
| `/adminify <player>` | Grant temporary admin permissions |
| `/server_info` | Server information (players, uptime, memory) |
| `/shutdown <seconds>` | Schedule a server shutdown with a warning |

---

## Permissions

Commands are classified by permission level. On a production server, only registered admins can execute them. To configure admins, edit the server configuration file:

```toml
# server_settings.ron
admins: ["player_name_1", "player_name_2"],
```

ORACLE and AURORA commands require `Admin` permission level or higher.
