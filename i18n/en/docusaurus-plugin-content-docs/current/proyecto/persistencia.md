---
sidebar_position: 6
---

# Persistence

How Xindeler saves world and player state. There is no relational database — the game uses direct binary files.

---

## `rtsim/data.dat` — World state

The main persistence file. Contains all the world state simulated by `rtsim`:

- Position, inventory, relationships, and memory of every persistent NPC
- Faction state and their relationships
- Site state (cities, dungeons)
- ORACLE variables (active narrative arcs, ecosystem state)
- Time and astronomy state

**Format:** [MessagePack](https://msgpack.org/) — compact binary, serialized with `rmp-serde`.

**When it's written:** The server serializes `data.dat` periodically (every N minutes) and always on a clean shutdown. If the server is killed with `kill -9`, changes since the last save are lost.

**Location:** In the server's working directory on startup, or at the configured path.

```
xindeler-server
└── rtsim/
    └── data.dat     (~MB to GB depending on world size)
```

### Migrations

If the `data.dat` format changes between versions, the server tries to migrate the file automatically on startup. If the migration fails, the server starts with a new world and moves the corrupted file to `data.dat.bak`.

---

## `chronicle/` — Event log

Historical record of world events. JSONL (one JSON line per event), automatically rotated when the file reaches a maximum size.

Each line is a serialized event:

```json
{"ts":1750000000,"kind":"FactionConquest","faction":"Bandits","site":"Ironholm","prev_owner":"Merchants"}
{"ts":1750000120,"kind":"NpcDeath","npc_id":4821,"cause":"PlayerKill","player":"Aerindel"}
{"ts":1750000300,"kind":"OracleArcAdvance","arc":"BanditRise","phase":3}
```

**Use:** ORACLE reads the chronicle to build historical context. Also useful for debugging and for generating server statistics.

**Location:**
```
chronicle/
├── events-2026-06-01.jsonl
├── events-2026-06-15.jsonl
└── events-current.jsonl     ← active file
```

---

## Player state

Each player's state (inventory, position, stats, experience) is stored as part of the corresponding rtsim NPC state — not in a separate per-player file.

When a player disconnects, their state is serialized into `data.dat` on the next save cycle. When they reconnect, it's loaded from there.

---

## Web (waitlist and contributors)

The FastAPI process maintains two CSV files on the VPS:

| File | Content |
|---------|-----------|
| `waitlist.csv` | Emails registered on the waitlist |
| `contributors.csv` | Contributor form submissions |

These have no relation to the game state — they're independent web data.

---

## There is no relational database

This is an explicit design decision for v1:

| Option | Status |
|--------|--------|
| MessagePack (`data.dat`) | ✅ In use |
| JSONL (chronicle) | ✅ In use |
| CSV (web) | ✅ In use |
| RocksDB / SQLite / PostgreSQL | Designed as a future seam, not implemented in v1 |

The advantage of MessagePack + JSONL is operational simplicity: there's no database process to maintain, no SQL migrations, no connections to configure. The server is a binary that runs and saves files.

The disadvantage is that complex queries over historical state are difficult. If that becomes necessary, the seam to RocksDB or SQLite is designed but not implemented.

---

## Backups

To back up the entire world, it's enough to copy:

```bash
cp rtsim/data.dat backups/data-$(date +%Y%m%d).dat
cp -r chronicle/ backups/chronicle-$(date +%Y%m%d)/
```

No database snapshot or SQL dump is needed.
