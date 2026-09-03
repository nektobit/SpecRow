import { execFile } from "node:child_process";
import { copyFile, mkdtemp, mkdir, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const tempDirs: string[] = [];

async function createTempDir(prefix: string): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("packaged Codex CLI adapter", () => {
  it("runs a local lifecycle without node_modules", async () => {
    const skillRoot = await createTempDir("specrow-codex-skill-");
    const projectContainer = await createTempDir("specrow-codex-project-");
    const projectRoot = path.join(projectContainer, "project with spaces");
    const scriptsRoot = path.join(skillRoot, "scripts");
    const cliPath = path.join(scriptsRoot, "specrow-cli.cjs");
    await mkdir(scriptsRoot, { recursive: true });
    await mkdir(projectRoot, { recursive: true });
    await copyFile(path.resolve("skills", "specrow", "scripts", "specrow-cli.cjs"), cliPath);

    const version = await execFileAsync(process.execPath, [cliPath, "--version"], { cwd: projectRoot });
    expect(version.stdout.trim()).toBe("0.2.0");

    await execFileAsync(process.execPath, [cliPath, "init", "--language", "ru"], { cwd: projectRoot });
    await execFileAsync(process.execPath, [cliPath, "proposal", "catalog-install"], { cwd: projectRoot });
    await execFileAsync(process.execPath, [cliPath, "validate", "catalog-install"], { cwd: projectRoot });
    await execFileAsync(process.execPath, [cliPath, "review", "catalog-install"], { cwd: projectRoot });
    await execFileAsync(process.execPath, [cliPath, "build-start", "catalog-install"], { cwd: projectRoot });
    await execFileAsync(process.execPath, [cliPath, "build-finish", "catalog-install"], { cwd: projectRoot });

    await expect(execFileAsync(process.execPath, [cliPath, "accept", "catalog-install"], { cwd: projectRoot })).rejects.toMatchObject({
      code: 1
    });

    await execFileAsync(process.execPath, [cliPath, "accept", "catalog-install", "--yes"], { cwd: projectRoot });
    const status = await execFileAsync(process.execPath, [cliPath, "status", "catalog-install"], { cwd: projectRoot });
    await execFileAsync(process.execPath, [cliPath, "archive", "catalog-install"], { cwd: projectRoot });

    expect(status.stdout).toContain("catalog-install");
    expect(await readFile(path.join(projectRoot, ".specrow", "config.yml"), "utf8")).toContain("language: ru");
    await expect(stat(path.join(projectRoot, ".specrow", "archive", "catalog-install"))).resolves.toBeTruthy();
  });
});
