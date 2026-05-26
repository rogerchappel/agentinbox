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
  const stat = await fs.stat(inputPath);
  if (stat.isFile()) {
    return detectKind(inputPath) ? [inputPath] : [];
  }

  const entries = await fs.readdir(inputPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(inputPath, entry.name);
      if (entry.isDirectory()) {
        return discoverInputs(fullPath);
      }
      return detectKind(fullPath) ? [fullPath] : [];
    })
  );

  return nested.flat().sort((a, b) => a.localeCompare(b));
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
