# Translation Guide

Xindeler Docs is written in **Spanish (ES) first**. English translations are
added incrementally as the Spanish content matures.

## How Docusaurus i18n works here

- `docs/` — Spanish content (default locale, `es`)
- `i18n/en/docusaurus-plugin-content-docs/current/` — English translations
- `i18n/en/docusaurus-theme-classic/` — UI strings (navbar, footer)

If a page has no English translation, Docusaurus shows the Spanish version as
fallback. This is intentional — partial coverage is fine.

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

## Adding a new English translation

When a Spanish page in `docs/` has real content (not just "Documentación en
construcción."), add the English version:

1. Copy the Spanish file path. Example:
   ```
   docs/proyecto/instalacion-local.md
   ```

2. Create the same path under the EN translations directory:
   ```
   i18n/en/docusaurus-plugin-content-docs/current/proyecto/instalacion-local.md
   ```

3. Translate the content. Keep the frontmatter (`sidebar_position`, `title`,
   `description`) translated as well:
   ```markdown
   ---
   sidebar_position: 4
   title: Local Setup
   description: How to compile and run Xindeler on your machine
   ---

   # Local Setup
   ...
   ```

4. Verify both locales build:
   ```bash
   npm run build
   ```

5. Preview in English:
   ```bash
   npm start -- --locale en
   ```

6. Open a PR with the translation.

## Adding a new locale (e.g. Portuguese)

1. Add the locale to `docusaurus.config.ts`:
   ```ts
   i18n: {
     defaultLocale: 'es',
     locales: ['es', 'en', 'pt'],
     localeConfigs: {
       pt: { label: 'Português', direction: 'ltr' },
     },
   }
   ```

2. Generate the UI string files:
   ```bash
   npm run write-translations -- --locale pt
   ```

3. Translate `i18n/pt/docusaurus-theme-classic/navbar.json`, `footer.json`,
   and `i18n/pt/docusaurus-plugin-content-docs/current.json`.

   > **Note:** The copyright year in `footer.json` must be bumped manually each year.
   > Unlike the Spanish source (`docusaurus.config.ts` uses `new Date().getFullYear()`),
   > the JSON translation file cannot contain JavaScript expressions.

4. Add content translations under `i18n/pt/docusaurus-plugin-content-docs/current/`.

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
