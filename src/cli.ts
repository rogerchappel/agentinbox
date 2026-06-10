#!/usr/bin/env node
import { scanInbox } from "./index.js";

function help(): string {
  return `agentinbox

Usage:
  agentinbox scan <input> --out <dir>
  agentinbox --help

Commands:
  scan    Parse local task notes into a deterministic inbox.json summary.
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
  if (command !== "scan" || !input) {
    process.stderr.write("agentinbox: expected `scan <input>`\n");
    return 2;
  }

  const outDir = readOption(argv, "--out") ?? "agentinbox-out";
  const summary = await scanInbox({ input, outDir });
  process.stdout.write(`Wrote ${summary.taskCount} task(s) to ${outDir}/inbox.json\n`);
  return summary.taskCount === 0 ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
