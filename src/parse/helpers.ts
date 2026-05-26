export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function compactLines(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function extractLabels(text: string): string[] {
  const labels = new Set<string>();
  for (const match of text.matchAll(/(?:^|\s)(?:labels?|tags?)\s*:\s*([^\n]+)/gim)) {
    for (const raw of match[1].split(/[,#]/)) {
      const label = raw.trim().replace(/^[-*]\s*/, "");
      if (label) {
        labels.add(label.toLowerCase());
      }
    }
  }
  for (const match of text.matchAll(/#([a-z][a-z0-9-]+)/gi)) {
    labels.add(match[1].toLowerCase());
  }
  return [...labels].sort();
}

export function extractAcceptanceCriteria(text: string): string[] {
  const criteria: string[] = [];
  const lines = text.split(/\r?\n/);
  let inCriteria = false;

  for (const line of lines) {
    if (/^#{1,6}\s*(acceptance criteria|done when|definition of done)\b/i.test(line.trim())) {
      inCriteria = true;
      continue;
    }
    if (inCriteria && /^#{1,6}\s+/.test(line.trim())) {
      inCriteria = false;
    }
    const checklist = line.match(/^\s*[-*]\s+\[(?: |x|X)\]\s+(.+)$/);
    const bullet = inCriteria ? line.match(/^\s*[-*]\s+(.+)$/) : undefined;
    const criterion = checklist?.[1] ?? bullet?.[1];
    if (criterion) {
      criteria.push(criterion.trim());
    }
  }

  return [...new Set(criteria)];
}

export function extractVerificationHints(text: string): string[] {
  const hints = new Set<string>();
  const patterns = [
    /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:test|check|build|lint|smoke)\b[^\n]*/gi,
    /\b(?:pytest|cargo test|go test|swift test|bash\s+scripts\/[a-z0-9._/-]+)\b[^\n]*/gi
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      hints.add(match[0].trim().replace(/[.)]+$/, ""));
    }
  }
  return [...hints].sort();
}

export function extractRepoScope(text: string): string | undefined {
  const direct = text.match(/\b(?:repo|repository|worktree|scope)\s*:\s*([^\n]+)/i);
  if (direct) {
    return direct[1].trim();
  }
  const pathLike = text.match(/(?:^|\s)(\/[A-Za-z0-9._/-]+\/[A-Za-z0-9._/-]+)/);
  return pathLike?.[1];
}

export function inferRisk(text: string): "low" | "medium" | "high" {
  if (/\b(auth|security|payment|delete|destructive|production|secret|migration)\b/i.test(text)) {
    return "high";
  }
  if (/\b(api|database|config|release|publish|public)\b/i.test(text)) {
    return "medium";
  }
  return "low";
}
