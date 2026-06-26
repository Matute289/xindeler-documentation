# 001 — Setup Docusaurus v3 + Tema Xindeler

**Estado:** `[x]` Completo  
**Prioridad:** Alta  
**Sprint:** 1

## Qué se hizo
- Scaffolded con `npx create-docusaurus@3 xindeler-documentation classic`
- Tema dark: background `#06060f`, accent `#d4a017` (gold), Cinzel serif headings
- Badges `.badge-completed`, `.badge-wip`, `.badge-planned` en custom.css
- `docusaurus.config.ts` configurado con i18n EN/ES, dark mode forced, nav items para todas las secciones
- `sidebars.ts` con 5 sidebars: projectSidebar, systemsSidebar, oracleSidebar, auroraSidebar, contributeSidebar
- Todos los stubs de docs/ creados (sin 404s en el sidebar)
- Prism syntax highlighting con soporte de Rust, TOML, YAML, RON
