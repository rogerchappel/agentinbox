import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execFileSync, execSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const cliPath = new URL('../src/cli.js', import.meta.url);

describe('agentinbox', () => {
  it('package.json should have all required metadata', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    assert.ok(pkg.name);
    assert.ok(pkg.author && pkg.author !== 'StackForge User');
    assert.ok(pkg.repository);
    assert.ok(pkg.scripts.test);
    assert.ok(pkg.scripts.build);
    assert.ok(pkg.scripts['release:check']);
  });

  it('build should succeed', () => {
    execSync('npm run build', { encoding: 'utf8' });
    assert.ok(true, 'build passed');
  });

  it('compiled CLI scans the packaged fixture inbox', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'agentinbox-'));
    const output = execFileSync(process.execPath, [cliPath.pathname, 'scan', 'fixtures/inbox', '--out', outDir], { encoding: 'utf8' });
    assert.match(output, /Wrote 3 task\(s\)/);

    const summary = JSON.parse(readFileSync(path.join(outDir, 'inbox.json'), 'utf8'));
    assert.equal(summary.taskCount, 3);
    assert.ok(summary.tasks.every((task: { title: string }) => task.title.length > 0));
  });
});
