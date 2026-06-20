# AgentInbox Skill

## When To Use

Use this skill before handing messy task inputs to a coding agent. It is useful for GitHub issue exports, chat snippets, copied terminal transcripts, JSON queues, and Markdown notes that need clear acceptance criteria and verification commands.

## Required Inputs

- A local file or directory containing `.md`, `.txt`, `.json`, or `.jsonl` task inputs.
- Optional score threshold for `agentinbox lint`.
- Optional output directory for generated inbox artifacts.

## Side-Effect Boundaries

AgentInbox is local-first. It reads local task files and writes local summaries only. It does not call external services, post to issue trackers, run package publishing commands, or modify source repositories named inside task text.

## Approval Requirements

No approval is needed for local scans or generated briefs. Get explicit human approval before using the generated queue to trigger another agent, open external tickets, or write to a connector-backed system.

## Workflow

1. Run `agentinbox scan <input> --out .agentinbox`.
2. Review `.agentinbox/brief.md` for missing acceptance criteria, vague scope, or absent verification hints.
3. Run `agentinbox lint <input> --fail-under 75 --out .agentinbox`.
4. Hand `.agentinbox/queue.json` to a runner only after the findings are acceptable.

## Examples

```sh
agentinbox scan fixtures/inbox --out tmp/inbox
agentinbox brief fixtures/inbox/github-issue.json --format markdown
agentinbox lint fixtures/inbox --fail-under 60
```

## Validation

Run the full local release check before relying on a packaged build:

```sh
npm run release:check
```
