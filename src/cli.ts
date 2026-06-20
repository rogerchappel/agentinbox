#!/usr/bin/env node
import { briefInbox, lintInbox, scanInbox } from "./index.js";

function help(): string {
  return `agentinbox

Usage:
  agentinbox scan <input> --out <dir>
  agentinbox brief <input> [--format markdown|json] [--out <dir>]
  agentinbox lint <input> [--fail-under 75] [--out <dir>]
  agentinbox --help

Commands:
  scan    Parse local task notes into inbox.json, brief.md, and queue.json.
  brief   Print a Markdown or JSON brief for agent handoff review.
  lint    Fail when any task scores below the requested threshold.
`;
}

function readOption(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(help());
    return 0;
  }

  const [command, input] = argv;
  if (!input || !["scan", "brief", "lint"].includes(command)) {
    process.stderr.write("agentinbox: expected `scan`, `brief`, or `lint` with an input path\n");
    return 2;
  }

  const outDir = readOption(argv, "--out") ?? "agentinbox-out";
  if (command === "scan") {
    const summary = await scanInbox({ input, outDir });
    process.stdout.write(`Wrote ${summary.taskCount} task(s) to ${outDir}/inbox.json, brief.md, and queue.json\n`);
    return summary.taskCount === 0 ? 1 : 0;
  }

  if (command === "brief") {
    const format = readOption(argv, "--format") === "json" ? "json" : "markdown";
    process.stdout.write(await briefInbox({ input, format, outDir }));
    return 0;
  }

  const failUnderRaw = readOption(argv, "--fail-under") ?? "75";
  const failUnder = Number.parseInt(failUnderRaw, 10);
  if (!Number.isFinite(failUnder)) {
    process.stderr.write("agentinbox: --fail-under must be a number\n");
    return 2;
  }
  const result = await lintInbox({ input, failUnder, outDir });
  if (result.ok) {
    process.stdout.write(`agentinbox lint passed: ${result.summary.taskCount} task(s), average ${result.summary.averageScore}\n`);
    return 0;
  }
  for (const task of result.failures) {
    process.stderr.write(`${task.id}: score ${task.score} is below ${failUnder}\n`);
  }
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
