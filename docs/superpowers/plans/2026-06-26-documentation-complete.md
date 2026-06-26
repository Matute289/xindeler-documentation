# Xindeler Documentation — Plan de Implementación Completo (Tareas 003–020)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar todas las tareas pendientes del backlog (003–020): infraestructura VPS, i18n, protección de ramas, y los 16 documentos de contenido (Sprint 2–6).

**Architecture:** Docusaurus v3 con tema dark Xindeler. Cada doc es un archivo Markdown con frontmatter mínimo. La validación es `npm run build` — si pasa, el doc es válido. Los docs de ORACLE/AURORA requieren leer los specs privados en `xindeler-design` antes de escribirlos.

**Tech Stack:** Docusaurus v3, Node 20, Markdown/MDX, GitHub CLI (`gh`), nginx, certbot, rsync.

## Global Constraints

- Idioma por defecto: **español (ES)**; inglés (EN) se agrega después (ver Task 2)
- Servidor es **monolítico** — nunca documentarlo como microservicios
- **Sin base de datos relacional** — persistencia via MessagePack + JSONL
- **Sin REST API ni WebSocket para el juego** — solo protocolo binario Veloren (Quinn/QUIC)
- La FastAPI en puerto 8010 es **solo para la web** (waitlist, status)
- ORACLE y AURORA corren dentro de `rtsim`, **no son microservicios**
- Usar las clases de badge del tema: `.badge-completed`, `.badge-wip`, `.badge-planned`
- Todo PR necesita 1 aprobación de **@Matute289** y CI `validate` debe pasar
- El deploy a VPS es automático al mergear a `main` via `deploy.yml`

---

## Nota sobre scope

Este plan cubre 6 fases independientes. Cada fase produce docs testeables por sí sola.
Se puede ejecutar fase por fase o en paralelo donde no hay dependencias.

**Dependencias:**
- Task 0 (branch protection) → independiente, hacerlo primero
- Task 1 (VPS) → independiente, hacerlo en Sprint 1
- Task 2 (i18n) → independiente, hacerlo en Sprint 1
- Tasks 3-5 (Sprint 2) → independientes entre sí, son la base que otros referencian
- Tasks 6-8 (Sprint 3) → Tasks 3-5 deben existir para referencias internas
- Tasks 9-11 (Sprint 4 ORACLE) → leer `xindeler-design/systems/oracle/` primero
- Tasks 12-14 (Sprint 5 AURORA) → leer `xindeler-design/systems/aurora/` primero; entender Task 9 (world-facts.md)
- Tasks 15-18 (Sprint 6) → independientes, reference docs

---

## Fase 0 — Configuración GitHub

### Task 0: Branch Protection + CODEOWNERS

**Files:**
- Create: `.github/CODEOWNERS`
- Run: `gh api` command (no file)

**Interfaces:**
- Produces: rama `main` protegida; solo PRs aprobados por `@Matute289` pueden mergear; solo `@Matute289` puede hacer bypass

- [ ] **Step 1: Crear CODEOWNERS**

Crear `.github/CODEOWNERS`:
```
# Matías es el único reviewer requerido para todo el repo
* @Matute289
```

- [ ] **Step 2: Verificar que el archivo está en la ubicación correcta**

```bash
ls -la .github/CODEOWNERS
```
Expected: el archivo existe

- [ ] **Step 3: Configurar branch protection via GitHub CLI**

```bash
gh api repos/Matute289/xindeler-documentation/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["validate"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "bypass_pull_request_allowances": {
      "users": ["Matute289"],
      "teams": [],
      "apps": []
    }
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false
}
EOF
```

Expected output: JSON con la configuración de la regla de protección.

- [ ] **Step 4: Verificar la protección**

```bash
gh api repos/Matute289/xindeler-documentation/branches/main/protection \
  | jq '{enforce_admins: .enforce_admins.enabled, required_reviews: .required_pull_request_reviews.required_approving_review_count, require_code_owner_reviews: .required_pull_request_reviews.require_code_owner_reviews}'
```

Expected:
```json
{
  "enforce_admins": false,
  "required_reviews": 1,
  "require_code_owner_reviews": true
}
```

- [ ] **Step 5: Commit CODEOWNERS**

```bash
git add .github/CODEOWNERS
git commit -m "chore: add CODEOWNERS - Matute289 required reviewer for all paths"
```

---

## Fase 1 — Infraestructura (Sprint 1)

### Task 1: VPS nginx config (Backlog 003)

**Files:**
- No archivos en el repo — configuración directa en el VPS
- Opcional: documentar en `docs/superpowers/runbooks/vps-setup.md` (no publicado)

**Interfaces:**
- Produces: `https://docs.xindeler.greenmountain.dev` resuelve al portal, SSL válido, deploys automáticos funcionan

