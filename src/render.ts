import type { ScanSummary, ScoredTask } from "./types.js";

const riskRank: Record<ScoredTask["risk"], number> = {
  low: 0,
  medium: 1,
  high: 2
};

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

export function orderedPlanTasks(summary: ScanSummary): ScoredTask[] {
  return [...summary.tasks].sort((left, right) => {
    const riskDelta = riskRank[left.risk] - riskRank[right.risk];
    if (riskDelta !== 0) {
      return riskDelta;
    }
    const scoreDelta = right.score - left.score;
    return scoreDelta === 0 ? left.id.localeCompare(right.id) : scoreDelta;
  });
}

export function renderPlanMarkdown(summary: ScanSummary): string {
  const lines = [
    "# Agent Action Plan",
    "",
    `Input: ${summary.input}`,
    `Tasks: ${summary.taskCount}`,
    ""
  ];
  for (const [index, task] of orderedPlanTasks(summary).entries()) {
    lines.push(
      `## ${index + 1}. ${task.title}`,
      "",
      `- ID: ${task.id}`,
      `- Risk: ${task.risk}`,
      `- Score: ${task.score}`,
      `- Source: ${task.source.path}${task.source.line ? `:${task.source.line}` : ""}`,
      `- Scope: ${task.repoScope ?? "unspecified"}`
    );
    if (task.acceptanceCriteria.length > 0) {
      lines.push("- Acceptance:", ...task.acceptanceCriteria.map((item) => `  - ${item}`));
    }
    if (task.verificationHints.length > 0) {
      lines.push("- Verification:", ...task.verificationHints.map((item) => `  - ${item}`));
    }
    if (task.findings.length > 0) {
      lines.push("- Preflight fixes:", ...task.findings.map((finding) => `  - ${finding.code}`));
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

export function renderPlanJson(summary: ScanSummary): string {
  const tasks = orderedPlanTasks(summary).map((task, index) => ({
    order: index + 1,
    id: task.id,
    title: task.title,
    risk: task.risk,
    score: task.score,
    scope: task.repoScope ?? null,
    source: task.source,
    acceptanceCriteria: task.acceptanceCriteria,
    verification: task.verificationHints,
    preflightFindings: task.findings.map((finding) => finding.code)
  }));
  return `${JSON.stringify({ generatedAt: summary.generatedAt, input: summary.input, tasks }, null, 2)}\n`;
}
