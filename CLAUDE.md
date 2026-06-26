# Xindeler Documentation — CLAUDE.md

## Commands

```bash
npm start            # dev server at http://localhost:3000
npm run build        # production build → build/
npm run serve        # serve the built files locally
npm run write-translations -- --locale es  # generate i18n strings for ES
```

No test suite. Build success = valid. Run `npm run build` before opening a PR.

---

## Project Context

**Xindeler** is an open-source fantasy MMORPG built in Rust.

This repo (`Matute289/xindeler-documentation`) is the **technical documentation portal** — for developers, contributors, designers, and DevOps. Live at: `docs.xindeler.greenmountain.dev`.

### Related repos

| Repo | Visibility | Purpose |
|------|-----------|---------|
| `Matute289/xindeler-design` | **Private** | Source of truth for all lore, game design specs, ORACLE/AURORA specs |
| `Matute289/xindeler-web-landing` | Public | Landing page (`xindeler.greenmountain.dev`) |
| `Matute289/xindeler-wiki` | Public | Player wiki (`wiki.xindeler.greenmountain.dev`) |
| `Matute289/xindeler` | Public | Game engine |
| `Matute289/xindeler-documentation` | Public | This repo — technical docs portal |

**ORACLE and AURORA specs live in `xindeler-design`.** Before writing docs for those systems, read:
- `xindeler-design/systems/oracle/` (~80 KB spec)
- `xindeler-design/systems/aurora/` (~60 KB spec)

---

## Stack

**Docusaurus v3** (React + MDX) — chosen over VitePress because:
- React ecosystem (consistent with the landing page)
- Native versioning support for future game versions (alpha, beta)
- MDX: React components inside docs (future: interactive diagrams)
- Native i18n (ES + EN from the start)
- Algolia DocSearch available free for open source

### Key files

| File | Purpose |
|------|---------|
| `docusaurus.config.ts` | Site config: url, i18n, navbar, footer, prism languages |
| `sidebars.ts` | 5 sidebar definitions: project, systems, oracle, aurora, contribucion |
| `src/css/custom.css` | Dark Xindeler theme: `#06060f` bg, `#d4a017` gold, Cinzel headings |
| `docs/` | All documentation source files (Markdown/MDX) |
| `.github/workflows/pr-check.yml` | CI: build on PR (job: `validate`) |
| `.github/workflows/deploy.yml` | CD: build + rsync to VPS on push to main |
| `.backlog/backlog.md` | Task tracking (sprints 1–6) |

---

## Branch Workflow

Same as the other Xindeler repos:
- `main` is protected — no direct pushes (branch protection rule in GitHub)
- All changes go through PRs (`feat/...`, `fix/...`, `chore/...`, `docs/...`)
- PRs require 1 approval before merging
- CI: `pr-check.yml` must pass (job: `validate`)
- CD: `deploy.yml` rsync to VPS on merge to main

**Convention (learned from practice):** When working on a batch of related content, do everything on a single branch with incremental commits, then open one PR. Multiple branches for related work causes rebase conflicts as PRs merge into main.

---

## Theme / Design System

The documentation theme matches the landing page and wiki:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#06060f` | Page background |
| Surface | `#0d0d1f` | Sidebar, cards |
| Gold accent | `#d4a017` | Links, headings, borders |
| Text | `#e8e0d0` | Body text |
| Heading font | Cinzel (serif) | All H1–H6 |
| Body font | Georgia (serif) | Body text |

**Badges (CSS classes):**
- `.badge-completed` — green pill, "implemented in the game"
- `.badge-wip` — gold pill, "work in progress"
- `.badge-planned` — purple pill, "planned, not yet started"

Use these in tables to show which features are implemented. Example:
```html
<span class="badge-completed">Implementado</span>
<span class="badge-wip">En progreso</span>
<span class="badge-planned">Planeado</span>
```

---

## Content Structure

All docs source files are under `docs/`. The full tree:

