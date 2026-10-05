import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execFileSync, execSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { discoverInputs } from '../src/fs.js';

const cliPath = new URL('../src/cli.js', import.meta.url);

describe('agentinbox', () => {
  it('does not follow ancestor loops or directory links outside the input tree', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'agentinbox-links-'));
    const nested = path.join(root, 'nested');
    const external = mkdtempSync(path.join(tmpdir(), 'agentinbox-external-'));
    mkdirSync(nested);
    writeFileSync(path.join(nested, 'inside.txt'), 'inside');
    writeFileSync(path.join(external, 'outside.txt'), 'outside');
    symlinkSync(root, path.join(nested, 'ancestor'), 'dir');
    symlinkSync(external, path.join(root, 'external'), 'dir');
    try {
      assert.deepEqual(await discoverInputs(root), [path.join(nested, 'inside.txt')]);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(external, { recursive: true, force: true });
    }
  });
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
    assert.match(output, /Wrote 5 task\(s\)/);

    const summary = JSON.parse(readFileSync(path.join(outDir, 'inbox.json'), 'utf8'));
    assert.equal(summary.taskCount, 5);
    assert.ok(summary.tasks.every((task: { title: string }) => task.title.length > 0));
    assert.match(readFileSync(path.join(outDir, 'brief.md'), 'utf8'), /# Agent Inbox/);
    assert.equal(JSON.parse(readFileSync(path.join(outDir, 'queue.json'), 'utf8')).tasks.length, 5);
  });

  it('compiled CLI prints help from the installed entrypoint', () => {
    const output = execFileSync(process.execPath, [cliPath.pathname, '--help'], { encoding: 'utf8' });
    assert.match(output, /Usage:/);
    assert.match(output, /agentinbox scan <input> --out <dir>/);
    assert.match(output, /agentinbox lint <input> \[--fail-under 75\]/);
  });

  it('prints markdown briefs from the CLI', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'agentinbox-brief-'));
    const output = execFileSync(process.execPath, [cliPath.pathname, 'brief', 'fixtures/inbox/github-issue.json', '--out', outDir], { encoding: 'utf8' });
    assert.match(output, /Add connector dry-run preview/);
    assert.match(output, /npm run smoke/);
  });

  it('prints risk-ordered action plans from the CLI', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'agentinbox-plan-'));
    const output = execFileSync(process.execPath, [cliPath.pathname, 'plan', 'fixtures/inbox', '--out', outDir], { encoding: 'utf8' });
    assert.match(output, /# Agent Action Plan/);
    assert.match(output, /Preflight fixes/);

    const json = execFileSync(process.execPath, [cliPath.pathname, 'plan', 'fixtures/inbox', '--format', 'json', '--out', outDir], { encoding: 'utf8' });
    const plan = JSON.parse(json);
    assert.equal(plan.tasks.length, 5);
    assert.deepEqual(plan.tasks.slice(0, 2).map((task: { risk: string }) => task.risk), ['low', 'low']);
  });

  it('passes lint for actionable fixture tasks at a valid threshold', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'agentinbox-lint-'));
    const output = execFileSync(process.execPath, [cliPath.pathname, 'lint', 'fixtures/inbox', '--fail-under', '60', '--out', outDir], { encoding: 'utf8' });
    assert.match(output, /lint passed/);
  });

  it('rejects malformed or missing lint thresholds', () => {
    for (const args of [['--fail-under', '60junk'], ['--fail-under']]) {
      const result = spawnSync(process.execPath, [cliPath.pathname, 'lint', 'fixtures/inbox', ...args], { encoding: 'utf8' });
      assert.equal(result.status, 2);
      assert.match(result.stderr, /--fail-under must be a number/);
    }
  });
});
