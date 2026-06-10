#!/usr/bin/env bash
set -euo pipefail

rm -rf tmp/smoke
node dist/src/cli.js scan fixtures/inbox --out tmp/smoke
test -s tmp/smoke/inbox.json
grep -q '"taskCount": 3' tmp/smoke/inbox.json