```
docs/
├── intro.md                   → Homepage (slug: /)
│
├── proyecto/                  → Project overview (sidebar: projectSidebar)
│   ├── intro.md
│   ├── arquitectura.md        → Rust workspace, ECS, data flow diagram
│   ├── tecnologias.md         → Rust nightly, wgpu, Quinn, RON, MessagePack
│   ├── instalacion-local.md   → Clone, cargo build, run server+client
│   ├── estructura-de-archivos.md → Crate map
│   └── persistencia.md        → MessagePack data.dat, JSONL chronicle
│
├── cliente/                   → voxygen client
│   ├── arquitectura.md
│   ├── renderizado.md         → wgpu pipeline, voxel chunks, LOD
│   ├── ui.md                  → egui/conrod, HUD, inventory
│   └── audio.md
│
├── servidor/                  → Server process (MONOLITHIC — not microservices)
│   ├── arquitectura.md
│   ├── world-simulation.md    → rtsim: sites, factions, NPC long-running sim
│   ├── combat.md              → ECS combat systems
│   ├── economia.md
│   ├── persistencia.md
│   └── admin-commands.md
│
├── sistemas/                  → Game mechanics (sidebar: systemsSidebar)
│   ├── combate.md             → Poise, combos, buffs, backstab, parry
│   ├── magia.md               → MagicSource, escuelas, SpellDef, energy
│   ├── clases.md              → 4 active classes + 10 planned
│   ├── razas.md               → 6 playable races with passives
│   ├── crafting.md
│   ├── items.md
│   ├── inventario.md
│   └── habilidades.md
│
├── oracle/                    → ORACLE World Director (sidebar: oracleSidebar)
│   ├── intro.md               → What is ORACLE, its role
│   ├── arquitectura.md        → rtsim placement, modules, threading
│   ├── world-state.md         → WorldGraph, nodes, snapshot
│   ├── world-facts.md         → WorldFact enum, ORACLE↔AURORA contract
│   ├── event-engine.md        → Event lifecycle, classes, pacing
│   ├── narrative.md           → Arc templates, LLM layer, canon validation
│   ├── ecosystem.md           → Monster populations, Lotka-Volterra
│   ├── astronomy.md           → Seasons, moons, CelestialState
│   ├── llm-integration.md     → HTTP trait, llama.cpp, LLMProposer thread
│   ├── admin.md               → /oracle commands
│   └── anti-chaos.md          → Circuit breaker, kill-switch, auto-rollback
│
├── aurora/                    → AURORA NPC AI (sidebar: auroraSidebar)
│   ├── intro.md               → What is AURORA, relation to ORACLE
│   ├── npc-mind.md            → Mind struct: values, fears, alignment, mood, goals
│   ├── memoria.md             → STM, LTM episodic, LTM semantic, salience
│   ├── social-graph.md        → EdgeKind, ego-centric queries
│   ├── life-simulation.md     → Birth, aging, death, family, heritage
│   ├── economia.md            → SiteEconomy, price_mult, merchant routes
│   ├── organizaciones.md      → Organization types, GOAP
│   ├── quest-generation.md    → Need detection, templates, anti-exploit
│   ├── llm-generative.md      → Tier 1 (baked) + Tier 2 (live LLM+TTS)
│   └── contratos.md           → ORACLE↔AURORA: WorldFact read-only contract
│
├── apis/                      → Protocols and APIs
│   ├── game-protocol.md       → Binary game protocol (NOT REST), Quinn/QUIC
│   ├── fastapi-web.md         → REST: /api/waitlist, /api/contribute, /api/status
│   ├── admin-commands.md      → Full admin command reference
│   └── telemetria.md          → TelemetryLayer JSONL, BoundedWriter
│
├── contribucion/              → Contribution guides (sidebar: contributeSidebar)
│   ├── como-empezar.md        → Fork, clone, first PR
│   ├── git-flow.md            → Branching strategy
│   ├── code-style.md          → rustfmt, clippy, naming conventions
│   ├── testing.md             → cargo test, integration tests
│   ├── agregar-npc.md         → Step-by-step: RON file, entity, behavior
│   ├── agregar-hechizo.md     → SpellDef, CharacterAbility, balance
│   ├── agregar-item.md        → Item RON, recipe, loot tables
│   └── agregar-criatura.md    → Entity file, abilities, spawn rules
│
└── referencia/                → Reference
    ├── asset-formats.md       → RON, TOML, item/ability file formats
    ├── ecs-components.md      → Common ECS components
    └── glosario.md            → Glossary
```

