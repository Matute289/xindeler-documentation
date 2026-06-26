# 014 — AURORA core: intro + npc-mind + memoria

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 5

## Fuente
Los specs de AURORA están en `Matute289/xindeler-design` (repo privado).
Antes de escribir estos docs, leer:
- `xindeler-design/systems/aurora/` (spec completo ~60 KB)

## aurora/intro.md
- Qué es AURORA: la simulación social de NPCs
- Relación con ORACLE: AURORA reacciona a WorldFacts publicados por ORACLE
- Por qué existe: NPCs con memoria, relaciones y motivaciones, no solo patrones de comportamiento
- Corre en rtsim, mismo proceso que el server

## aurora/npc-mind.md
El struct `Mind` de cada NPC simulado:
- `values` — qué le importa al NPC (poder, familia, conocimiento, etc.) con pesos
- `fears` — miedos y traumas
- `alignment` — moral compass en un espacio 2D (no D&D binario)
- `mood` — estado emocional actual (afecta diálogos y decisiones)
- `goals` — lista priorizada de objetivos actuales (GOAP-style)

## aurora/memoria.md
Tres capas de memoria:
- **STM** (Short-Term Memory) — eventos recientes, alta salience, se degrada rápido
- **LTM episódica** — eventos importantes recordados con timestamp y contexto
- **LTM semántica** — conocimiento factual sobre el mundo (precios, rutas, facciones)

Salience function: qué hace que un recuerdo persista vs. se olvide.
Forgetting: degradación por tiempo, espacio, relevancia.
