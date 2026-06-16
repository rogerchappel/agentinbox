# Release Readiness

Use this checklist before publishing, tagging, or asking reviewers to trust the package surface.

## Package Surface

- Package: `agentinbox`
- Repository: `https://github.com/rogerchappel/agentinbox`
- Pack contents are constrained by the `files` allowlist in `package.json`.

## CLI Surface

- `agentinbox` -> `./dist/src/cli.js`

## Verification Commands

- `npm run check`: `tsc -p tsconfig.json --noEmit`
- `npm run test`: `npm run build && node --test dist/test/*.test.js`
- `npm run build`: `tsc -p tsconfig.json`
- `npm run smoke`: `npm run build && bash scripts/smoke.sh`
- `npm run package:smoke`: `npm run build && npm pack --dry-run`
- `npm run release:check`: `npm run check && npm test && npm run smoke && npm run package:smoke`

Run `npm run release:check` before opening a release PR. Record any skipped command and the reason in the PR body.

## Reviewer Notes

- Compare README examples with the current CLI bins or module exports.
- Confirm `npm test` runs the compiled CLI against `fixtures/inbox` and checks the deterministic `inbox.json` summary.
- Inspect `npm pack --dry-run` output for generated logs, caches, or private fixtures.
- Confirm CI exercises the same release check path used locally.
