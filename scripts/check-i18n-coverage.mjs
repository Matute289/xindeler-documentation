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
