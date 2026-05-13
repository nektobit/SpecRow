import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createDefaultConfig, serializeConfig } from "./config.js";

export interface InitOptions {
  cwd?: string;
  force?: boolean;
  language?: string;
}

export interface InitResult {
  root: string;
  configPath: string;
  configCreated: boolean;
  configOverwritten: boolean;
  directories: string[];
}

const SPECFLY_DIR = ".specfly";
const SPECFLY_SUBDIRECTORIES = ["specs", "changes", "archive"] as const;

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

export async function initSpecFlyProject(options: InitOptions = {}): Promise<InitResult> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const specflyRoot = path.join(root, SPECFLY_DIR);
  const directories = SPECFLY_SUBDIRECTORIES.map((directory) => path.join(specflyRoot, directory));
  const configPath = path.join(specflyRoot, "config.yml");
  const config = createDefaultConfig(options.language);

  await mkdir(specflyRoot, { recursive: true });

  for (const directory of directories) {
    await mkdir(directory, { recursive: true });
  }

  const configExists = await pathExists(configPath);
  const shouldWriteConfig = options.force === true || !configExists;

  if (shouldWriteConfig) {
    await writeFile(configPath, serializeConfig(config), "utf8");
  }

  return {
    root: specflyRoot,
    configPath,
    configCreated: !configExists,
    configOverwritten: configExists && options.force === true,
    directories
  };
}
