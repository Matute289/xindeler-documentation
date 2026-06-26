# Translation Guide

X'Indeler Docs is written in **Spanish (ES) first**. English translations are
added incrementally as the Spanish content matures.

## How Docusaurus i18n works here

- `docs/` — Spanish content (default locale, `es`)
- `i18n/en/docusaurus-plugin-content-docs/current/` — English translations
- `i18n/en/docusaurus-theme-classic/` — UI strings (navbar, footer)

If a page has no English translation, Docusaurus shows the Spanish version as
fallback. This is intentional — partial coverage is fine.

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
| UI strings (navbar/footer) | ✅ | ✅ | Complete |
| `intro.md` | ✅ | ✅ | |
| `proyecto/` | ✅ | ⬜ | Pending content writing |
| `contribucion/` | ✅ | ⬜ | Pending content writing |
| `sistemas/` | ✅ | ⬜ | Pending content writing |
| `oracle/` | ✅ | ⬜ | Pending content writing |
| `aurora/` | ✅ | ⬜ | Pending content writing |
| `servidor/` | ✅ | ⬜ | Pending content writing |
| `cliente/` | ✅ | ⬜ | Pending content writing |
| `apis/` | ✅ | ⬜ | Pending content writing |
| `referencia/` | ✅ | ⬜ | Pending content writing |

**Note:** ✅ = file exists; content may be placeholder — check before translating.
