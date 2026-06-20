import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { discoverInputs, readInput } from "./fs.js";
import { parseJsonLines, parseJsonTasks } from "./parse/json.js";
import { parseMarkdown } from "./parse/markdown.js";
import type { ScanOptions, ScanSummary, ScoredTask, TaskRecord } from "./types.js";

function scoreTask(task: TaskRecord): ScoredTask {
  const findings = [];
  let score = 100;

  if (task.acceptanceCriteria.length === 0) {
    score -= 25;
    findings.push({
      code: "missing-acceptance-criteria",
      severity: "warning" as const,
      message: "Task has no acceptance criteria checklist."
    });
  }
  if (!task.repoScope) {
    score -= 15;
    findings.push({
      code: "missing-repo-scope",
      severity: "info" as const,
      message: "Task does not name a repository or path scope."
    });
  }
  if (task.verificationHints.length === 0) {
    score -= 15;
    findings.push({
      code: "missing-verification",
      severity: "warning" as const,
      message: "Task does not include a verification command."
    });
  }

  return { ...task, score: Math.max(0, score), findings };
}

export async function scanInbox(options: ScanOptions): Promise<ScanSummary> {
  const files = await discoverInputs(options.input);
  const tasks: ScoredTask[] = [];

  for (const file of files) {
    const input = await readInput(file);
    if (input.kind === "markdown" || input.kind === "text") {
      tasks.push(...parseMarkdown(input.path, input.text).map(scoreTask));
    } else if (input.kind === "json") {
      tasks.push(...parseJsonTasks(input.path, input.text).map(scoreTask));
    } else if (input.kind === "jsonl") {
      tasks.push(...parseJsonLines(input.path, input.text).map(scoreTask));
    }
  }

  const averageScore =
    tasks.length === 0
      ? 0
      : Math.round(tasks.reduce((total, task) => total + task.score, 0) / tasks.length);

  const summary: ScanSummary = {
    generatedAt: new Date(0).toISOString(),
    input: options.input,
    taskCount: tasks.length,
    averageScore,
    tasks
  };

  await mkdir(options.outDir, { recursive: true });
  await writeFile(path.join(options.outDir, "inbox.json"), `${JSON.stringify(summary, null, 2)}\n`);

  return summary;
}

export type { ScanSummary, ScoredTask, TaskRecord } from "./types.js";
