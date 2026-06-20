# agentinbox

Local-first task inbox and brief generator for coding agents. Point it at messy task notes, issue exports, chat snippets, or terminal transcripts and get deterministic task records with actionability scores.

## Quickstart

```sh
npm install
npm run build
npx agentinbox scan fixtures/inbox --out tmp/inbox
```

The scan writes:

- `inbox.json`: complete scored task records.
- `brief.md`: reviewable Markdown handoff.
- `queue.json`: compact queue records for local runners.

## CLI

```sh
agentinbox scan <input> --out <dir>
agentinbox brief <input> --format markdown
agentinbox brief <input> --format json
agentinbox lint <input> --fail-under 75
```

Inputs can be `.md`, `.txt`, `.json`, or `.jsonl` files, or directories containing those files.

## Examples

```sh
agentinbox scan fixtures/inbox --out tmp/inbox
agentinbox brief fixtures/inbox/github-issue.json --format markdown
agentinbox lint fixtures/inbox --fail-under 60
```

## Scoring

Each task starts at 100. AgentInbox subtracts points for missing acceptance criteria, absent repository or path scope, and missing verification hints. Findings are explicit so humans can improve the request before an agent starts work.

## Safety Notes

- No network calls are made by default.
- AgentInbox never posts to external systems.
- Generated queues are advisory; review them before using another agent or connector.
- The tool does not execute verification commands mentioned in task text.

## Verify

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
```

## Limitations

- Parsing is deterministic and heuristic-based, not an LLM review.
- JSON field recognition is intentionally small and documented by fixtures.
- Scores identify handoff quality, not task priority or business value.

## License

MIT
