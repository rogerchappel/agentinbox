# Orchestration Plan

`agentinbox` turns local task notes into structured agent handoff data.

1. Collect Markdown, JSON, JSONL, or transcript text files from the local workflow or CI artifact.
2. Parse them with the CLI after `npm run build`.
3. Review `brief.md` and fix tasks with missing scope, acceptance criteria, or verification hints.
4. Feed `queue.json` into the consuming agent, dashboard, or audit step only after review.
5. Use `agentinbox lint <input> --fail-under 75` as a local quality gate.
6. Run `npm run release:check` before publishing so parser tests, build output, and package contents stay in sync.

The parser should stay deterministic. Integrations that trigger actions from inbox entries should add their own authorization and retry policy outside this package.