---

## Critical Architecture Notes

These must be reflected accurately in the docs — they correct common misconceptions:

### 1. The server is MONOLITHIC
The server is **one Rust process**, not microservices. There is no Login Server, Chat Server, World Server, or Combat Server as separate processes. They are functional subsystems within the single server binary. Document them as subsystems, not services.

### 2. No relational database
- Game persistence: **MessagePack single-file** (`rtsim/data.dat`)
- Event archival: **JSONL** rotated by size
- Waitlist/Contributors: **CSV files** on the VPS (web only, not game data)
- A seam to RocksDB/SQLite/PostgreSQL is designed but not v1

### 3. No REST API or WebSocket for the game
- Game communication: **binary protocol** over TCP/QUIC (Quinn library)
- The only REST API is FastAPI (port 8010): waitlist, contributors, status
- ORACLE/AURORA are controlled via server chat admin commands
- No WebSocket; real-time communication is via the binary game protocol

### 4. ORACLE and AURORA are the most complex systems
- Both run as extensions of `rtsim` within the server process
- Their full specs (~80 KB and ~60 KB respectively) are in `xindeler-design` (private repo)
- Read the design specs before writing docs for these systems

---

## VPS / Deploy

- **Server:** `ssh -i ~/.ssh/id_ed25519 mgrinberg@216.238.126.97`
- **Deploy path:** `/srv/xindeler/docs/public`
- **Subdomain:** `docs.xindeler.greenmountain.dev` (live — certbot configured)
- **Reference:** See `xindeler-web-landing/deploy.yml` and the wiki deploy for the rsync pattern

### GitHub Secrets needed
| Secret | Source |
|--------|--------|
| `VPS_HOST` | Already in Matute289 GitHub org |
| `VPS_USER` | mgrinberg |
| `VPS_SSH_KEY` | Same key as xindeler-web-landing uses |
| `VPS_DEPLOY_PATH` | `/srv/xindeler/docs/public` |

---

## Backlog Status (as of June 2026)

| Sprint | Task | Estado |
|--------|------|--------|
| 1 | 001 Setup Docusaurus + tema | `[x]` Completo |
| 1 | 002 GitHub Actions CI/CD | `[x]` Completo |
| 1 | 003 VPS nginx config + certbot | `[x]` Completo |
| 1 | 004 i18n ES + EN | `[x]` Completo |
| 2 | 005 instalacion-local.md | `[x]` Completo |
| 2 | 006 arquitectura.md | `[x]` Completo |
| 2 | 007 contribucion esencial | `[x]` Completo |
| 3 | 008–009 Sistemas de juego (combate, magia, clases) | `[ ]` Pendiente — defer |
| 3 | 010 contribucion guías (agregar-npc/hechizo/item/criatura) | `[x]` Completo |
| 4 | 011 oracle/intro | `[x]` Completo |
| 4 | 012–013 ORACLE profundo | `[ ]` Pendiente — defer hasta spec final |
| 5 | 014 aurora/intro | `[x]` Completo |
| 5 | 015–016 AURORA profundo | `[ ]` Pendiente — defer hasta spec final |
| 6 | 017 Cliente (voxygen, render, UI, audio) | `[ ]` Pendiente — defer |
| 6 | 018 Servidor (world-sim, admin-commands, arquitectura) | `[x]` Completo |
| 6 | 019 APIs (game-protocol) | `[x]` Completo |
| 6 | 020 Referencia (asset-formats, ecs-components, glosario) | `[x]` Completo |

**Extra completado (fuera de backlog original):**
- Homepage reescrita con tabla de navegación, quick start, links a repos
- proyecto/tecnologias.md, proyecto/estructura-de-archivos.md, proyecto/persistencia.md
- servidor/persistencia.md
- TRANSLATING.md — guía de workflow de traducción
- Eliminadas todas las referencias públicas a "Veloren" en docs/

Full detail in `.backlog/backlog.md` and `.backlog/tasks/`.

---

## Landing Page Integration

`docs.xindeler.greenmountain.dev` is live. When Matías confirms it's working correctly, add a link in `xindeler-web-landing` → `src/components/CommunitySection.jsx` (where the Discord, Wiki, and other community links live).
