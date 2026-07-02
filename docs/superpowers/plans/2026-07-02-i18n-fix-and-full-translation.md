# i18n Fix + Full English Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the English locale actually complete and trustworthy — fix the stale/broken EN homepage, translate all remaining Spanish content to English, replace the default Docusaurus locale dropdown with a custom flag+mate switcher matching `xindeler-web-landing`, and add a CI guard so this can't silently regress again.

**Architecture:** Docusaurus v3 native i18n (`defaultLocale: 'es'`, locales `['es','en']`). Two content layers: (1) UI strings in `i18n/en/docusaurus-theme-classic/*.json` and `i18n/en/docusaurus-plugin-content-docs/current.json` — already fully translated, no changes needed; (2) page content in `i18n/en/docusaurus-plugin-content-docs/current/**` mirroring `docs/**` — currently only 1 of 61 files exists there, and it's a stale stub. When an EN content file is missing, Docusaurus **silently falls back to the Spanish source** at build time (confirmed by inspecting the production build output) — this is why the site shows a mix of languages instead of erroring.

**Tech Stack:** Docusaurus v3.10.1 i18n, Markdown/MDX, React (theme swizzle), Node (CI guard script), GitHub Actions.

## Global Constraints

- `defaultLocale: 'es'` — `docs/**` is the Spanish baseline; `i18n/en/docusaurus-plugin-content-docs/current/**` mirrors it path-for-path.
- Preserve every frontmatter field format exactly (`sidebar_position` stays a number; `title`/`description` get translated when present).
- Never translate content inside fenced code blocks (```` ``` ````) — file paths, shell commands, Rust/RON/TOML snippets, and ASCII diagrams stay verbatim.
- Never translate internal doc links (`[text](/proyecto/intro)`) — the path is shared across locales; only the link *text* is translated.
- Keep these terms untranslated everywhere (canonical per `docs/referencia/glosario.md`): `ORACLE`, `AURORA`, `ECS`, `rtsim`, `RON`, `MessagePack`, `Quinn`, `QUIC`, `Voxygen`, `WorldFact`, `SkillSet`, `LootSpec`, `Poise`, `Chronicle`, `Body`, `Buff`, `Chunk`, `Site`, `Asset ID`, `Component`, `Entity`, `System`, `Cargo workspace`.
- Match the section-title terminology already established in `i18n/en/docusaurus-plugin-content-docs/current.json` / `navbar.json`: Proyecto→Project, Sistemas→Systems, Servidor→Server, Cliente→Client, Contribución→Contribution/Contribute, Referencia→Reference, APIs y Protocolos→APIs & Protocols.
- Translate badge text used in tables (`<span class="badge-completed">Implementado</span>` etc.) to English (`Implemented`, `In progress`, `Planned`) — see CLAUDE.md badge convention.
- `npm run build` must succeed (both `es` and `en` builds, no MDX errors) before every commit.
- One branch for this whole batch of work, incremental commits, single PR at the end (per this repo's established convention — see `CLAUDE.md`).
- Do not touch `i18n/en/code.json` (gitignored, Docusaurus-generated, already correct).

---

## Diagnosis summary (context for every task below)

Verified by running a real production build (`npm run build` + inspecting `build/en/**`) and by checking the live site (`docs.xindeler.greenmountain.dev` → redirects 301 to `docs.xindeler.com`, which is up and serving the same broken state):

1. **61 total doc files.** Only `docs/intro.md` (homepage) has an EN counterpart, and that counterpart (`i18n/en/docusaurus-plugin-content-docs/current/intro.md`) is a **leftover 2-line stub** ("Welcome to Xindeler Docs" / "Documentation under construction") written before the homepage was rewritten with its nav table and quick-start. Live EN homepage currently shows this stub instead of the real page.
2. **39 of the remaining 60 files are themselves still Spanish 7-line placeholder stubs** (`*Documentación en construcción.*`) — `sistemas/*` (8), `cliente/*` (4), most of `oracle/*` (10 of 11), most of `aurora/*` (9 of 10), `proyecto/intro.md`, 3 of `servidor/*`, 3 of `apis/*`, `contribucion/testing.md`. These are cheap to translate (title + one italic sentence).
3. **21 files have real, substantial Spanish content** (102–224 lines each, ~300 KB total) that needs a genuine translation pass.
4. When an EN file is missing, Docusaurus's production build **falls back to the Spanish file content** under the `/en/` route rather than 404ing — confirmed identical page counts in `build/` vs `build/en/` (61 each) and Spanish body text appearing on `/en/proyecto/arquitectura`. This fallback is intentional per `TRANSLATING.md`, but with 59/61 pages falling back it reads as "the site is broken," not "partial translation."
5. **The "switching to English takes me to another page" symptom is a local dev-server artifact**: `docusaurus start` (what `npm start` runs) only serves **one locale at a time** (the default, `es`). Visiting `/en/...` paths against a plain `npm start` dev server 404s for every route, including the homepage — this is different from production, where `docusaurus build` compiles all locales and the fallback described above kicks in instead. Task 6 documents the correct way to preview EN locally (`npm start -- --locale en`, or `npm run build && npm run serve`) so this doesn't cause confusion again.
6. The locale dropdown itself is the **stock Docusaurus `NavbarItem/LocaleDropdownNavbarItem`** — plain text labels, no flags, no icon. `xindeler-web-landing`'s `src/components/LanguageSwitcher.jsx` has the target look: flag emoji + code button (🇦🇷/🇺🇸), dropdown with flag + label per option, and a 🧉 mate emoji marking the currently active language.

---

## Task 1: Fix the stale English homepage translation

**Files:**
- Modify: `i18n/en/docusaurus-plugin-content-docs/current/intro.md`

**Interfaces:**
- Consumes: `docs/intro.md` (current real ES homepage, 73 lines)
- Produces: `/en/` shows the real translated homepage instead of the "under construction" stub

- [ ] **Step 1: Confirm the current stub is stale**

```bash
cat i18n/en/docusaurus-plugin-content-docs/current/intro.md
```

Expected output (the file to be replaced):
```markdown
---
sidebar_position: 1
slug: /
---

# Welcome to Xindeler Docs

*Documentation under construction.*
```

- [ ] **Step 2: Replace it with a full translation of `docs/intro.md`**

Overwrite `i18n/en/docusaurus-plugin-content-docs/current/intro.md` with:

```markdown
---
sidebar_position: 1
slug: /
---

# Xindeler Docs

**Xindeler** is an open-source fantasy MMORPG built in Rust. This is the technical documentation — for developers, contributors, and designers who want to understand or contribute to the project.

---

## What's in here?

| Section | Who it's for |
|---------|-----------|
| [**Project**](/proyecto/intro) | Architecture, tech stack, local setup |
| [**Contribution**](/contribucion/como-empezar) | How to make your first PR, guides for adding NPCs, items, and spells |
| [**Game systems**](/sistemas/combate) | Combat, magic, classes, crafting |
| [**ORACLE**](/oracle/intro) | The world director — procedural narrative and ecosystem simulation |
| [**AURORA**](/aurora/intro) | NPC AI — minds with memory, social relationships, and generative dialogue |
| [**Reference**](/referencia/glosario) | Glossary, ECS components, asset formats |

---

## Quick start

Want to contribute? The shortest path:

```bash
git clone https://github.com/Matute289/xindeler
cd xindeler
cargo build
cargo run --bin xindeler-server   # in one terminal
cargo run --bin voxygen            # in another terminal
```

Full guide: [Local Setup](/proyecto/instalacion-local)

---

## The stack in one line

**Rust nightly** · ECS with `specs` · QUIC via Quinn · wgpu for rendering · RON for assets · MessagePack for persistence

---

## What makes Xindeler different

### ORACLE — World director

There are no content designers manually scripting events. ORACLE is an AI system that runs inside the server and directs the world: it generates narrative arcs, controls the creature ecosystem, and manages weather and faction relationships. Every Xindeler server develops its own history.

### AURORA — NPCs with minds

Xindeler's NPCs don't follow fixed scripts. Each one has a mind with its own values, fears, episodic memory of its interactions, and a network of social relationships. A merchant remembers that you robbed them. A guard has loyalties. An old woman tells you something she saw weeks ago. With the optional LLM module, dialogue is generative.

---

## Project repos

| Repo | Description |
|------|-------------|
| [`Matute289/xindeler`](https://github.com/Matute289/xindeler) | Game engine |
| [`Matute289/xindeler-documentation`](https://github.com/Matute289/xindeler-documentation) | This site |
| [`Matute289/xindeler-wiki`](https://github.com/Matute289/xindeler-wiki) | Player wiki |

---

## Community

- **Website** — [xindeler.greenmountain.dev](https://xindeler.greenmountain.dev)
- **Discord** — [discord.gg/xindeler](https://discord.gg/xindeler)
- **Player wiki** — [wiki.xindeler.greenmountain.dev](https://wiki.xindeler.greenmountain.dev)
```

- [ ] **Step 3: Verify the EN homepage builds and renders correctly**

```bash
npm run build
grep -o 'Xindeler is an open-source fantasy MMORPG' build/en/index.html
```

Expected: build succeeds, and the grep finds a match (confirms the real translation is in the built output, not the stub).

- [ ] **Step 4: Commit**

```bash
git add i18n/en/docusaurus-plugin-content-docs/current/intro.md
git commit -m "fix: replace stale EN homepage stub with real translation"
```

---

## Task 2: Translate the 39 placeholder stub pages

**Objective:** Every page that's still `*Documentación en construcción.*` in Spanish gets an equally trivial EN counterpart, so EN visitors see "Documentation under construction" instead of Spanish fallback text. This closes the language gap for stub pages at near-zero cost.

**Files (create all 39, same pattern: translate `sidebar_position` frontmatter as-is, translate the H1 title, translate the italic line):**

- Create: `i18n/en/docusaurus-plugin-content-docs/current/proyecto/intro.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/cliente/arquitectura.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/cliente/renderizado.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/cliente/ui.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/cliente/audio.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/servidor/combat.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/servidor/economia.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/servidor/persistencia.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/apis/fastapi-web.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/apis/admin-commands.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/apis/telemetria.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/combate.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/magia.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/clases.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/razas.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/crafting.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/items.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/inventario.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/sistemas/habilidades.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/arquitectura.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/world-state.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/world-facts.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/event-engine.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/narrative.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/ecosystem.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/astronomy.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/llm-integration.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/admin.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/anti-chaos.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/npc-mind.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/memoria.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/social-graph.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/life-simulation.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/economia.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/organizaciones.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/quest-generation.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/llm-generative.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/contratos.md`
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/testing.md`

**Interfaces:**
- Consumes: the corresponding `docs/**/*.md` stub (same relative path, `sidebar_position` value, and title to translate)
- Produces: EN fallback gap closed for all 39 stub pages

- [ ] **Step 1: Read every source stub's `sidebar_position` and title**

```bash
for f in proyecto/intro cliente/arquitectura cliente/renderizado cliente/ui cliente/audio \
  servidor/combat servidor/economia servidor/persistencia \
  apis/fastapi-web apis/admin-commands apis/telemetria \
  sistemas/combate sistemas/magia sistemas/clases sistemas/razas sistemas/crafting sistemas/items sistemas/inventario sistemas/habilidades \
  oracle/arquitectura oracle/world-state oracle/world-facts oracle/event-engine oracle/narrative oracle/ecosystem oracle/astronomy oracle/llm-integration oracle/admin oracle/anti-chaos \
  aurora/npc-mind aurora/memoria aurora/social-graph aurora/life-simulation aurora/economia aurora/organizaciones aurora/quest-generation aurora/llm-generative aurora/contratos \
  contribucion/testing; do
  echo "=== docs/$f.md ==="; cat "docs/$f.md"
done
```

Expected: each prints `sidebar_position: N`, an H1 title in Spanish, and `*Documentación en construcción.*`.

- [ ] **Step 2: Create each EN file using this exact table of translations**

For each row, create the file at `i18n/en/docusaurus-plugin-content-docs/current/<path>.md` with:
```markdown
---
sidebar_position: <same N as ES source>
---

# <English title>

*Documentation under construction.*
```

Title translations (Spanish title → English title, path):
| Path | ES title | EN title |
|------|----------|----------|
| `proyecto/intro` | Introducción al Proyecto | Project Introduction |
| `cliente/arquitectura` | Arquitectura del Cliente | Client Architecture |
| `cliente/renderizado` | Renderizado | Rendering |
| `cliente/ui` | UI del Cliente | Client UI |
| `cliente/audio` | Audio | Audio |
| `servidor/combat` | Combate (Servidor) | Combat (Server) |
| `servidor/economia` | Economía (Servidor) | Economy (Server) |
| `servidor/persistencia` | Persistencia (Servidor) | Persistence (Server) |
| `apis/fastapi-web` | FastAPI Web | FastAPI Web |
| `apis/admin-commands` | Comandos de Admin | Admin Commands |
| `apis/telemetria` | Telemetría | Telemetry |
| `sistemas/combate` | Combate | Combat |
| `sistemas/magia` | Magia | Magic |
| `sistemas/clases` | Clases | Classes |
| `sistemas/razas` | Razas | Races |
| `sistemas/crafting` | Crafting | Crafting |
| `sistemas/items` | Ítems | Items |
| `sistemas/inventario` | Inventario | Inventory |
| `sistemas/habilidades` | Habilidades | Abilities |
| `oracle/arquitectura` | Arquitectura de ORACLE | ORACLE Architecture |
| `oracle/world-state` | Estado del Mundo | World State |
| `oracle/world-facts` | WorldFacts | WorldFacts |
| `oracle/event-engine` | Motor de Eventos | Event Engine |
| `oracle/narrative` | Narrativa | Narrative |
| `oracle/ecosystem` | Ecosistema | Ecosystem |
| `oracle/astronomy` | Astronomía | Astronomy |
| `oracle/llm-integration` | Integración LLM | LLM Integration |
| `oracle/admin` | Administración de ORACLE | ORACLE Admin |
| `oracle/anti-chaos` | Anti-Caos | Anti-Chaos |
| `aurora/npc-mind` | Mente del NPC | NPC Mind |
| `aurora/memoria` | Memoria | Memory |
| `aurora/social-graph` | Grafo Social | Social Graph |
| `aurora/life-simulation` | Simulación de Vida | Life Simulation |
| `aurora/economia` | Economía (AURORA) | Economy (AURORA) |
| `aurora/organizaciones` | Organizaciones | Organizations |
| `aurora/quest-generation` | Generación de Quests | Quest Generation |
| `aurora/llm-generative` | Generativo LLM | LLM Generative |
| `aurora/contratos` | Contratos ORACLE↔AURORA | ORACLE↔AURORA Contracts |
| `contribucion/testing` | Testing | Testing |

> If a source file's actual H1 (read in Step 1) differs from the "ES title" column above, use the actual H1 from the file, translated — the table is a best-effort reference, the source file is authoritative.

- [ ] **Step 3: Verify build succeeds and spot-check 3 pages**

```bash
npm run build
grep -o 'Documentation under construction' build/en/sistemas/combate/index.html
grep -o 'Documentation under construction' build/en/oracle/world-state/index.html
grep -o 'Documentation under construction' build/en/cliente/audio/index.html
```

Expected: build succeeds, all 3 greps find a match.

- [ ] **Step 4: Commit**

```bash
git add i18n/en/docusaurus-plugin-content-docs/current/
git commit -m "feat: translate 39 placeholder stub pages to English"
```

---

## Task 3: Translate `proyecto/` real content (5 files)

**Files:**
- Create: `i18n/en/docusaurus-plugin-content-docs/current/proyecto/arquitectura.md` (from `docs/proyecto/arquitectura.md`, 102 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/proyecto/tecnologias.md` (from `docs/proyecto/tecnologias.md`, 108 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/proyecto/instalacion-local.md` (from `docs/proyecto/instalacion-local.md`, 134 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/proyecto/estructura-de-archivos.md` (from `docs/proyecto/estructura-de-archivos.md`, 131 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/proyecto/persistencia.md` (from `docs/proyecto/persistencia.md`, 110 lines)

**Interfaces:**
- Consumes: `docs/proyecto/*.md` (real content, Rust workspace architecture, tech stack, local setup, file structure, persistence)
- Produces: fully translated `proyecto/` section in EN

- [ ] **Step 1: Read each source file in full**

```bash
cat docs/proyecto/arquitectura.md docs/proyecto/tecnologias.md docs/proyecto/instalacion-local.md docs/proyecto/estructura-de-archivos.md docs/proyecto/persistencia.md
```

- [ ] **Step 2: Translate each file to English following the Global Constraints**

Create each of the 5 files at its mirrored path under `i18n/en/docusaurus-plugin-content-docs/current/proyecto/`. Translate prose fully; leave code blocks, file paths, crate names, and glossary terms (see Global Constraints) untouched. Translate `title`/`description` frontmatter fields if present; keep `sidebar_position` numeric value identical to the source.

- [ ] **Step 3: Verify build and diff line counts as a sanity check**

```bash
npm run build
wc -l docs/proyecto/arquitectura.md i18n/en/docusaurus-plugin-content-docs/current/proyecto/arquitectura.md
wc -l docs/proyecto/tecnologias.md i18n/en/docusaurus-plugin-content-docs/current/proyecto/tecnologias.md
wc -l docs/proyecto/instalacion-local.md i18n/en/docusaurus-plugin-content-docs/current/proyecto/instalacion-local.md
wc -l docs/proyecto/estructura-de-archivos.md i18n/en/docusaurus-plugin-content-docs/current/proyecto/estructura-de-archivos.md
wc -l docs/proyecto/persistencia.md i18n/en/docusaurus-plugin-content-docs/current/proyecto/persistencia.md
```

Expected: build succeeds; EN line counts are within roughly ±20% of the ES counts (translations can be longer/shorter but a wildly different count signals truncated or duplicated content).

- [ ] **Step 4: Commit**

```bash
git add i18n/en/docusaurus-plugin-content-docs/current/proyecto/
git commit -m "feat: translate proyecto/ section to English"
```

---

## Task 4: Translate `servidor/` real content (3 files)

**Files:**
- Create: `i18n/en/docusaurus-plugin-content-docs/current/servidor/arquitectura.md` (from `docs/servidor/arquitectura.md`, 102 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/servidor/admin-commands.md` (from `docs/servidor/admin-commands.md`, 116 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/servidor/world-simulation.md` (from `docs/servidor/world-simulation.md`, 125 lines)

**Interfaces:**
- Consumes: `docs/servidor/*.md` (real content: monolithic server architecture, admin command reference, rtsim world simulation)
- Produces: fully translated real `servidor/` pages in EN (the 3 remaining stub files were handled in Task 2)

- [ ] **Step 1: Read each source file in full**

```bash
cat docs/servidor/arquitectura.md docs/servidor/admin-commands.md docs/servidor/world-simulation.md
```

- [ ] **Step 2: Translate each file to English following the Global Constraints**

Create each of the 3 files at its mirrored path. Pay special attention to the "server is monolithic, not microservices" framing (see `CLAUDE.md` critical architecture notes) — translate it accurately, don't accidentally introduce "service" language that implies separate processes.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add i18n/en/docusaurus-plugin-content-docs/current/servidor/
git commit -m "feat: translate servidor/ real content to English"
```

---

## Task 5: Translate `contribucion/` real content (7 files)

**Files:**
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/como-empezar.md` (99 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/git-flow.md` (99 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/code-style.md` (120 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/agregar-npc.md` (136 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/agregar-item.md` (146 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/agregar-hechizo.md` (151 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/contribucion/agregar-criatura.md` (199 lines)

**Interfaces:**
- Consumes: `docs/contribucion/*.md`
- Produces: fully translated `contribucion/` section in EN (highest-value section for international contributors; `testing.md` stub already handled in Task 2)

- [ ] **Step 1: Read each source file in full**

```bash
cat docs/contribucion/como-empezar.md docs/contribucion/git-flow.md docs/contribucion/code-style.md docs/contribucion/agregar-npc.md docs/contribucion/agregar-item.md docs/contribucion/agregar-hechizo.md docs/contribucion/agregar-criatura.md
```

- [ ] **Step 2: Translate each file to English following the Global Constraints**

Create each of the 7 files at its mirrored path. These are step-by-step guides (RON file examples, entity definitions) — keep every RON/Rust code block and file path exactly as-is; translate only the surrounding prose and step descriptions.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add i18n/en/docusaurus-plugin-content-docs/current/contribucion/
git commit -m "feat: translate contribucion/ real content to English"
```

---

## Task 6: Translate `referencia/` (3 files) + remaining single-file sections (3 files)

**Files:**
- Create: `i18n/en/docusaurus-plugin-content-docs/current/referencia/asset-formats.md` (224 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/referencia/ecs-components.md` (154 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/referencia/glosario.md` (131 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/apis/game-protocol.md` (110 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/oracle/intro.md` (89 lines)
- Create: `i18n/en/docusaurus-plugin-content-docs/current/aurora/intro.md` (100 lines)

**Interfaces:**
- Consumes: `docs/referencia/*.md`, `docs/apis/game-protocol.md`, `docs/oracle/intro.md`, `docs/aurora/intro.md`
- Produces: `referencia/` fully translated; the one real file in each of `apis/`, `oracle/`, `aurora/` translated (the other files in those three sections are stubs, already handled in Task 2)

- [ ] **Step 1: Read each source file in full**

```bash
cat docs/referencia/asset-formats.md docs/referencia/ecs-components.md docs/referencia/glosario.md docs/apis/game-protocol.md docs/oracle/intro.md docs/aurora/intro.md
```

- [ ] **Step 2: Translate each file to English following the Global Constraints**

Create each of the 6 files at its mirrored path.
- `referencia/glosario.md`: this is the canonical terms glossary — translate definitions, but the **bolded term itself stays exactly as-is** for any term listed in Global Constraints (e.g. `**ECS (Entity Component System)**` stays, don't invent an alternate English gloss for the heading itself beyond what's already there).
- `referencia/asset-formats.md`: keep every RON/TOML example verbatim.
- `oracle/intro.md` / `aurora/intro.md`: these are the two most-visited pages in their sidebars — proofread the translation carefully since they set the tone for the whole section.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add i18n/en/docusaurus-plugin-content-docs/current/referencia/ i18n/en/docusaurus-plugin-content-docs/current/apis/game-protocol.md i18n/en/docusaurus-plugin-content-docs/current/oracle/intro.md i18n/en/docusaurus-plugin-content-docs/current/aurora/intro.md
git commit -m "feat: translate referencia/ and remaining real content pages to English"
```

---

## Task 7: Redesign the locale switcher to match xindeler-web-landing (flag + mate)

**Objective:** Replace the stock text-only Docusaurus locale dropdown with a custom one showing a flag emoji + language code button, and a dropdown listing flag + label per language with a 🧉 mate emoji marking the active one — matching the visual language of `xindeler-web-landing/src/components/LanguageSwitcher.jsx`.

**Files:**
- Create: `src/theme/NavbarItem/LocaleDropdownNavbarItem/index.tsx`
- Create: `src/theme/NavbarItem/LocaleDropdownNavbarItem/styles.module.css`

**Interfaces:**
- Consumes: Docusaurus's `@docusaurus/theme-classic` `LocaleDropdownNavbarItem` swizzle point (component name confirmed present at `node_modules/@docusaurus/theme-classic/src/theme/NavbarItem/LocaleDropdownNavbarItem/index.tsx`); `@theme/NavbarItem/DropdownNavbarItem` for the underlying dropdown behavior; `useDocusaurusContext()` for `i18n.currentLocale` / `i18n.locales`
- Produces: navbar shows `🇦🇷 ES ▾` or `🇺🇸 EN ▾` instead of `🌐 Español ▾`; dropdown shows flag + label per locale with 🧉 next to the active one

- [ ] **Step 1: Swizzle the component (eject, unsafe — this component isn't marked "safe" for swizzling)**

```bash
npx docusaurus swizzle @docusaurus/theme-classic NavbarItem/LocaleDropdownNavbarItem --eject --danger --typescript
```

When prompted, confirm ejecting despite the "unsafe" warning. Expected: creates `src/theme/NavbarItem/LocaleDropdownNavbarItem/index.tsx` and `styles.module.css` copied from the theme's own implementation.

- [ ] **Step 2: Replace `src/theme/NavbarItem/LocaleDropdownNavbarItem/index.tsx` with the custom version**

```tsx
import React, {type ReactNode, useState, useRef, useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import {mergeSearchStrings, useHistorySelector} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import type {Props} from '@theme/NavbarItem/LocaleDropdownNavbarItem';

import styles from './styles.module.css';

const LOCALE_FLAGS: Record<string, string> = {
  es: '🇦🇷',
  en: '🇺🇸',
};

function useLocaleDropdownUtils() {
  const {
    siteConfig,
    i18n: {localeConfigs},
  } = useDocusaurusContext();
  const alternatePageUtils = useAlternatePageUtils();
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);

  const getLocaleConfig = (locale: string) => {
    const localeConfig = localeConfigs[locale];
    if (!localeConfig) {
      throw new Error(`Docusaurus bug, no locale config found for locale=${locale}`);
    }
    return localeConfig;
  };

  const getBaseURLForLocale = (locale: string) => {
    const localeConfig = getLocaleConfig(locale);
    const isSameDomain = localeConfig.url === siteConfig.url;
    if (isSameDomain) {
      return `pathname://${alternatePageUtils.createUrl({locale, fullyQualified: false})}`;
    }
    return alternatePageUtils.createUrl({locale, fullyQualified: true});
  };

  return {
    getURL: (locale: string, options: {queryString: string | undefined}) => {
      const finalSearch = mergeSearchStrings([search, options.queryString], 'append');
      return `${getBaseURLForLocale(locale)}${finalSearch}${hash}`;
    },
    getLabel: (locale: string) => getLocaleConfig(locale).label,
  };
}

export default function LocaleDropdownNavbarItem({
  mobile,
  dropdownItemsBefore = [],
  dropdownItemsAfter = [],
  queryString,
}: Props): ReactNode {
  const utils = useLocaleDropdownUtils();
  const {
    i18n: {currentLocale, locales},
  } = useDocusaurusContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (mobile) {
    // Mobile sidebar: keep it simple, stock-like list with flags added.
    const items = [...dropdownItemsBefore, ...locales, ...dropdownItemsAfter];
    return (
      <li className={styles.mobileWrapper}>
        <div className="menu__link menu__link--sublist">
          {translate({
            message: 'Languages',
            id: 'theme.navbar.mobileLanguageDropdown.label',
            description: 'The label for the mobile language switcher dropdown',
          })}
        </div>
        <ul>
          {items.map((locale) =>
            typeof locale === 'string' ? (
              <li key={locale}>
                <a
                  href={utils.getURL(locale, {queryString})}
                  className={`menu__link ${locale === currentLocale ? 'menu__link--active' : ''}`}
                >
                  <span className={styles.flag}>{LOCALE_FLAGS[locale] ?? '🏳️'}</span>{' '}
                  {utils.getLabel(locale)}
                  {locale === currentLocale && <span className={styles.mate}>🧉</span>}
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </li>
    );
  }

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={translate({
          message: 'Change language',
          id: 'theme.navbar.localeDropdown.changeLanguage',
          description: 'Aria label for the locale switcher button',
        })}
        className={styles.trigger}
      >
        <span className={styles.flag}>{LOCALE_FLAGS[currentLocale] ?? '🏳️'}</span>
        <span className={styles.code}>{currentLocale.toUpperCase()}</span>
        <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`}>▾</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => {
                window.location.href = utils.getURL(locale, {queryString});
              }}
              className={`${styles.dropdownItem} ${locale === currentLocale ? styles.dropdownItemActive : ''}`}
            >
              <span className={styles.flag}>{LOCALE_FLAGS[locale] ?? '🏳️'}</span>
              <span>{utils.getLabel(locale)}</span>
              {locale === currentLocale && <span className={styles.mate}>🧉</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/theme/NavbarItem/LocaleDropdownNavbarItem/styles.module.css` with**

```css
.wrapper {
  position: relative;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--ifm-navbar-link-color);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.trigger:hover {
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--ifm-color-primary);
}

.flag {
  font-size: 1rem;
  line-height: 1;
}

.code {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.caret {
  font-size: 0.6rem;
  transition: transform 0.2s ease;
}

.caretOpen {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 50;
  min-width: 150px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  background: rgba(13, 13, 31, 0.97);
  backdrop-filter: blur(16px);
}

.dropdownItem {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: #ccc;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdownItem:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdownItemActive {
  color: var(--ifm-color-primary);
  font-family: 'Cinzel', serif;
}

.mate {
  margin-left: auto;
  font-size: 0.7rem;
}

.mobileWrapper .flag {
  margin-right: 0.4rem;
}

.mobileWrapper .mate {
  margin-left: 0.4rem;
}
```

- [ ] **Step 4: Verify visually in dev mode**

```bash
npm start
```

Open `http://localhost:3000/`, confirm the navbar shows `🇦🇷 ES ▾`, clicking it opens a dropdown with `🇦🇷 Español` (marked with 🧉) and `🇺🇸 English`. Then run:

```bash
npm start -- --locale en
```

Open `http://localhost:3000/en/` and confirm the trigger shows `🇺🇸 EN ▾` and the dropdown marks English with 🧉.

- [ ] **Step 5: Verify production build**

```bash
npm run build
```

Expected: build succeeds for both locales with no console errors about the swizzled component.

- [ ] **Step 6: Commit**

```bash
git add src/theme/NavbarItem/LocaleDropdownNavbarItem/
git commit -m "feat: custom locale switcher with flag + mate icon, matching xindeler-web-landing"
```

---

## Task 8: Add a CI guard against future translation drift

**Objective:** Now that translation coverage is 61/61, make sure it can't silently regress back to a mostly-untranslated site the next time someone adds a Spanish doc without its English counterpart.

**Files:**
- Create: `scripts/check-i18n-coverage.mjs`
- Modify: `.github/workflows/pr-check.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes: `docs/**/*.md` (excluding `docs/superpowers/**`), `i18n/en/docusaurus-plugin-content-docs/current/**/*.md`
- Produces: a non-zero exit code (and a printed list of missing files) when any `docs/**/*.md` lacks a same-path counterpart under the EN translations directory

- [ ] **Step 1: Write the coverage check script**

Create `scripts/check-i18n-coverage.mjs`:

```javascript
import {readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const DOCS_DIR = 'docs';
const EN_DIR = 'i18n/en/docusaurus-plugin-content-docs/current';
const EXCLUDE_PREFIX = join(DOCS_DIR, 'superpowers');

function walkMarkdownFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (fullPath.startsWith(EXCLUDE_PREFIX)) continue;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const sourceFiles = walkMarkdownFiles(DOCS_DIR);
const missing = [];

for (const sourcePath of sourceFiles) {
  const relPath = relative(DOCS_DIR, sourcePath);
  const enPath = join(EN_DIR, relPath);
  try {
    statSync(enPath);
  } catch {
    missing.push(relPath);
  }
}

if (missing.length > 0) {
  console.error(`Missing EN translation for ${missing.length} file(s):`);
  for (const file of missing) console.error(`  - docs/${file}`);
  console.error('\nAdd a matching file under i18n/en/docusaurus-plugin-content-docs/current/ (see TRANSLATING.md).');
  process.exit(1);
}

console.log(`i18n coverage OK: all ${sourceFiles.length} docs have an EN translation file.`);
```

- [ ] **Step 2: Run it locally to confirm it passes with 0 missing (after Tasks 1–6)**

```bash
node scripts/check-i18n-coverage.mjs
```

Expected: `i18n coverage OK: all 61 docs have an EN translation file.`

- [ ] **Step 3: Run it against a deliberately broken state to confirm it fails correctly**

```bash
mv i18n/en/docusaurus-plugin-content-docs/current/intro.md /tmp/intro-backup.md
node scripts/check-i18n-coverage.mjs; echo "exit code: $?"
mv /tmp/intro-backup.md i18n/en/docusaurus-plugin-content-docs/current/intro.md
```

Expected: prints `Missing EN translation for 1 file(s): - docs/intro.md`, exit code 1. After restoring the file, re-run `node scripts/check-i18n-coverage.mjs` and confirm it passes again.

- [ ] **Step 4: Add an npm script for it**

In `package.json`, add to the `"scripts"` block (alongside the existing `"build"` entry):

```json
"check-i18n": "node scripts/check-i18n-coverage.mjs",
```

- [ ] **Step 5: Wire it into CI**

In `.github/workflows/pr-check.yml`, add a step after `npm ci` and before `npm run build`:

```yaml
      - run: npm ci
      - run: npm run check-i18n
      - run: npm run build
```

- [ ] **Step 6: Verify the full CI job locally**

```bash
npm run check-i18n && npm run build
```

Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add scripts/check-i18n-coverage.mjs .github/workflows/pr-check.yml package.json
git commit -m "chore: add CI guard against missing EN translations"
```

---

## Task 9: Update TRANSLATING.md coverage table and document the dev-server locale gotcha

**Files:**
- Modify: `TRANSLATING.md`

**Interfaces:**
- Consumes: nothing (documentation-only)
- Produces: accurate coverage table; a documented fix for the "switching locale 404s in dev mode" confusion

- [ ] **Step 1: Replace the coverage table**

In `TRANSLATING.md`, replace the "Current translation coverage" table with:

```markdown
## Current translation coverage

| Section | ES | EN | Notes |
|---------|----|----|-------|
| UI strings (navbar/footer/sidebar) | ✅ | ✅ | Complete |
| `intro.md` (homepage) | ✅ | ✅ | Complete |
| `proyecto/` | ✅ | ✅ | Complete |
| `cliente/` | ⬜ (stubs) | ✅ (stub translations) | ES content itself is still placeholder — see backlog |
| `servidor/` | ✅ (partial) | ✅ | 3 real pages translated, 3 stub pages translated |
| `apis/` | ✅ (partial) | ✅ | `game-protocol` translated, 3 stub pages translated |
| `sistemas/` | ⬜ (stubs) | ✅ (stub translations) | ES content itself is still placeholder — see backlog |
| `oracle/` | ✅ (partial) | ✅ | `intro` translated, 10 stub pages translated |
| `aurora/` | ✅ (partial) | ✅ | `intro` translated, 9 stub pages translated |
| `contribucion/` | ✅ (partial) | ✅ | 7 real pages translated, `testing` stub translated |
| `referencia/` | ✅ | ✅ | Complete |

**Note:** "stubs" means the Spanish source itself is still `*Documentación en construcción.*` — translating those to an equally short EN stub keeps both locales in sync, but the real writing work is tracked in `.backlog/backlog.md`, not here. When a stub's ES content is written for real, its EN translation must be updated in the same PR (the CI guard in `scripts/check-i18n-coverage.mjs` only checks a file *exists*, not that it's a substantive translation — full-page prose changes still need a human translation pass).
```

- [ ] **Step 2: Add a "Testing locally" section documenting the dev-server locale limitation**

Insert this section right after "## How Docusaurus i18n works here" in `TRANSLATING.md`:

```markdown
## Testing locally

`npm start` (`docusaurus start`) only serves **one locale at a time** — by
default, `es`. If you navigate to `/en/...` paths against a plain `npm start`
dev server, every route 404s, including the homepage — this is a Docusaurus
dev-server limitation, not a bug in the content.

To preview English locally, do one of:

```bash
# Option A: dev server scoped to English
npm start -- --locale en

# Option B: full production build (all locales, matches what actually deploys)
npm run build
npm run serve
```

Only Option B reproduces the real fallback-to-Spanish behavior for
untranslated pages — the single-locale dev server can't demonstrate that at
all, since it never loads the other locale's content.
```

- [ ] **Step 3: Verify the file renders correctly**

```bash
npm run build
```

Expected: build succeeds (TRANSLATING.md isn't part of the Docusaurus build, but this confirms nothing else broke).

- [ ] **Step 4: Commit**

```bash
git add TRANSLATING.md
git commit -m "docs: update TRANSLATING.md coverage table and document dev-server locale limitation"
```

---

## Task 10: Final full verification

**Objective:** End-to-end confirmation that the whole batch works together — both locales build cleanly, the CI guard passes, the new locale switcher renders and functions, and a sample of previously-broken pages now show correct English content.

- [ ] **Step 1: Full clean build**

```bash
rm -rf build .docusaurus
npm run check-i18n
npm run build
```

Expected: `check-i18n` reports 61/61 covered; `build` succeeds for both `es` and `en` with no warnings about missing translations.

- [ ] **Step 2: Serve the production build and spot-check in the browser**

```bash
npm run serve &
```

Navigate to `http://localhost:3000/` and `http://localhost:3000/en/` and confirm:
- `/en/` shows the real translated homepage (not "under construction")
- `/en/proyecto/arquitectura` shows English prose (not Spanish fallback)
- `/en/contribucion/agregar-npc` shows English prose
- `/en/sistemas/combate` shows "Combat" / "Documentation under construction" in English
- The navbar locale switcher shows `🇦🇷 ES ▾` on `/` and `🇺🇸 EN ▾` on `/en/`, and clicking it opens a dropdown with flags + the 🧉 marker on the active locale

Stop the server afterward:
```bash
kill %1
```

- [ ] **Step 3: Confirm no stray Spanish text remains on translated pages**

```bash
for f in build/en/proyecto/arquitectura/index.html build/en/contribucion/agregar-npc/index.html build/en/referencia/glosario/index.html; do
  echo "=== $f ==="
  grep -o 'ó\|ñ\|¿\|¡' "$f" | sort -u | tr '\n' ' '
  echo
done
```

Expected: this is a heuristic, not proof — Spanish accented characters may legitimately appear in glossary terms or proper nouns (e.g. `Facción` if untranslated by mistake). Manually review any hits to confirm they're intentional (proper nouns, glossary terms) and not leftover untranslated prose.

- [ ] **Step 4: Push the branch and open the PR**

```bash
git push -u origin HEAD
gh pr create --title "fix: complete English translation + custom locale switcher" \
  --body "$(cat <<'EOF'
## Summary
- Fixes the stale/broken EN homepage stub (was showing an outdated placeholder instead of the real homepage)
- Translates all 60 remaining doc pages to English (21 real-content pages + 39 placeholder stubs), closing the ES-fallback gap that made the site look partially broken
- Replaces the stock Docusaurus locale dropdown with a custom flag + 🧉 mate switcher matching xindeler-web-landing's design
- Adds a CI guard (`scripts/check-i18n-coverage.mjs`) so future Spanish-only pages fail the build instead of silently falling back
- Documents the `npm start` single-locale dev-server limitation in TRANSLATING.md (this was the source of the "switching to English 404s" symptom locally)

## Test plan
- [ ] `npm run check-i18n` passes (61/61 covered)
- [ ] `npm run build` succeeds for both locales
- [ ] Manually browsed `/en/` and a sample of translated pages via `npm run serve`
- [ ] Locale switcher shows flags + mate icon and correctly navigates between locales
EOF
)"
```

---

## Self-Review

### Spec coverage

| Requirement | Task |
|---|---|
| Fix broken/stale EN homepage | Task 1 |
| Translate all remaining content to English | Tasks 2–6 |
| Redesign locale switcher to match xindeler-web-landing (flag + mate) | Task 7 |
| Review/diagnose why i18n "isn't working" | Diagnosis summary + Tasks 1, 9 |
| Prevent regression | Task 8 |
| Update documentation to reflect new state | Task 9 |
| End-to-end verification before PR | Task 10 |

### Placeholder scan

Tasks 3–6 (real-content translation) intentionally do not embed pre-written English prose for the ~21 substantial files — that would mean hand-translating ~300 KB of technical documentation inside this plan document itself, which isn't practical to author or review as static plan text. Instead each of those tasks gives the exact file list, the exact terminology/style rules (Global Constraints), and a concrete verification step. This is the same pattern used for the original `2026-06-26-i18n-infrastructure.md` plan's deferred content tasks. Tasks 1, 2, 7, and 8 — where the output is small and deterministic — have complete, ready-to-use content inline.

### Type/interface consistency

- All new EN files live under `i18n/en/docusaurus-plugin-content-docs/current/` mirroring `docs/` — consistent path convention used in every task.
- `scripts/check-i18n-coverage.mjs` (Task 8) checks exactly the same directory pair that Tasks 1–6 populate — if Tasks 1–6 are skipped or incomplete, Task 8's own Step 2 will fail loudly, which is the intended signal to go back and finish translation before merging.
