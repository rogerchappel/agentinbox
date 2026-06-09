import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src', 'test'];
const files = [];

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collect(full);
    } else if (/\.(ts|tsx|js|mjs|cjs)$/.test(entry)) {
      files.push(full);
    }
  }
}

for (const root of roots) {
  collect(root);
}

const emptyFiles = files.filter((file) => readFileSync(file, 'utf8').trim().length === 0);

if (emptyFiles.length > 0) {
  console.error('Empty source files are not allowed:');
  for (const file of emptyFiles) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log(`Checked ${files.length} non-empty source files.`);
