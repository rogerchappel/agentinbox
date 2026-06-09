# Task Breakdown

## Release readiness

- Keep parser fixtures aligned with the markdown inbox formats documented in the README.
- Run `npm run release:check` before publishing or tagging a release candidate.
- Use `npm run package:smoke` to confirm the package includes compiled output and support docs.

## Follow-up candidates

- Add malformed-message fixtures for recovery behavior.
- Expand smoke coverage for multi-message inboxes and empty inbox handling.
