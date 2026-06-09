# Orchestration Plan

`agentinbox` turns inbox-style markdown into structured agent handoff data.

1. Collect markdown inbox files from the local workflow or CI artifact.
2. Parse them with the CLI after `npm run build`.
3. Feed the resulting structured data into the consuming agent, dashboard, or audit step.
4. Run `npm run release:check` before publishing so parser tests, build output, and package contents stay in sync.

The parser should stay deterministic. Integrations that trigger actions from inbox entries should add their own authorization and retry policy outside this package.
