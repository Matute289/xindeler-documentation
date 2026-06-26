# Xindeler Documentation — Backlog

## Leyenda de estados
- `[ ]` Pendiente
- `[~]` En progreso
- `[x]` Completo
- `[-]` Diferido (con justificación)

## Sprint 1 — Infraestructura

| # | Tarea | Archivo spec | Estado |
|---|-------|--------------|--------|
| 001 | Setup Docusaurus v3 + tema Xindeler dark | [001-setup.md](tasks/001-setup.md) | `[x]` |
| 002 | GitHub Actions CI/CD (build + rsync VPS) | [002-cicd.md](tasks/002-cicd.md) | `[x]` |
| 003 | VPS nginx config + certbot para docs.xindeler.greenmountain.dev | [003-nginx.md](tasks/003-nginx.md) | `[x]` — deploy activo en `/srv/xindeler/docs/public` |
| 004 | i18n ES + EN con Docusaurus native i18n | [004-i18n.md](tasks/004-i18n.md) | `[x]` — UI strings + EN homepage + TRANSLATING.md |

## Sprint 2 — Contenido esencial para contributors

| # | Tarea | Archivo spec | Estado |
|---|-------|--------------|--------|
| 005 | proyecto/instalacion-local.md — compilar y levantar el juego | [005-instalacion-local.md](tasks/005-instalacion-local.md) | `[x]` |
| 006 | proyecto/arquitectura.md — mapa del workspace Rust | [006-arquitectura-proyecto.md](tasks/006-arquitectura-proyecto.md) | `[x]` — también: tecnologias.md, estructura-de-archivos.md, persistencia.md |
| 007 | contribucion/ — como-empezar, git-flow, code-style | [007-contribucion-esencial.md](tasks/007-contribucion-esencial.md) | `[x]` |

## Sprint 3 — Sistemas de juego

| # | Tarea | Archivo spec | Estado |
|---|-------|--------------|--------|
| 008 | sistemas/combate.md + sistemas/magia.md | [008-sistemas-combate-magia.md](tasks/008-sistemas-combate-magia.md) | `[-]` Diferido — evitar exponer mecánicas no finalizadas |
| 009 | sistemas/clases.md + sistemas/crafting.md + sistemas/items.md | [009-sistemas-clases-crafting.md](tasks/009-sistemas-clases-crafting.md) | `[-]` Diferido — ídem |
| 010 | contribucion/agregar-npc + agregar-hechizo + agregar-item + agregar-criatura | [010-contribucion-guias.md](tasks/010-contribucion-guias.md) | `[x]` |

## Sprint 4 — ORACLE

| # | Tarea | Archivo spec | Estado |
|---|-------|--------------|--------|
| 011 | oracle/intro | [011-oracle-core.md](tasks/011-oracle-core.md) | `[x]` — intro de alto nivel |
| 012 | oracle/arquitectura + oracle/world-state + oracle/event-engine | [012-oracle-engine.md](tasks/012-oracle-engine.md) | `[-]` Diferido — hasta que el spec ORACLE en xindeler-design esté estabilizado |
| 013 | oracle/narrative + oracle/llm-integration + oracle/anti-chaos | [013-oracle-llm.md](tasks/013-oracle-llm.md) | `[-]` Diferido — ídem |

## Sprint 5 — AURORA

| # | Tarea | Archivo spec | Estado |
|---|-------|--------------|--------|
| 014 | aurora/intro | [014-aurora-core.md](tasks/014-aurora-core.md) | `[x]` — intro de alto nivel |
| 015 | aurora/npc-mind + aurora/memoria + aurora/social-graph | [015-aurora-social.md](tasks/015-aurora-social.md) | `[-]` Diferido — hasta que el spec AURORA en xindeler-design esté estabilizado |
| 016 | aurora/quest-generation + aurora/contratos | [016-aurora-quests.md](tasks/016-aurora-quests.md) | `[-]` Diferido — ídem |

## Sprint 6 — Referencia completa

| # | Tarea | Archivo spec | Estado |
|---|-------|--------------|--------|
| 017 | Cliente: voxygen, render, UI, audio | [017-cliente.md](tasks/017-cliente.md) | `[-]` Diferido — baja prioridad para contributors iniciales |
| 018 | Servidor: world-simulation, admin-commands, arquitectura | [018-servidor.md](tasks/018-servidor.md) | `[x]` — arquitectura + world-simulation + admin-commands completos |
| 019 | APIs: game-protocol, fastapi-web, telemetría | [019-apis.md](tasks/019-apis.md) | `[x]` — game-protocol completo. fastapi-web y telemetría pendientes de baja prioridad |
| 020 | Referencia: asset-formats, ecs-components, glosario | [020-referencia.md](tasks/020-referencia.md) | `[x]` |

## Pendiente (sin sprint asignado)

| # | Tarea | Estado |
|---|-------|--------|
| P01 | Búsqueda: Algolia DocSearch (free for open source) | `[ ]` |
| P02 | Link a docs en la landing page (`xindeler-web-landing/src/components/CommunitySection.jsx`) | `[ ]` — esperar confirmación de que el sitio está estable |
| P03 | EN translations de todas las páginas de contenido (hoy solo intro.md tiene traducción EN) | `[ ]` — español-first funciona como fallback |
| P04 | servidor/combat.md, servidor/economia.md | `[ ]` — cuando el sistema sea final |
| P05 | apis/fastapi-web.md, apis/telemetria.md | `[ ]` — baja prioridad |
