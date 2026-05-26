# AgentInbox PRD

Status: in-progress

## Summary

AgentInbox is a local-first CLI that turns scattered agent task inputs into a clean, reviewable inbox. It ingests Markdown, JSON, and plain-text notes from issues, chat exports, or terminal transcripts, normalizes them into task cards, detects missing acceptance criteria, and exports deterministic briefs for coding agents.

## Problem

Agentic coding workflows increasingly span terminal agents, GitHub task delegation, desktop session managers, and orchestrators. The handoff quality is uneven: tasks arrive as vague chat snippets, issue comments, or copied prompts. Developers need a small local tool that makes those requests concrete before an agent starts editing files.

## Goals

- Parse local `.md`, `.txt`, `.json`, and `.jsonl` inputs into normalized task records.
- Score each task for actionability, acceptance criteria, repo scope, risk, and verification hints.
- Emit Markdown briefs, JSON summaries, and a queue file suitable for local agent runners.
- Provide fixture-backed tests for noisy chat, GitHub issue export, and terminal transcript inputs.
- Never call external services or send private text off machine.

## Non-Goals

- No hosted sync service.
- No direct GitHub writes in V1.
- No LLM dependency.

## CLI

```bash
agentinbox scan fixtures/inbox --out tmp/inbox
agentinbox brief fixtures/inbox/github-issue.md --format markdown
agentinbox lint fixtures/inbox --fail-under 75
```

## MVP Requirements

- TypeScript Node CLI with `scan`, `brief`, and `lint` commands.
- Deterministic parsers for Markdown headings, checklist items, labels, fenced JSON, and transcript speaker lines.
- Actionability scoring with explainable findings.
- Example inbox fixtures and snapshot-style tests.
- README with practical examples and privacy notes.

## Attribution

Inspired by the 2026 shift toward agent task delegation across GitHub agent sessions, terminal agents, and multi-agent orchestrators. Reframed as a tiny local preflight inbox rather than another hosted agent platform.
