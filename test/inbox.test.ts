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
    assert.match(output, /Wrote 7 task\(s\)/);

    const summary = JSON.parse(readFileSync(path.join(outDir, 'inbox.json'), 'utf8'));
    assert.equal(summary.taskCount, 7);
    assert.ok(summary.tasks.every((task: { title: string }) => task.title.length > 0));
    assert.match(readFileSync(path.join(outDir, 'brief.md'), 'utf8'), /# Agent Inbox/);
    assert.equal(JSON.parse(readFileSync(path.join(outDir, 'queue.json'), 'utf8')).tasks.length, 7);
  });

  it('prints markdown briefs from the CLI', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'agentinbox-brief-'));
    const output = execFileSync(process.execPath, [cliPath.pathname, 'brief', 'fixtures/inbox/github-issue.json', '--out', outDir], { encoding: 'utf8' });
    assert.match(output, /Add connector dry-run preview/);
    assert.match(output, /npm run smoke/);
  });

  it('passes lint for actionable fixture tasks', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'agentinbox-lint-'));
    const output = execFileSync(process.execPath, [cliPath.pathname, 'lint', 'fixtures/inbox', '--fail-under', '60', '--out', outDir], { encoding: 'utf8' });
    assert.match(output, /lint passed/);
  });
});
