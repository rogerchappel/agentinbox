# Task Breakdown

## Release readiness

- Keep parser fixtures aligned with Markdown, text transcript, JSON, and JSONL inbox formats documented in the README.
- Ensure `scan` writes `inbox.json`, `brief.md`, and `queue.json`.
- Ensure `brief` supports Markdown and JSON output.
- Ensure `lint` exits nonzero when a task falls below the requested threshold.
- Run `npm run release:check` before publishing or tagging a release candidate.
- Use `npm run package:smoke` to confirm the package includes compiled output and support docs.

## Follow-up candidates

- Add malformed-message fixtures for recovery behavior.
- Expand smoke coverage for multi-message inboxes and empty inbox handling.
- Add optional SARIF-like findings output for CI comments.
