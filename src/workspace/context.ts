import { readFile } from "node:fs/promises";
import path from "node:path";

import { loadSpecRowConfig } from "../config.js";
import { listActiveChanges, readChangeStatus } from "../lifecycle.js";

const SPECROW_DIR = ".specrow";

export async function buildSpecRowContext(
  projectPath: string,
  changeName?: string
): Promise<Record<string, unknown>> {
  const projectRoot = path.resolve(projectPath);
  const config = await loadSpecRowConfig(projectRoot);
  const context: Record<string, unknown> = {
    specrow: {
      root: relative(projectRoot, path.join(projectRoot, SPECROW_DIR)),
      config
    },
    activeChanges: await listActiveChanges(projectRoot)
  };

  if (changeName !== undefined) {
    const changeRoot = path.join(projectRoot, SPECROW_DIR, "changes", changeName);
    context.change = {
      root: relative(projectRoot, changeRoot),
      status: await readChangeStatus(projectRoot, changeName),
      proposal: await readFile(path.join(changeRoot, "proposal.md"), "utf8"),
      tasks: await readFile(path.join(changeRoot, "tasks.md"), "utf8")
    };
  }

  return context;
}

function relative(projectRoot: string, targetPath: string): string {
  return path.relative(projectRoot, targetPath) || ".";
}
