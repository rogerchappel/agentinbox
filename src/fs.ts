import { promises as fs } from "node:fs";
import path from "node:path";
import type { InputKind } from "./types.js";

const SUPPORTED_EXTENSIONS = new Map<string, InputKind>([
  [".md", "markdown"],
  [".markdown", "markdown"],
  [".json", "json"],
  [".jsonl", "jsonl"],
  [".txt", "text"]
]);

export interface InputFile {
  path: string;
  kind: InputKind;
  text: string;
}

export function detectKind(filePath: string): InputKind | undefined {
  return SUPPORTED_EXTENSIONS.get(path.extname(filePath).toLowerCase());
}

export async function discoverInputs(inputPath: string): Promise<string[]> {
  const root = path.resolve(inputPath);
  const rootStat = await fs.stat(root);
  if (rootStat.isFile()) {
    return detectKind(root) ? [root] : [];
  }

  const rootRealPath = await fs.realpath(root);
  const visited = new Set<string>();
  const discovered = new Set<string>();

  async function walk(directory: string): Promise<void> {
    const realDirectory = await fs.realpath(directory);
    // Symlinked directories must remain within the selected tree, and revisits
    // (including links to ancestors) are skipped.
    if (realDirectory !== rootRealPath && !realDirectory.startsWith(`${rootRealPath}${path.sep}`)) return;
    if (visited.has(realDirectory)) return;
    visited.add(realDirectory);

    const entries = await fs.readdir(directory, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        let target;
        try {
          target = await fs.stat(fullPath);
        } catch {
          return; // Ignore dangling links.
        }
        if (target.isDirectory()) await walk(fullPath);
        else if (target.isFile() && detectKind(fullPath)) discovered.add(fullPath);
      } else if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && detectKind(fullPath)) {
        discovered.add(fullPath);
      }
    }));
  }

  await walk(root);
  return [...discovered].sort((a, b) => a.localeCompare(b));
}

export async function readInput(filePath: string): Promise<InputFile> {
  const kind = detectKind(filePath);
  if (!kind) {
    throw new Error(`Unsupported input file: ${filePath}`);
  }

  return {
    path: filePath,
    kind,
    text: await fs.readFile(filePath, "utf8")
  };
}
