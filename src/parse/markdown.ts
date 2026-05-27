import path from "node:path";
import type { TaskRecord } from "../types.js";
import {
  compactLines,
  extractAcceptanceCriteria,
  extractLabels,
  extractRepoScope,
  extractVerificationHints,
  inferRisk,
  slugify
} from "./helpers.js";

interface Section {
  title: string;
  body: string;
  line: number;
}

function splitSections(text: string): Section[] {
  const lines = text.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section | undefined;

  lines.forEach((line, index) => {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current) {
        sections.push(current);
      }
      current = { title: heading[1].trim(), body: "", line: index + 1 };
      return;
    }
    if (current) {
      current.body += `${line}\n`;
    }
  });

  if (current) {
    sections.push(current);
  }

  return sections.length > 0
    ? sections
    : [{ title: path.basename("note"), body: text, line: 1 }];
}

export function parseMarkdown(filePath: string, text: string): TaskRecord[] {
  const fallbackTitle = path.basename(filePath, path.extname(filePath));
  return splitSections(text).map((section, index) => {
    const body = compactLines(section.body);
    const combined = `${section.title}\n${body}`;
    const title = section.title || fallbackTitle;
    return {
      id: `${slugify(fallbackTitle)}-${slugify(title) || index + 1}`,
      title,
      body,
      source: { path: filePath, line: section.line },
      kind: "markdown",
      labels: extractLabels(combined),
      acceptanceCriteria: extractAcceptanceCriteria(combined),
      repoScope: extractRepoScope(combined),
      risk: inferRisk(combined),
      verificationHints: extractVerificationHints(combined),
      metadata: {}
    };
  });
}
