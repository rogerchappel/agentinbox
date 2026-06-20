import path from "node:path";
import type { InputKind, TaskRecord } from "../types.js";
import {
  compactLines,
  extractAcceptanceCriteria,
  extractLabels,
  extractRepoScope,
  extractVerificationHints,
  inferRisk,
  slugify
} from "./helpers.js";

type JsonTask = Record<string, unknown>;

function textField(task: JsonTask, names: string[]): string | undefined {
  for (const name of names) {
    const value = task[name];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function candidateTasks(value: unknown): JsonTask[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is JsonTask => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const root = value as JsonTask;
    const nested = root.tasks ?? root.items ?? root.issues;
    if (Array.isArray(nested)) {
      return candidateTasks(nested);
    }
    return [root];
  }
  return [];
}

export function parseJsonTasks(filePath: string, text: string, kind: InputKind = "json"): TaskRecord[] {
  const fallbackTitle = path.basename(filePath, path.extname(filePath));
  const parsed = JSON.parse(text) as unknown;
  return candidateTasks(parsed).map((task, index) => {
    const title = textField(task, ["title", "name", "summary"]) ?? `${fallbackTitle} ${index + 1}`;
    const body = compactLines(textField(task, ["body", "description", "content", "text"]) ?? "");
    const combined = `${title}\n${body}`;
    const acceptanceCriteria =
      stringArray(task.acceptanceCriteria).length > 0
        ? stringArray(task.acceptanceCriteria)
        : stringArray(task.acceptance_criteria).length > 0
          ? stringArray(task.acceptance_criteria)
          : extractAcceptanceCriteria(combined);
    const verificationHints =
      stringArray(task.verification).length > 0 ? stringArray(task.verification) : extractVerificationHints(combined);
    return {
      id: textField(task, ["id"]) ?? `${slugify(fallbackTitle)}-${slugify(title) || index + 1}`,
      title,
      body,
      source: { path: filePath },
      kind,
      labels: [...new Set([...stringArray(task.labels), ...extractLabels(combined)])].sort(),
      acceptanceCriteria,
      repoScope: textField(task, ["repoScope", "scope", "repo"]) ?? extractRepoScope(combined),
      risk: inferRisk(`${combined}\n${String(task.risk ?? "")}`),
      verificationHints,
      metadata: {}
    };
  });
}

export function parseJsonLines(filePath: string, text: string): TaskRecord[] {
  const tasks: TaskRecord[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) {
      return;
    }
    const [task] = parseJsonTasks(filePath, line, "jsonl");
    if (task) {
      tasks.push({ ...task, source: { path: filePath, line: index + 1 } });
    }
  });
  return tasks;
}
