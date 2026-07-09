import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const bins = Object.entries(pkg.bin ?? {});

if (bins.length === 0) {
  throw new Error('package.json does not declare any CLI bin entries');
}

const missing = [];
for (const [name, target] of bins) {
  try {
    await access(new URL(`../${target}`, import.meta.url));
    const helpOutput = execFileSync(process.execPath, [target, '--help'], {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    if (!helpOutput.includes('Usage:')) {
      throw new Error(`${name} --help did not print usage text`);
    }
  } catch {
    missing.push(`${name} -> ${target}`);
  }
}

if (missing.length > 0) {
  throw new Error(`package bin target(s) missing after build: ${missing.join(', ')}`);
}

console.log(`Verified ${bins.length} package bin target(s) and help output.`);

const expectedPackedFiles = [
  'dist/src/cli.js',
  'dist/src/index.js',
  'docs/INPUT_FORMATS.md',
  'docs/RELEASE_CHECKLIST.md',
  'fixtures/inbox/github-issue.json',
  'fixtures/inbox/task-queue.jsonl',
  'scripts/smoke.sh',
  'SKILL.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md'
];

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit']
});

const [pack] = JSON.parse(output);
const publishedFiles = new Set(pack.files.map((file) => file.path));
const missingPackedFiles = expectedPackedFiles.filter((file) => !publishedFiles.has(file));

if (missingPackedFiles.length > 0) {
  throw new Error(`package dry-run missing expected file(s): ${missingPackedFiles.join(', ')}`);
}

console.log(`Verified package dry-run contents (${pack.files.length} file(s)).`);
