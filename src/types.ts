export type InputKind = "markdown" | "json" | "jsonl" | "text";

export interface SourceRef {
  path: string;
  line?: number;
}

export interface Finding {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  body: string;
  source: SourceRef;
  kind: InputKind;
  labels: string[];
  acceptanceCriteria: string[];
  repoScope?: string;
  risk: "low" | "medium" | "high";
  verificationHints: string[];
  metadata: Record<string, string | number | boolean>;
}

export interface ScoredTask extends TaskRecord {
  score: number;
  findings: Finding[];
}

export interface ScanSummary {
  generatedAt: string;
  input: string;
  taskCount: number;
  averageScore: number;
  tasks: ScoredTask[];
}

export interface ScanOptions {
  input: string;
  outDir: string;
}

export interface BriefOptions {
  input: string;
  format: "markdown" | "json";
  outDir?: string;
}

export interface LintOptions {
  input: string;
  failUnder: number;
  outDir?: string;
}

export interface PlanOptions {
  input: string;
  format: "markdown" | "json";
  outDir?: string;
}
