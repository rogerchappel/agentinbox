import type { ScanSummary, ScoredTask } from "./types.js";

function linesForTask(task: ScoredTask): string[] {
  const lines = [
    `## ${task.title}`,
    "",
    `- ID: ${task.id}`,
    `- Score: ${task.score}`,
    `- Risk: ${task.risk}`,
    `- Source: ${task.source.path}${task.source.line ? `:${task.source.line}` : ""}`
  ];
  if (task.repoScope) {
    lines.push(`- Scope: ${task.repoScope}`);
  }
  if (task.labels.length > 0) {
    lines.push(`- Labels: ${task.labels.join(", ")}`);
  }
  if (task.body) {
    lines.push("", task.body);
  }
  if (task.acceptanceCriteria.length > 0) {
    lines.push("", "### Acceptance Criteria", ...task.acceptanceCriteria.map((item) => `- [ ] ${item}`));
  }
  if (task.verificationHints.length > 0) {
    lines.push("", "### Verification", ...task.verificationHints.map((item) => `- ${item}`));
  }
  if (task.findings.length > 0) {
    lines.push("", "### Findings", ...task.findings.map((finding) => `- ${finding.severity}: ${finding.message}`));
  }
  return lines;
}

export function renderMarkdownSummary(summary: ScanSummary): string {
  const header = [
    "# Agent Inbox",
    "",
    `Input: ${summary.input}`,
    `Tasks: ${summary.taskCount}`,
    `Average score: ${summary.averageScore}`,
    ""
  ];
  return `${[...header, ...summary.tasks.flatMap(linesForTask)].join("\n").trim()}\n`;
}

export function renderQueue(summary: ScanSummary): string {
  const rows = summary.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    score: task.score,
    risk: task.risk,
    scope: task.repoScope ?? null,
    verification: task.verificationHints,
    findings: task.findings.map((finding) => finding.code)
  }));
  return `${JSON.stringify({ generatedAt: summary.generatedAt, tasks: rows }, null, 2)}\n`;
}
