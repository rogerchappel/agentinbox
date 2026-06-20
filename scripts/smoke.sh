#!/usr/bin/env bash
set -euo pipefail

rm -rf tmp/smoke
node dist/src/cli.js scan fixtures/inbox --out tmp/smoke
test -s tmp/smoke/inbox.json
test -s tmp/smoke/brief.md
test -s tmp/smoke/queue.json
grep -q '"taskCount": 5' tmp/smoke/inbox.json
node dist/src/cli.js brief fixtures/inbox/github-issue.json --out tmp/smoke-brief > tmp/smoke-brief.md
grep -q "Add connector dry-run preview" tmp/smoke-brief.md
node dist/src/cli.js lint fixtures/inbox --fail-under 60 --out tmp/smoke-lint