**PREREQUISITO:** El deploy CI/CD (task 002) ya está configurado en `.github/workflows/deploy.yml`.
Los GitHub Secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_DEPLOY_PATH` deben estar configurados.

- [ ] **Step 1: Verificar que los secrets existen en GitHub**

```bash
gh secret list --repo Matute289/xindeler-documentation
```

Expected: ver `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_DEPLOY_PATH` listados.
Si faltan, agregarlos:
```bash
gh secret set VPS_HOST --repo Matute289/xindeler-documentation
gh secret set VPS_USER --body "mgrinberg" --repo Matute289/xindeler-documentation
gh secret set VPS_SSH_KEY --repo Matute289/xindeler-documentation  # pegar la key privada
gh secret set VPS_DEPLOY_PATH --body "/srv/xindeler/docs/" --repo Matute289/xindeler-documentation
```

- [ ] **Step 2: SSH al VPS y crear el directorio de deploy**

```bash
ssh -i ~/.ssh/id_ed25519 mgrinberg@216.238.126.97
```

Una vez dentro del VPS:
```bash
sudo mkdir -p /srv/xindeler/docs
sudo chown mgrinberg:mgrinberg /srv/xindeler/docs
ls -la /srv/xindeler/
```

Expected: directorio `docs/` con owner `mgrinberg`

- [ ] **Step 3: Crear virtual host nginx**

En el VPS, crear `/etc/nginx/sites-available/docs.xindeler.greenmountain.dev`:
```nginx
server {
    listen 80;
    server_name docs.xindeler.greenmountain.dev;

    root /srv/xindeler/docs;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/css application/javascript application/json;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/docs.xindeler.greenmountain.dev \
           /etc/nginx/sites-enabled/
sudo nginx -t
```

Expected: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

```bash
sudo systemctl reload nginx
```

- [ ] **Step 4: Agregar registro DNS**

En el proveedor DNS (donde está configurado `xindeler.greenmountain.dev`):
- Tipo: `A`
- Host: `docs`
- Valor: `216.238.126.97`
- TTL: 300 (5 min para probar rápido, luego subir a 3600)

Verificar propagación:
```bash
dig docs.xindeler.greenmountain.dev +short
```

Expected: `216.238.126.97`

- [ ] **Step 5: Instalar SSL con certbot**

En el VPS:
```bash
sudo certbot --nginx -d docs.xindeler.greenmountain.dev
```

Seguir el wizard: ingresar email (maticgrinberg@gmail.com), aceptar TOS, elegir redirect HTTP→HTTPS.

Expected: `Successfully deployed certificate for docs.xindeler.greenmountain.dev`

- [ ] **Step 6: Trigger un deploy para verificar end-to-end**

Desde local, hacer un commit vacío para triggear el deploy:
```bash
git commit --allow-empty -m "chore: trigger deploy to verify VPS config"
git push origin main
```

Monitorear el workflow:
```bash
gh run watch --repo Matute289/xindeler-documentation
```

Luego verificar en el browser: `https://docs.xindeler.greenmountain.dev`
Expected: el portal de docs aparece con el tema dark de Xindeler.

- [ ] **Step 7: Actualizar backlog**

En `.backlog/backlog.md`, cambiar `[ ]` → `[x]` para la tarea 003.

---

### Task 2: i18n ES + EN (Backlog 004)

**Files:**
- Modify: `docusaurus.config.ts` (ya tiene `locales: ['en', 'es']` configurado)
- Create: `i18n/es/docusaurus-plugin-content-docs/current/` (generado por comando)
- Create: `i18n/es/docusaurus-theme-classic/navbar.json` (generado)
- Create: `i18n/es/docusaurus-theme-classic/footer.json` (generado)

**Interfaces:**
- Produces: locale switcher EN/ES funcional en la navbar; estructura i18n lista para traducir docs

- [ ] **Step 1: Generar los archivos de traducción**

```bash
npm run write-translations -- --locale es
```

Expected output: lista de archivos creados en `i18n/es/`
```
Wrote i18n/es/docusaurus-theme-classic/navbar.json
Wrote i18n/es/docusaurus-theme-classic/footer.json
Wrote i18n/es/code.json
```

- [ ] **Step 2: Verificar los archivos generados**

```bash
ls i18n/es/docusaurus-theme-classic/
cat i18n/es/docusaurus-theme-classic/navbar.json
```

- [ ] **Step 3: Traducir labels de la navbar al español**

Editar `i18n/es/docusaurus-theme-classic/navbar.json`. Cambiar los `message` values:
```json
{
  "item.label.Proyecto": {
    "message": "Proyecto",
    "description": "Navbar item with label Proyecto"
  },
  "item.label.Sistemas": {
    "message": "Sistemas",
    "description": "Navbar item with label Sistemas"
  },
  "item.label.ORACLE": {
    "message": "ORACLE",
    "description": "Navbar item with label ORACLE"
  },
  "item.label.AURORA": {
    "message": "AURORA",
    "description": "Navbar item with label AURORA"
  },
  "item.label.Contribuir": {
    "message": "Contribuir",
    "description": "Navbar item with label Contribuir"
  },
  "item.label.GitHub": {
    "message": "GitHub",
    "description": "Navbar item with label GitHub"
  }
}
```

- [ ] **Step 4: Build con ambos locales**

```bash
npm run build -- --locale en && npm run build -- --locale es
```

Si falla el build de ES por falta de docs, usar:
```bash
npm run build
```
(el default locale siempre compila aunque ES no tenga todos los docs aún)

Expected: `build/` contiene archivos, `build/es/` contiene versión en español

- [ ] **Step 5: Verificar el locale switcher en dev**

```bash
npm start
```

Navegar a `http://localhost:3000` y verificar que el dropdown EN/ES aparece en la navbar.

- [ ] **Step 6: Commit**

```bash
git add i18n/
git commit -m "feat: setup i18n ES locale with translated navbar and footer strings"
```

- [ ] **Step 7: Actualizar backlog**

En `.backlog/backlog.md`, cambiar `[ ]` → `[x]` para la tarea 004.

---

## Fase 2 — Contenido esencial para contributors (Sprint 2)

### Task 3: proyecto/instalacion-local.md (Backlog 005)

**Files:**
- Create: `docs/proyecto/instalacion-local.md`

**Interfaces:**
- Produces: guía completa para clonar, compilar y levantar Xindeler localmente

- [ ] **Step 1: Crear el archivo con skeleton y verificar que el build pasa**

Crear `docs/proyecto/instalacion-local.md`:
```markdown
---
sidebar_position: 4
title: Instalación Local
description: Cómo compilar y levantar Xindeler en tu máquina
---

# Instalación Local

Placeholder — borrar antes de abrir PR.
```

```bash
npm run build
```

Expected: build exits 0 (si hay broken links en `intro.md` apuntando a este archivo, pueden ser warnings pero no errors dado `onBrokenLinks: 'warn'`)

- [ ] **Step 2: Escribir el contenido completo**

Reemplazar el placeholder con el contenido completo. El archivo final debe tener esta estructura:

```markdown
---
sidebar_position: 4
title: Instalación Local
description: Cómo compilar y levantar Xindeler en tu máquina
---

# Instalación Local

Guía para configurar tu entorno de desarrollo local y correr Xindeler.

## Requisitos previos

| Requisito | Versión mínima | Notas |
|-----------|----------------|-------|
| Rust nightly | última nightly | `rustup toolchain install nightly` |
| Git LFS | cualquiera | Para los assets del juego |
| libvulkan | — | Driver gráfico con soporte Vulkan |
| libasound (Linux) | — | Para audio en Linux |
| cmake | 3.x | Build dependency |
| Espacio en disco | ~5 GB | Para la compilación completa |

### Instalar Rust nightly

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup toolchain install nightly
rustup default nightly
```

### Instalar Git LFS

```bash
# Ubuntu/Debian
sudo apt install git-lfs

# macOS
brew install git-lfs

git lfs install
```

### Dependencias del sistema (Linux)

```bash
# Ubuntu/Debian
sudo apt install libvulkan-dev libasound2-dev cmake build-essential pkg-config
```

## Clonar el repositorio

```bash
git clone https://github.com/Matute289/xindeler
cd xindeler
git lfs pull
```

:::info
`git lfs pull` descarga los assets binarios (texturas, sonidos). Sin este paso,
el juego compila pero puede crashear al intentar cargar assets.
:::

## Compilar

La primera compilación tarda entre **10 y 20 minutos** según el hardware.

```bash
# Debug (recomendado para desarrollo)
cargo build

# Release (más rápido en ejecución, más lento de compilar)
cargo build --release
```

### ¿Debug o Release?

- **Debug**: recomendado para contribuir. Compila más rápido (~10 min vs ~20 min),
  incluye símbolos para debugging, aserciones habilitadas.
- **Release**: usar solo si necesitas medir performance real.

## Levantar el servidor

```bash
cargo run --bin veloren-server-cli
```

El servidor escucha en `0.0.0.0:14004` por defecto.
Los logs se muestran en la terminal. Cuando aparece `Server is ready to accept connections.`, está listo.

## Levantar el cliente

En una **terminal separada**:

```bash
cargo run --bin veloren-voxygen
```

## Conectar al servidor local

En el menú principal del cliente:
1. Seleccionar **"Servidor personalizado"**
2. Servidor: `localhost`
3. Puerto: `14004`
4. Crear un personaje y entrar

## Troubleshooting

### Error de Vulkan

```
error: No Vulkan driver found
```

**Solución:** Instalar los drivers de Vulkan para tu GPU:
- **NVIDIA**: `sudo apt install nvidia-vulkan-icd`
- **AMD**: `sudo apt install mesa-vulkan-drivers`
- **Intel**: `sudo apt install mesa-vulkan-drivers`

### Error de linking

```
error: linker `cc` not found
```

**Solución:**
```bash
# Ubuntu/Debian
sudo apt install build-essential

# macOS (debería venir con Xcode CLI tools)
xcode-select --install
```

### Assets corruptos o faltantes

Si el cliente muestra texturas en negro o crashes al cargar:
```bash
git lfs pull
```

### Compilación lenta en segunda compilación

Normal si se modifica `common/` — este crate es una dependencia de casi todo.
Modificar solo `rtsim/` o `voxygen/` es más incremental.

## Próximos pasos

- [Arquitectura del workspace Rust](./arquitectura) — entender cómo están organizados los crates
- [Cómo empezar a contribuir](../contribucion/como-empezar) — abrir tu primer PR
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: build exitoso, sin errores en `docs/proyecto/instalacion-local.md`

- [ ] **Step 4: Commit**

```bash
git add docs/proyecto/instalacion-local.md
git commit -m "docs: add proyecto/instalacion-local.md - setup guide for local dev"
```

- [ ] **Step 5: Actualizar backlog**

`.backlog/backlog.md`: cambiar `[ ]` → `[x]` para tarea 005.

---

### Task 4: proyecto/arquitectura.md (Backlog 006)

**Files:**
- Create: `docs/proyecto/arquitectura.md`

**Interfaces:**
- Produces: mapa del workspace Rust, crates, flujo de datos, notas sobre monolito y persistencia

- [ ] **Step 1: Crear archivo con skeleton**

Crear `docs/proyecto/arquitectura.md`:
```markdown
---
sidebar_position: 2
title: Arquitectura
description: Mapa del workspace Rust de Xindeler
---

# Arquitectura del Proyecto

Placeholder.
```

```bash
npm run build
```

Expected: build exitoso

- [ ] **Step 2: Escribir contenido completo**

```markdown
---
sidebar_position: 2
title: Arquitectura
description: Mapa del workspace Rust de Xindeler
---

# Arquitectura del Proyecto

Xindeler es un Cargo workspace de Rust. Un **cliente** (`voxygen`) se comunica con
un **servidor monolítico** via protocolo binario sobre QUIC.

:::warning Arquitectura monolítica
El servidor es **un único proceso Rust**. No existen Login Server, Chat Server,
World Server ni Combat Server como procesos separados. Son subsistemas funcionales
dentro del mismo binario.
:::

## Crates principales

| Crate | Binario | Descripción |
|-------|---------|-------------|
| `voxygen` | `veloren-voxygen` | Cliente: render wgpu, UI egui, input, audio |
| `server` | `veloren-server-cli` | Proceso servidor; tick ECS principal |
| `world` | — | Generación procedural de terreno, biomas, sites |
| `rtsim` | — | Real-time simulation: NPCs, facciones, economía |
| `common` | — | Tipos compartidos: componentes ECS, items, abilities |
| `common-net` | — | Protocolo de red compartido (serialización) |
| `assets` | — | No es un crate Rust; carpeta de assets del juego (RON, PNG, WAV) |

## Flujo de datos

```
┌─────────────────────────────────────────────────────────────────────┐
│  [voxygen — cliente]                                                 │
│    render loop (wgpu)  +  UI (egui)  +  input  +  audio (kira)      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  protocolo binario (Quinn/QUIC)
                               │  serialización: rmp-serde (MessagePack)
┌──────────────────────────────▼──────────────────────────────────────┐
│  [server — proceso único]                                            │
│                                                                      │
│  ┌──────── ECS tick ────────────────────────────────────────────┐    │
│  │  [world]     [rtsim]     [combat sys]   [physics sys]        │    │
│  │                │                                             │    │
│  │          ┌─────┴─────┐                                       │    │
│  │        [ORACLE]   [AURORA]                                   │    │
│  │          └─────┬─────┘                                       │    │
│  │          WorldFacts queue (read-only para AURORA)            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Persistencia:                                                       │
│    rtsim/data.dat  (MessagePack)                                     │
│    chronicle/*.jsonl  (event archival)                               │
└─────────────────────────────────────────────────────────────────────┘
```

## El servidor es monolítico

No existen estos procesos por separado:
- ~~Login Server~~ → subsistema de autenticación dentro del server
- ~~Chat Server~~ → sistema de mensajes dentro del ECS tick
- ~~World Server~~ → el `world` crate corriendo en el mismo proceso
- ~~Combat Server~~ → los `combat systems` del ECS, misma thread pool

Todos comparten memoria y se ejecutan en el mismo tick.

## Persistencia

Xindeler no usa base de datos relacional en v1:

| Qué | Cómo | Dónde |
|-----|------|-------|
| Estado del mundo (rtsim) | MessagePack binario | `rtsim/data.dat` |
| Archival de eventos | JSONL rotado por tamaño | `chronicle/YYYY-MM-DD.jsonl` |
| Waitlist/Contributors (web) | CSV | `/srv/xindeler/data/waitlist.csv` |

La persistencia del juego (data.dat) no usa SQL ni NoSQL. La estructura está diseñada
con un seam para migrar a RocksDB o SQLite en el futuro, pero v1 es solo MessagePack.

## Comunicación de red

| Canal | Tecnología | Propósito |
|-------|-----------|-----------|
| Juego cliente↔servidor | Protocolo binario Veloren via Quinn (QUIC) | Todo el gameplay |
| Web → VPS | FastAPI REST (puerto 8010) | Waitlist, status del server |

**No existe una API REST ni WebSocket para el juego.** La comunicación es siempre
el protocolo binario propio de Veloren.

## Subsistemas ORACLE y AURORA

Ambos corren como módulos dentro de `rtsim`, en el mismo proceso del servidor:

- **ORACLE** — World Director: dirige eventos globales, narrativa, ecosistema
- **AURORA** — NPC AI: simula mente, memoria y relaciones sociales de cada NPC
- Se comunican via **WorldFacts**: ORACLE publica, AURORA consume (contrato read-only)

Ver [ORACLE](../oracle/intro) y [AURORA](../aurora/intro) para documentación completa.
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: build exitoso

- [ ] **Step 4: Commit**

```bash
git add docs/proyecto/arquitectura.md
git commit -m "docs: add proyecto/arquitectura.md - Rust workspace map and data flow"
```

- [ ] **Step 5: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 006.

---

### Task 5: Contribución esencial (Backlog 007)

**Files:**
- Create: `docs/contribucion/como-empezar.md`
- Create: `docs/contribucion/git-flow.md`
- Create: `docs/contribucion/code-style.md`

**Interfaces:**
- Consumes: referencia a Task 3 (`instalacion-local.md`)
- Produces: guías de onboarding para nuevos contributors

- [ ] **Step 1: Crear los tres archivos con skeletons y verificar build**

```bash
cat > docs/contribucion/como-empezar.md <<'EOF'
---
sidebar_position: 1
title: Cómo empezar
description: Guía de onboarding para nuevos contributors
---
# Cómo empezar a contribuir

Placeholder.
EOF

cat > docs/contribucion/git-flow.md <<'EOF'
---
sidebar_position: 2
title: Git Flow
description: Branching strategy y flujo de trabajo con Git
---
# Git Flow

Placeholder.
EOF

cat > docs/contribucion/code-style.md <<'EOF'
---
sidebar_position: 3
title: Code Style
description: Convenciones de código Rust para Xindeler
---
# Code Style

Placeholder.
EOF
```

```bash
npm run build
```

Expected: build exitoso

- [ ] **Step 2: Escribir como-empezar.md**

Reemplazar placeholder con:
```markdown
---
sidebar_position: 1
title: Cómo empezar
description: Guía de onboarding para nuevos contributors de Xindeler
---

# Cómo empezar a contribuir

Bienvenido al proyecto. Esta guía te lleva desde cero hasta abrir tu primer PR.

## 1. Fork del repositorio

1. Ir a `https://github.com/Matute289/xindeler`
2. Click en **Fork** (esquina superior derecha)
3. Elegir tu cuenta personal como destino del fork

## 2. Clonar y configurar git

```bash
git clone https://github.com/TU_USUARIO/xindeler
cd xindeler

# Agregar el repo original como "upstream"
git remote add upstream https://github.com/Matute289/xindeler

# Verificar remotes
git remote -v
```

Expected:
```
origin    https://github.com/TU_USUARIO/xindeler (fetch)
upstream  https://github.com/Matute289/xindeler (fetch)
```

## 3. Primer build exitoso

Antes de tocar código, asegurarse de que el build pase:

```bash
cargo build
```

Si el build falla, seguir la guía de [Instalación local](../proyecto/instalacion-local)
antes de continuar.

## 4. Crear un branch de feature

**Nunca trabajar directamente en `main`.** Crear un branch descriptivo:

```bash
# Sincronizar con upstream antes de crear el branch
git fetch upstream
git checkout -b feat/nombre-descriptivo upstream/main

# Ejemplos de nombres correctos:
# feat/add-frost-mage-abilities
# fix/rtsim-npc-pathfinding-crash
# chore/update-rust-edition
```

Ver [Git Flow](./git-flow) para la convención de nombres completa.

## 5. Hacer cambios y commitear

```bash
# Hacer tus cambios...

# Verificar que el código compila y pasa checks
cargo build
cargo test
cargo fmt --check
cargo clippy -- -D warnings

# Commitear con mensaje descriptivo
git add -p  # revisar cada hunk antes de agregar
git commit -m "feat: add frost nova spell with slow debuff"
```

Ver [Code Style](./code-style) para las convenciones de Rust del proyecto.

## 6. Abrir un Pull Request

```bash
# Push tu branch a tu fork
git push origin feat/nombre-descriptivo
```

Luego en GitHub:
1. GitHub detecta el push y muestra el botón "Compare & pull request"
2. Click en ese botón
3. Asegurarse de que el **base** sea `Matute289/xindeler:main`
4. Escribir descripción: qué cambió y por qué
5. Click en **Create pull request**

## 7. Ciclo de revisión

- El CI (`pr-check.yml`) correrá automáticamente. Debe pasar.
- @Matute289 revisará el PR. Puede pedir cambios.
- Para incorporar feedback:
  ```bash
  # Hacer los cambios pedidos
  git add -p
  git commit -m "fix: address review feedback - rename SpellDef fields"
  git push origin feat/nombre-descriptivo
  ```
- Una vez aprobado, el PR se mergea a `main`.

## Checklist antes de abrir PR

- [ ] `cargo build` pasa
- [ ] `cargo test` pasa
- [ ] `cargo fmt --check` pasa (sin diff de formato)
- [ ] `cargo clippy -- -D warnings` pasa (sin warnings)
- [ ] El PR describe qué cambió y por qué
```

- [ ] **Step 3: Escribir git-flow.md**

```markdown
---
sidebar_position: 2
title: Git Flow
description: Branching strategy y convenciones de commits para Xindeler
---

# Git Flow

## Ramas

| Rama | Propósito | Protección |
|------|-----------|-----------|
| `main` | Producción — siempre deployable | Protegida: solo PRs aprobados |
| `feat/*` | Features nuevas | — |
| `fix/*` | Bugfixes | — |
| `chore/*` | Infra, deps, refactors sin cambio de lógica | — |

## Convención de nombres de branch

```
feat/nombre-descriptivo-en-kebab-case
fix/descripcion-del-bug
chore/descripcion-del-cambio
```

**Correcto:**
- `feat/add-aurora-quest-generation`
- `fix/rtsim-crash-on-npc-death`
- `chore/update-veloren-upstream`

**Incorrecto:**
- `feature-nueva` (sin prefijo de tipo)
- `fix` (sin descripción)
- `FEAT/AddSomething` (mayúsculas, PascalCase)

## Commits

Formato: `tipo: descripción en presente, minúsculas`

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat:` | Agrega funcionalidad nueva |
| `fix:` | Corrige un bug |
| `docs:` | Solo cambios de documentación |
| `chore:` | Build, deps, config — sin cambio de lógica |
| `refactor:` | Restructuración sin cambio de comportamiento |
| `test:` | Agregar o arreglar tests |

**Ejemplos:**
```bash
git commit -m "feat: add hemomancy school with blood barrier spell"
git commit -m "fix: rtsim panics when NPC target is None"
git commit -m "docs: add aurora/quest-generation.md"
git commit -m "chore: bump rust edition to 2024"
```

## Reglas de PR

- **No force push a `main`** — nunca, bajo ninguna circunstancia
- **No push directo a `main`** — siempre via PR (excepto @Matute289 cuando es necesario)
- Cada PR necesita **1 aprobación** de @Matute289
- El CI (`pr-check.yml → validate`) debe pasar antes de mergear
- Resolver todos los comentarios del review antes de mergear

## Mantener el branch actualizado

Si el branch queda desactualizado con `main`:

```bash
git fetch upstream
git rebase upstream/main
git push origin feat/mi-branch --force-with-lease
```

Usar `--force-with-lease` en lugar de `--force` para no sobreescribir trabajo de otros
accidentalmente.
```

- [ ] **Step 4: Escribir code-style.md**

```markdown
---
sidebar_position: 3
title: Code Style
description: Convenciones de código Rust para contribuir a Xindeler
---

# Code Style

Xindeler sigue las convenciones estándar de Rust con algunas reglas adicionales.

## Herramientas obligatorias

Antes de cualquier PR, el código debe pasar estas tres verificaciones:

```bash
cargo fmt --check      # sin diff de formato
cargo clippy -- -D warnings  # sin warnings de clippy
cargo test             # todos los tests pasan
```

Estos mismos checks corren en CI. Si alguno falla, el PR no se puede mergear.

### Aplicar formato automáticamente

```bash
cargo fmt
```

`rustfmt.toml` en la raíz del repo tiene la configuración. No modificarlo sin discutirlo.

## Convenciones de nombres

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Funciones | `snake_case` | `apply_buff`, `tick_rtsim` |
| Variables | `snake_case` | `npc_count`, `world_graph` |
| Structs | `PascalCase` | `MindState`, `WorldFact` |
| Enums | `PascalCase` | `MagicSource`, `EdgeKind` |
| Variantes de enum | `PascalCase` | `MagicSource::Arcane` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_ACTIVE_EVENTS` |
| Módulos y archivos | `snake_case` | `world_state.rs`, `rtsim/` |

## Comentarios en el código

**No comentar qué hace el código** — los nombres de funciones/variables ya lo dicen.

**Sí comentar el "por qué"** cuando no es obvio:

```rust
// Bien — explica por qué, no qué
// Usamos u16 en lugar de u32 para que Mind quepa en una cache line de 64 bytes
pub mood: u16,

// Mal — repite lo que el código ya dice
// Incrementar el contador
counter += 1;
```

**Sin docstrings largos** en funciones internas. Docstrings solo en APIs públicas de crates,
y solo si el "por qué" no es obvio.

## Error handling

```rust
// Correcto en código de servidor: propagar el error
fn load_rtsim_data(path: &Path) -> Result<RtSimData, Error> {
    let data = std::fs::read(path)?;
    rmp_serde::from_slice(&data)?
}

// Incorrecto en código de servidor: panic silencioso
fn load_rtsim_data(path: &Path) -> RtSimData {
    let data = std::fs::read(path).unwrap();  // NO
    rmp_serde::from_slice(&data).unwrap()      // NO
}
```

**Regla:** Sin `unwrap()` ni `expect()` en código del servidor (`server/`, `rtsim/`).
En código del cliente (`voxygen/`) se puede usar con moderación para invariantes
que realmente no pueden fallar.

## Sin código comentado en PRs

```rust
// fn old_approach() { ... }  <-- NO incluir en PRs

fn new_approach() { ... }  // solo la versión nueva
```

Git guarda el historial — si alguien necesita ver el código viejo, lo puede encontrar
via `git log -p`.
```

- [ ] **Step 5: Verificar build completo**

```bash
npm run build
```

Expected: build exitoso, sin errores en los tres archivos nuevos

- [ ] **Step 6: Commit**

```bash
git add docs/contribucion/como-empezar.md \
        docs/contribucion/git-flow.md \
        docs/contribucion/code-style.md
git commit -m "docs: add contribucion/ - como-empezar, git-flow, code-style guides"
```

- [ ] **Step 7: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 007.

---

## Fase 3 — Sistemas de juego (Sprint 3)

### Task 6: sistemas/combate.md + sistemas/magia.md (Backlog 008)

**Files:**
- Create: `docs/sistemas/combate.md`
- Create: `docs/sistemas/magia.md`

**Interfaces:**
- Produces: docs de mecánicas de combate y magia con badges de estado

- [ ] **Step 1: Crear skeletons y verificar build**

```bash
cat > docs/sistemas/combate.md <<'EOF'
---
sidebar_position: 1
title: Combate
---
# Combate
Placeholder.
EOF

cat > docs/sistemas/magia.md <<'EOF'
---
sidebar_position: 2
title: Magia
---
# Magia
Placeholder.
EOF
```

```bash
npm run build
```

Expected: build exitoso

- [ ] **Step 2: Escribir combate.md**

Estructura requerida:
```markdown
---
sidebar_position: 1
title: Combate
description: Mecánicas de combate en Xindeler — Poise, combos, parry, proyectiles
---

# Combate

El sistema de combate de Xindeler corre en el ECS del servidor. El servidor es
**autoritativo**: el cliente predice localmente, el servidor valida cada acción.

## Mecánicas implementadas

| Mecánica | Estado | Descripción breve |
|----------|--------|-------------------|
| Poise system | <span class="badge-completed">Implementado</span> | Resistencia al stagger |
| Combos | <span class="badge-completed">Implementado</span> | Ataques encadenados con finishers |
| Buffs/Debuffs | <span class="badge-completed">Implementado</span> | Stack de efectos en componente Buffs |
| Parry | <span class="badge-completed">Implementado</span> | Ventana de frames para bloquear |
| Backstab | <span class="badge-completed">Implementado</span> | Multiplicador de daño por sorpresa |
| Proyectiles | <span class="badge-completed">Implementado</span> | Componente Projectile |

## Poise system

[Descripción detallada del poise system, reset al esquivar, umbral de stagger, etc.]

Código fuente relevante: `common/src/comp/buff.rs`

## Combos

[Descripción de ataques encadenados, cómo se acumula el combo counter, finisher moves]

## Buffs y Debuffs

[Descripción del stack de effects, duración, stacking rules, interacciones]

Código fuente: `common/src/comp/buff.rs`

## Parry

[Descripción de la ventana de parry frames, consecuencias del parry exitoso (stagger al atacante)]

## Backstab

[Descripción del multiplicador de daño, condición de detección del target]

## Proyectiles

[Descripción del componente Projectile, velocidad, tiempo de vida, damage source]

Código fuente: `common/src/comp/projectile.rs`
```

- [ ] **Step 3: Escribir magia.md**

Estructura requerida:
```markdown
---
sidebar_position: 2
title: Magia
description: Sistema de magia en Xindeler — MagicSource, escuelas, SpellDef, energy
---

# Magia

## Fuentes de magia (MagicSource)

```rust
pub enum MagicSource {
    Arcane,   // Magia del tejido arcano
    Divine,   // Magia otorgada por deidades
    Primal,   // Magia de la naturaleza
    Psionic,  // Poder mental
    Ki,       // Energía interna del cuerpo
}
```

## Escuelas de magia

| Escuela | Fuente | Descripción | Estado |
|---------|--------|-------------|--------|
| Evocación | Arcane | Proyectiles y explosiones | <span class="badge-wip">En progreso</span> |
| Hemomancy | Arcane/Primal | Manipulación de la sangre — mecánica única de Xindeler | <span class="badge-planned">Planeado</span> |
| Axiomancy | Arcane | Manipulación de leyes físicas — mechánica única de Xindeler | <span class="badge-planned">Planeado</span> |
| Necromancy | Divine/Arcane | Magia de los muertos y la vida | <span class="badge-planned">Planeado</span> |
| Abjuration | Divine | Protección y barreras | <span class="badge-planned">Planeado</span> |

### Hemomancy y Axiomancy

[Descripción especial de las dos escuelas más originales del juego, su mecánica distintiva]

## SpellDef — Definición de hechizos

Los hechizos se definen en RON, en `assets/common/abilities/`:

```ron
SpellDef(
    name: "Frost Nova",
    magic_source: Arcane,
    school: Evocation,
    energy_cost: 30,
    cast_time: 0.5,
    // ... demás campos
)
```

Ver [Agregar un hechizo](../contribucion/agregar-hechizo) para el proceso completo.

## Sistema de energía

La energía es el recurso de casting. Se regenera pasivamente con el tiempo.

[Descripción de regeneración, penalizaciones, interacción con Poise]

## Status effects mágicos

| Effect | Tipo | Descripción |
|--------|------|-------------|
| Veneno | Debuff | DPS por tick |
| Fuego | Debuff | DPS + área |
| Hielo | Debuff | Slow de movimiento |
| Bendición | Buff | Regeneración de vida |
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add docs/sistemas/combate.md docs/sistemas/magia.md
git commit -m "docs: add sistemas/combate.md and sistemas/magia.md"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 008.

---

### Task 7: sistemas/clases.md + sistemas/crafting.md + sistemas/items.md (Backlog 009)

**Files:**
- Create: `docs/sistemas/clases.md`
- Create: `docs/sistemas/crafting.md`
- Create: `docs/sistemas/items.md`

- [ ] **Step 1: Crear skeletons y verificar build**

Crear los tres archivos con frontmatter mínimo (mismo patrón que Task 6, Step 1).

```bash
npm run build
```

- [ ] **Step 2: Escribir clases.md**

```markdown
---
sidebar_position: 3
title: Clases
description: Las 4 clases jugables de Xindeler y las 10 clases planificadas
---

# Clases

## Clases activas

| Clase | Estilo de juego | Árboles de habilidades | Estado |
|-------|----------------|----------------------|--------|
| **Warrior** | Combate cuerpo a cuerpo | Sword, Axe, Hammer | <span class="badge-completed">Implementado</span> |
| **Mage** | Daño mágico a distancia | Staff (Fuego), ... | <span class="badge-wip">En progreso</span> |
| **Cleric** | Curación y soporte | Sceptre | <span class="badge-completed">Implementado</span> |
| **Rogue** | Sigilo y daño preciso | — | <span class="badge-wip">En progreso</span> |

[Descripción de cada clase con habilidades principales]

## Clases planificadas

Las siguientes clases están en el roadmap pero no implementadas aún:

| Clase | Estado |
|-------|--------|
| Barbarian | <span class="badge-planned">Planeado</span> |
| Sorcerer | <span class="badge-planned">Planeado</span> |
| Warlock | <span class="badge-planned">Planeado</span> |
| Bard | <span class="badge-planned">Planeado</span> |
| Paladin | <span class="badge-planned">Planeado</span> |
| Druid | <span class="badge-planned">Planeado</span> |
| Ranger | <span class="badge-planned">Planeado</span> |
| Monk | <span class="badge-planned">Planeado</span> |
| Artificer | <span class="badge-planned">Planeado</span> |
| BloodSlayer | <span class="badge-planned">Planeado</span> |
```

- [ ] **Step 3: Escribir crafting.md**

Estructura con: recipe system (manifest RON), materiales, craft stations, cómo se descubren recetas.

- [ ] **Step 4: Escribir items.md**

Estructura con: tipos de items, calidad (Common → Legendary), restricciones, estructura RON de un item.

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/sistemas/clases.md docs/sistemas/crafting.md docs/sistemas/items.md
git commit -m "docs: add sistemas/clases, crafting, items"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 009.

---

### Task 8: Guías de contribución — agregar NPC, hechizo, item (Backlog 010)

**Files:**
- Create: `docs/contribucion/agregar-npc.md`
- Create: `docs/contribucion/agregar-hechizo.md`
- Create: `docs/contribucion/agregar-item.md`

- [ ] **Step 1: Crear skeletons y verificar build**

Tres archivos con frontmatter mínimo. `npm run build` debe pasar.

- [ ] **Step 2: Escribir agregar-npc.md**

Guía paso a paso completa con rutas exactas:
1. Crear `assets/common/npc/nombre-npc.ron` con template RON
2. Registrar en el entity list (ruta exacta del archivo)
3. Asignar comportamiento en rtsim (referencia a AURORA)
4. Definir loot table en `assets/common/loot_tables/`
5. Testing: `cargo run --bin veloren-server-cli` + `/spawn entity nombre-npc` en el cliente

- [ ] **Step 3: Escribir agregar-hechizo.md**

Guía paso a paso con template SpellDef RON completo, pasos de registrar en compendium, agregar al skill tree, notas de balance.

- [ ] **Step 4: Escribir agregar-item.md**

Guía con template RON de item completo, agregar recipe, loot table, testing con `/give item_name`.

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/contribucion/agregar-npc.md \
        docs/contribucion/agregar-hechizo.md \
        docs/contribucion/agregar-item.md
git commit -m "docs: add contribucion/ guides for NPC, spell, and item creation"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 010.

---

## Fase 4 — ORACLE (Sprint 4)

> **⚠️ PREREQUISITO CRÍTICO:** Antes de escribir cualquier doc de ORACLE, leer el spec completo:
> ```bash
> ls ~/path/to/xindeler-design/systems/oracle/
> ```
> El spec (~80 KB) es la fuente de verdad. Cualquier inconsistencia entre los docs y el spec
> debe resolverse a favor del spec.

### Task 9: ORACLE core — intro + arquitectura + world-state (Backlog 011)

**Files:**
- Create: `docs/oracle/intro.md`
- Create: `docs/oracle/arquitectura.md`
- Create: `docs/oracle/world-state.md`

- [ ] **Step 1: Leer el spec de ORACLE**

```bash
# Ruta al repo xindeler-design (debe estar clonado localmente)
ls ~/path/to/xindeler-design/systems/oracle/
```

Leer todos los archivos del spec antes de continuar.

- [ ] **Step 2: Crear skeletons y verificar build**

Tres archivos con frontmatter mínimo. `npm run build` debe pasar.

- [ ] **Step 3: Escribir oracle/intro.md**

```markdown
---
sidebar_position: 1
title: ¿Qué es ORACLE?
description: ORACLE — el World Director autónomo de Xindeler
---

# ORACLE — World Director

ORACLE es el subsistema de Xindeler que dirige los eventos globales del mundo,
la narrativa emergente, y la simulación del ecosistema de criaturas.

Metáfora: ORACLE es el **DM invisible del servidor** — el Game Master que mueve
las piezas del mundo sin que los jugadores lo vean.

## Rol en el juego

[Del spec: responsabilidades concretas de ORACLE]

## Relación con AURORA

[Del spec: cómo ORACLE publica WorldFacts y AURORA los consume]

## Dónde corre

ORACLE no es un microservicio. Corre como un módulo dentro de `rtsim`,
en el mismo proceso del servidor Rust.

```
[server process]
    └── rtsim tick
            ├── ORACLE (módulos: EventEngine, NarrativeLayer, EcosystemSim, LLMProposer)
            └── AURORA (Mind simulation)
```

Ver [Arquitectura del proyecto](../proyecto/arquitectura) para el mapa completo del proceso.
```

- [ ] **Step 4: Escribir oracle/arquitectura.md**

Del spec: placement en rtsim, módulos (EventEngine, NarrativeLayer, EcosystemSim, LLMProposer), threading (LLMProposer en thread separado), kill-switch.

- [ ] **Step 5: Escribir oracle/world-state.md**

Del spec: WorldGraph (nodos Region, Settlement, FactionNode, ResourceNode), cómo ORACLE lee el estado, cómo escribe WorldFacts, snapshot vs. tiempo real.

- [ ] **Step 6: Verificar build y commit**

```bash
npm run build
git add docs/oracle/intro.md docs/oracle/arquitectura.md docs/oracle/world-state.md
git commit -m "docs: add oracle core - intro, arquitectura, world-state"
```

- [ ] **Step 7: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 011.

---

### Task 10: ORACLE engine — event-engine + narrative + ecosystem (Backlog 012)

**Files:**
- Create: `docs/oracle/event-engine.md`
- Create: `docs/oracle/narrative.md`
- Create: `docs/oracle/ecosystem.md`

**Prerequisito:** Spec de ORACLE leído en Task 9.

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir event-engine.md**

Del spec: lifecycle Proposed→Approved→Active→Resolved, clases de eventos, pacing, anti-chaos rules, LLM proposer vs. reglas hardcoded.

- [ ] **Step 3: Escribir narrative.md**

Del spec: arc templates (conflict, exploration, tragedy, triumph), LLM layer, canon validation, integración con AURORA via WorldFacts.

- [ ] **Step 4: Escribir ecosystem.md**

Del spec: Lotka-Volterra adaptado, population drift, variantes regionales, spawn rules (density caps, region affinity).

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/oracle/event-engine.md docs/oracle/narrative.md docs/oracle/ecosystem.md
git commit -m "docs: add oracle event-engine, narrative, ecosystem"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 012.

---

### Task 11: ORACLE LLM + admin + anti-chaos (Backlog 013)

**Files:**
- Create: `docs/oracle/llm-integration.md`
- Create: `docs/oracle/admin.md`
- Create: `docs/oracle/anti-chaos.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir llm-integration.md**

Del spec: HTTP trait abstracta, llama.cpp local vs. API remota, LLMProposer thread async, fallback a reglas hardcoded si el LLM falla.

- [ ] **Step 3: Escribir admin.md**

Comandos admin disponibles via chat del servidor:

```markdown
## Comandos ORACLE

Todos los comandos requieren permiso de admin en el servidor.

| Comando | Descripción |
|---------|-------------|
| `/oracle status` | Estado actual, eventos activos, carga del LLM |
| `/oracle pause` | Pausa ORACLE sin detener el server |
| `/oracle resume` | Reactiva ORACLE |
| `/oracle event propose <tipo> <región>` | Forzar propuesta de evento |
| `/oracle log tail` | Últimos eventos del JSONL chronicle |
```

- [ ] **Step 4: Escribir anti-chaos.md**

Del spec: circuit breaker (umbral N errores / M minutos → auto-deshabilita), auto-rollback, canary metrics, kill-switch flag en config.

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/oracle/llm-integration.md docs/oracle/admin.md docs/oracle/anti-chaos.md
git commit -m "docs: add oracle llm-integration, admin commands, anti-chaos"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 013.

---

## Fase 5 — AURORA (Sprint 5)

> **⚠️ PREREQUISITO CRÍTICO:** Antes de escribir cualquier doc de AURORA, leer el spec:
> ```bash
> ls ~/path/to/xindeler-design/systems/aurora/
> ```
> También tener claro el contrato ORACLE↔AURORA (Task 9: world-state.md, world-facts).

### Task 12: AURORA core — intro + npc-mind + memoria (Backlog 014)

**Files:**
- Create: `docs/aurora/intro.md`
- Create: `docs/aurora/npc-mind.md`
- Create: `docs/aurora/memoria.md`

- [ ] **Step 1: Leer el spec de AURORA**

```bash
ls ~/path/to/xindeler-design/systems/aurora/
```

Leer todos los archivos del spec antes de continuar.

- [ ] **Step 2: Crear skeletons y verificar build**

- [ ] **Step 3: Escribir aurora/intro.md**

Del spec: qué es AURORA, relación con ORACLE (reacciona a WorldFacts), por qué existe (NPCs con memoria y motivaciones, no solo state machines), dónde corre (rtsim).

- [ ] **Step 4: Escribir aurora/npc-mind.md**

Del spec: struct `Mind` completo con todos sus campos:
- `values` — mapa de prioridades (poder, familia, conocimiento, etc.)
- `fears` — traumas y miedos
- `alignment` — espacio 2D de moral (no el binario de D&D)
- `mood` — estado emocional actual y cómo afecta decisiones/diálogos
- `goals` — lista priorizada GOAP-style

- [ ] **Step 5: Escribir aurora/memoria.md**

Del spec: STM (short-term, alta salience, degrada rápido), LTM episódica (eventos importantes con timestamp/contexto), LTM semántica (conocimiento factual: precios, rutas, facciones). Salience function. Forgetting por tiempo/espacio/relevancia.

- [ ] **Step 6: Verificar build y commit**

```bash
npm run build
git add docs/aurora/intro.md docs/aurora/npc-mind.md docs/aurora/memoria.md
git commit -m "docs: add aurora core - intro, npc-mind, memoria"
```

- [ ] **Step 7: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 014.

---

### Task 13: AURORA social — social-graph + life-simulation + economia (Backlog 015)

**Files:**
- Create: `docs/aurora/social-graph.md`
- Create: `docs/aurora/life-simulation.md`
- Create: `docs/aurora/economia.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir social-graph.md**

Del spec: EdgeKind enum completo (Kinship, Friendship, Romance, Rivalry, Debt, Mentor, Enemy), ego-centric queries ("¿quién le debe un favor?"), cómo se crean/modifican relaciones, grafo dirigido asimétrico.

- [ ] **Step 3: Escribir life-simulation.md**

Del spec: birth (demografía activa de sites), aging (niño→adulto→anciano con cambio de rol), death (causas: vejez/combate/hambre/enfermedad), family formation, heritage (hijos heredan assets/relaciones/deudas).

- [ ] **Step 4: Escribir economia.md**

Del spec: SiteEconomy por settlement, price_mult dinámico (oferta/demanda), merchant routes (precio diferencial), cómo ORACLE puede disrumpir rutas via WorldFacts.

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/aurora/social-graph.md docs/aurora/life-simulation.md docs/aurora/economia.md
git commit -m "docs: add aurora social-graph, life-simulation, economia"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 015.

---

### Task 14: AURORA quests + contratos (Backlog 016)

**Files:**
- Create: `docs/aurora/quest-generation.md`
- Create: `docs/aurora/contratos.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir quest-generation.md**

Del spec: need detection, quest templates (fetch, escort, eliminate, negotiate, deliver, investigate), anti-exploit (cooldowns, unicidad), tier system, narrativa via LLM tier 2 o baked.

- [ ] **Step 3: Escribir contratos.md**

Del spec: el contrato ORACLE↔AURORA detallado:

```markdown
## El contrato ORACLE↔AURORA

AURORA **no puede modificar WorldFacts** — son read-only para ella.

| Actor | Rol |
|-------|-----|
| ORACLE | Publica WorldFacts al observation queue |
| AURORA | Consume WorldFacts y reacciona |

### Ejemplo de flujo

```
ORACLE publica:
  WorldFact::WarDeclared { attacker: FactionA, defender: FactionB }

AURORA reacciona para todos los NPCs de FactionA:
  - mood: Fear += 20, Aggression += 30
  - goals: añadir "Defend settlement" con alta prioridad

AURORA reacciona para NPCs mercaderes con rutas entre A y B:
  - goals: replanning de rutas
```

### Desacoplamiento

Si ORACLE está deshabilitado (kill-switch), AURORA sigue funcionando con normalidad.
Solo pierde la reacción a eventos globales — los NPCs siguen simulando su vida cotidiana.
```

- [ ] **Step 4: Verificar build y commit**

```bash
npm run build
git add docs/aurora/quest-generation.md docs/aurora/contratos.md
git commit -m "docs: add aurora quest-generation and oracle-aurora contract"
```

- [ ] **Step 5: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 016.

---

## Fase 6 — Referencia completa (Sprint 6)

### Task 15: Cliente voxygen (Backlog 017)

**Files:**
- Create: `docs/cliente/arquitectura.md`
- Create: `docs/cliente/renderizado.md`
- Create: `docs/cliente/ui.md`
- Create: `docs/cliente/audio.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir los cuatro archivos del cliente**

`arquitectura.md`: voxygen como crate cliente, render loop (winit event loop + render tick), escenas (MainMenu, Ingame, Loading), hot-reload en desarrollo.

`renderizado.md`: wgpu pipeline (abstracción sobre Vulkan/Metal/DX12), chunks voxel 32×32×16, LOD para chunks lejanos, iluminación día/noche.

`ui.md`: egui/conrod para HUD, HUD elements (vida, energía, inventario, chat), slot system del inventario.

`audio.md`: kira audio engine, ambient audio por bioma, SFX (combate, ambiente, UI).

- [ ] **Step 3: Verificar build y commit**

```bash
npm run build
git add docs/cliente/
git commit -m "docs: add cliente/ - arquitectura, render, UI, audio"
```

- [ ] **Step 4: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 017.

---

### Task 16: Servidor profundo (Backlog 018)

**Files:**
- Create: `docs/servidor/arquitectura.md`
- Create: `docs/servidor/world-simulation.md`
- Create: `docs/servidor/combat.md`
- Create: `docs/servidor/persistencia.md`
- Create: `docs/servidor/admin-commands.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir los cinco archivos del servidor**

`arquitectura.md`: proceso único Rust, ECS tick (cómo avanza la simulación frame a frame), subsistemas principales.

`world-simulation.md`: rtsim (la simulación larga), Sites (generados proceduralmente), Factions (objetivos, territorios, relaciones).

`combat.md`: ECS systems de combate (orden de ejecución en el tick), autoridad del servidor (cliente predice, servidor valida).

`persistencia.md`: MessagePack data.dat (serialización/deserialización), migration strategy (`#[serde(default)]`), JSONL chronicle.

`admin-commands.md`: lista completa de comandos admin disponibles en el chat del servidor.

- [ ] **Step 3: Verificar build y commit**

```bash
npm run build
git add docs/servidor/
git commit -m "docs: add servidor/ - arquitectura, world-sim, combat, persistencia, admin"
```

- [ ] **Step 4: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 018.

---

### Task 17: APIs y protocolos (Backlog 019)

**Files:**
- Create: `docs/apis/veloren-protocol.md`
- Create: `docs/apis/fastapi-web.md`
- Create: `docs/apis/telemetria.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir veloren-protocol.md**

:::warning
El protocolo del juego es binario, no REST ni WebSocket.
:::

Contenido: protocolo binario sobre Quinn/QUIC, serialización con rmp-serde (MessagePack), tipos de mensajes, explicación de por qué no es REST (latencia, throughput del juego).

- [ ] **Step 3: Escribir fastapi-web.md**

FastAPI en puerto 8010, endpoints completos con ejemplos de request/response:
- `GET /api/status`
- `GET /api/waitlist/count`
- `POST /api/waitlist` (body, rate limit, dedup)
- `POST /api/contribute`

- [ ] **Step 4: Escribir telemetria.md**

TelemetryLayer JSONL, BoundedWriter (cómo controla tamaño del log), canary metrics que ORACLE monitorea.

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/apis/
git commit -m "docs: add apis/ - veloren-protocol, fastapi-web, telemetria"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: `[ ]` → `[x]` para tarea 019.

---

### Task 18: Referencia completa (Backlog 020)

**Files:**
- Create: `docs/referencia/asset-formats.md`
- Create: `docs/referencia/ecs-components.md`
- Create: `docs/referencia/glosario.md`

- [ ] **Step 1: Crear skeletons y verificar build**

- [ ] **Step 2: Escribir asset-formats.md**

RON (Rusty Object Notation): sintaxis básica, ejemplo completo de item RON con todos los campos obligatorios, ejemplo completo de ability RON (SpellDef + CharacterAbility), formato TOML para config del servidor.

- [ ] **Step 3: Escribir ecs-components.md**

Tabla de componentes ECS más comunes que un contributor necesita conocer:

| Componente | Crate | Descripción | Fields clave |
|-----------|-------|-------------|-------------|
| `Health` | `common` | Puntos de vida | `current`, `maximum` |
| `Energy` | `common` | Puntos de energía/mana | `current`, `maximum` |
| `Poise` | `common` | Resistencia al stagger | `current`, `maximum` |
| `Buffs` | `common` | Stack de efectos activos | `kinds: HashMap<BuffKind, Vec<Buff>>` |
| `Inventory` | `common` | Inventario del personaje | slots, equipped |
| `Agent` | `common` | Comportamiento de NPC | `target`, `activity` |
| `rtsim::Body` | `rtsim` | NPC del rtsim (simulación larga) | `mind`, `memory`, `goals` |

- [ ] **Step 4: Escribir glosario.md**

Todos los términos del proyecto con definiciones de 1-2 oraciones: ECS, rtsim, ORACLE, AURORA, WorldFact, rmp-serde, wgpu, Quinn, voxygen, Site, Settlement, Faction, tick, loot table, etc.

- [ ] **Step 5: Verificar build y commit**

```bash
npm run build
git add docs/referencia/
git commit -m "docs: add referencia/ - asset-formats, ecs-components, glosario"
```

- [ ] **Step 6: Actualizar backlog**

`.backlog/backlog.md`: cambiar todas las tareas 017-020 de `[ ]` → `[x]`.

---

## Self-Review

### Spec coverage

| Backlog | Plan task | Covered |
|---------|-----------|---------|
| 003 VPS nginx | Task 1 | ✅ |
| 004 i18n | Task 2 | ✅ |
| Branch protection (req. usuario) | Task 0 | ✅ |
| 005 instalacion-local | Task 3 | ✅ |
| 006 arquitectura | Task 4 | ✅ |
| 007 contribucion esencial | Task 5 | ✅ |
| 008 combate+magia | Task 6 | ✅ |
| 009 clases+crafting+items | Task 7 | ✅ |
| 010 guías contribución | Task 8 | ✅ |
| 011 oracle core | Task 9 | ✅ |
| 012 oracle engine | Task 10 | ✅ |
| 013 oracle llm | Task 11 | ✅ |
| 014 aurora core | Task 12 | ✅ |
| 015 aurora social | Task 13 | ✅ |
| 016 aurora quests+contratos | Task 14 | ✅ |
| 017 cliente | Task 15 | ✅ |
| 018 servidor profundo | Task 16 | ✅ |
| 019 apis | Task 17 | ✅ |
| 020 referencia | Task 18 | ✅ |
| P02 landing link | **excluido** por instrucción del usuario | — |

**Constraint check:**
- ✅ Servidor monolítico documentado correctamente en Tasks 4, 16
- ✅ Sin base de datos relacional mencionada en Tasks 3, 4, 16
- ✅ Sin REST API para el juego — Task 17 clarifica esto explícitamente
- ✅ ORACLE y AURORA dentro de rtsim — Tasks 9, 12
- ✅ Branch protection con bypass solo para @Matute289 — Task 0
