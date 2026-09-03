import { constants } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface McpRoot {
  uri: string;
  name?: string;
}

export type McpRootsProvider = () => Promise<readonly McpRoot[]>;

export async function resolveSpecRowMcpProjectRoot(
  projectPath?: string,
  env: NodeJS.ProcessEnv = process.env
): Promise<string> {
  const requested = projectPath ?? env.SPECROW_PROJECT_ROOT ?? process.cwd();
  return assertProjectDirectory(requested);
}

export async function resolveRequestProjectRoot(options: {
  requestedProjectRoot?: string;
  defaultProjectRoot: string;
  listRoots?: McpRootsProvider;
  allowDefaultProjectRoot?: boolean;
}): Promise<string> {
  const roots = await safeListRoots(options.listRoots);
  const filesystemRoots = await Promise.all(
    roots.map(async (root) => {
      try {
        return await assertProjectDirectory(fileURLToPath(root.uri));
      } catch {
        return undefined;
      }
    })
  );
  const candidates = [...new Set(filesystemRoots.filter((root): root is string => root !== undefined))];

  if (options.requestedProjectRoot !== undefined) {
    if (!path.isAbsolute(options.requestedProjectRoot)) {
      throw new Error("SpecRow project root must be an absolute filesystem path.");
    }

    const requested = await assertProjectDirectory(options.requestedProjectRoot);

    if (candidates.length > 0 && !candidates.some((root) => isPathInside(root, requested))) {
      throw new Error(
        `SpecRow project root "${requested}" is outside the workspace roots announced by the MCP client.`
      );
    }

    return requested;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length > 1) {
    const initialized = [];

    for (const candidate of candidates) {
      if (await isInitializedSpecRowProject(candidate)) {
        initialized.push(candidate);
      }
    }

    if (initialized.length === 1) {
      return initialized[0];
    }

    throw new Error(
      "Multiple MCP workspace roots are available. Pass the absolute projectRoot to the SpecRow tool call."
    );
  }

  if (options.allowDefaultProjectRoot === false) {
    throw new Error(
      "The MCP client did not provide a workspace root. Pass the absolute projectRoot to the SpecRow tool call."
    );
  }

  return assertProjectDirectory(options.defaultProjectRoot);
}

async function assertProjectDirectory(projectPath: string): Promise<string> {
  const requested = path.resolve(projectPath);

  let root: string;
  let rootStat: Awaited<ReturnType<typeof stat>>;
  try {
    root = await realpath(requested);
    rootStat = await stat(root);
  } catch {
    throw new Error(`Invalid SpecRow project root "${requested}": directory does not exist.`);
  }

  if (!rootStat.isDirectory()) {
    throw new Error(`Invalid SpecRow project root "${root}": expected a directory.`);
  }

  return root;
}

async function safeListRoots(provider: McpRootsProvider | undefined): Promise<readonly McpRoot[]> {
  if (provider === undefined) {
    return [];
  }

  try {
    return await provider();
  } catch {
    return [];
  }
}

async function isInitializedSpecRowProject(projectRoot: string): Promise<boolean> {
  const required = [
    path.join(projectRoot, ".specrow", "config.yml"),
    path.join(projectRoot, ".specrow", "project.md")
  ];

  for (const targetPath of required) {
    try {
      await access(targetPath, constants.F_OK);
    } catch {
      return false;
    }
  }

  return true;
}

function isPathInside(root: string, targetPath: string): boolean {
  const relativePath = path.relative(root, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}
