---
sidebar_position: 6
---

# Persistencia

Cómo Xindeler guarda el estado del mundo y de los jugadores. No hay base de datos relacional — el juego usa archivos binarios directos.

---

## `rtsim/data.dat` — Estado del mundo

El archivo principal de persistencia. Contiene todo el estado del mundo simulado por `rtsim`:

- Posición, inventario, relaciones y memoria de todos los NPCs persistentes
- Estado de facciones y sus relaciones
- Estado de sitios (ciudades, dungeons)
- Variables de ORACLE (arcos narrativos activos, estado del ecosistema)
- Estado de tiempo y astronomía

**Formato:** [MessagePack](https://msgpack.org/) — binario compacto, serializado con `rmp-serde`.

**Cuándo se escribe:** El servidor serializa `data.dat` periódicamente (cada N minutos) y siempre al apagar limpiamente. Si el servidor se mata con `kill -9`, los cambios desde el último guardado se pierden.

**Ubicación:** En el directorio de trabajo del servidor al arrancarlo, o en la ruta configurada.

```
xindeler-server
└── rtsim/
    └── data.dat     (~MB a GB según el tamaño del mundo)
```

### Migraciones

Si el formato de `data.dat` cambia entre versiones, el servidor intenta migrar el archivo automáticamente al arrancar. Si la migración falla, el servidor arranca con un mundo nuevo y mueve el archivo corrupto a `data.dat.bak`.

---

## `chronicle/` — Log de eventos

Registro histórico de eventos del mundo. JSONL (una línea JSON por evento), rotado automáticamente cuando el archivo alcanza un tamaño máximo.

Cada línea es un evento serializado:

```json
{"ts":1750000000,"kind":"FactionConquest","faction":"Bandits","site":"Ironholm","prev_owner":"Merchants"}
{"ts":1750000120,"kind":"NpcDeath","npc_id":4821,"cause":"PlayerKill","player":"Aerindel"}
{"ts":1750000300,"kind":"OracleArcAdvance","arc":"BanditRise","phase":3}
```

**Uso:** ORACLE lee el chronicle para construir contexto histórico. También útil para debugging y para generar estadísticas del servidor.

**Ubicación:**
```
chronicle/
├── events-2026-06-01.jsonl
├── events-2026-06-15.jsonl
└── events-current.jsonl     ← archivo activo
```

---

## Estado de jugadores

El estado de cada jugador (inventario, posición, stats, experiencia) se almacena como parte del estado del NPC rtsim correspondiente — no en un archivo separado por jugador.

Cuando un jugador se desconecta, su estado se serializa en `data.dat` en el próximo ciclo de guardado. Cuando vuelve a conectarse, se carga desde ahí.

---

## Web (lista de espera y contributors)

El proceso FastAPI mantiene dos archivos CSV en el VPS:

| Archivo | Contenido |
|---------|-----------|
| `waitlist.csv` | Emails registrados en la lista de espera |
| `contributors.csv` | Formularios de contribuidores |

Estos no tienen relación con el estado del juego — son datos web independientes.

---

## No hay base de datos relacional

Esta es una decisión de diseño explícita para v1:

| Opción | Estado |
|--------|--------|
| MessagePack (`data.dat`) | ✅ En uso |
| JSONL (chronicle) | ✅ En uso |
| CSV (web) | ✅ En uso |
| RocksDB / SQLite / PostgreSQL | Diseñado como seam futuro, no implementado en v1 |

La ventaja de MessagePack + JSONL es la simplicidad operacional: no hay proceso de base de datos que mantener, no hay migraciones SQL, no hay conexiones que configurar. El servidor es un binario que corre y guarda archivos.

La desventaja es que queries complejas sobre el estado histórico son difíciles. Si eso se vuelve necesario, el seam a RocksDB o SQLite está diseñado pero no implementado.

---

## Backups

Para hacer backup del mundo completo, alcanza con copiar:

```bash
cp rtsim/data.dat backups/data-$(date +%Y%m%d).dat
cp -r chronicle/ backups/chronicle-$(date +%Y%m%d)/
```

No se necesita snapshot de base de datos ni dump SQL.
