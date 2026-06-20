# Input Formats

AgentInbox accepts local files and directories. Directory scans recurse into supported files and sort paths for deterministic output.

## Markdown And Text

Top-level `#` headings create task records. Lower headings remain part of the task body so sections such as `## Acceptance Criteria` and `## Verification` are not split into separate tasks.

Recognized hints:

- `Repo:`, `Repository:`, `Worktree:`, or `Scope:` for repository scope.
- `Labels:` or `Tags:` for labels.
- Checklist items under `Acceptance Criteria`, `Done When`, or `Definition of Done`.
- Common commands such as `npm test`, `npm run check`, `pytest`, and `bash scripts/validate.sh`.

## JSON

JSON inputs may be a single object, an array of objects, or an object with `tasks`, `items`, or `issues`.

Common fields:

- `id`
- `title`, `name`, or `summary`
- `body`, `description`, `content`, or `text`
- `labels`
- `acceptanceCriteria` or `acceptance_criteria`
- `verification`
- `repoScope`, `scope`, or `repo`

## JSONL

Each non-empty line is parsed as one JSON task. Invalid JSON fails fast so callers can fix the queue before handing it to an agent.
