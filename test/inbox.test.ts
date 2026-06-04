import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('agentinbox', () => {
  it('package.json should have all required metadata', () => {
    const pkg = JSON.parse(require('fs').readFileSync(require.resolve('../package.json'), 'utf8'));
    assert.ok(pkg.name);
    assert.ok(pkg.author && pkg.author !== 'StackForge User');
    assert.ok(pkg.repository);
    assert.ok(pkg.scripts.test);
    assert.ok(pkg.scripts.build);
    assert.ok(pkg.scripts['release:check']);
  });

  it('build should succeed', () => {
    const { execSync } = require('child_process');
    execSync('npm run build', { encoding: 'utf8' });
    assert.ok(true, 'build passed');
  });
});
