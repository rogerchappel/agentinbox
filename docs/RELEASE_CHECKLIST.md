# Release Checklist

Use this checklist before publishing or announcing AgentInbox.

1. Install dependencies with `npm ci`.
2. Run `npm run release:check`.
3. Run `bash scripts/validate.sh`.
4. Confirm `npm run package:smoke` lists `dist/src/index.js`, `dist/src/cli.js`, and fixtures.
5. Re-run the fixture scan and inspect `tmp/smoke/inbox.json` for deterministic output.
