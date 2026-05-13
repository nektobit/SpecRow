import { constants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createDefaultConfig, parseConfig, serializeConfig } from "./config.js";
import { getSpecRowTemplate } from "./templates.js";

export interface InitOptions {
  cwd?: string;
  force?: boolean;
  language?: string;
}

export interface InitResult {
  root: string;
  configPath: string;
  projectPath: string;
  configCreated: boolean;
  configOverwritten: boolean;
  projectCreated: boolean;
  directories: string[];
  language: string;
}

const SPECROW_DIR = ".specrow";
const SPECROW_SUBDIRECTORIES = ["specs", "changes", "archive"] as const;

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

export async function initSpecRowProject(options: InitOptions = {}): Promise<InitResult> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const specrowRoot = path.join(root, SPECROW_DIR);
  const directories = SPECROW_SUBDIRECTORIES.map((directory) => path.join(specrowRoot, directory));
  const configPath = path.join(specrowRoot, "config.yml");
  const projectPath = path.join(specrowRoot, "project.md");

  await mkdir(specrowRoot, { recursive: true });

  const configExists = await pathExists(configPath);
  const shouldWriteConfig = options.force === true || !configExists;
  const config = shouldWriteConfig ? createDefaultConfig(options.language) : parseConfig(await readFile(configPath, "utf8"));
  const projectTemplate = getSpecRowTemplate(config.language, "project");

  for (const directory of directories) {
    await mkdir(directory, { recursive: true });
  }

  if (shouldWriteConfig) {
    await writeFile(configPath, serializeConfig(config), "utf8");
  }

  const projectExists = await pathExists(projectPath);

  if (!projectExists) {
    await writeFile(projectPath, projectTemplate, "utf8");
  }

  return {
    root: specrowRoot,
    configPath,
    projectPath,
    configCreated: !configExists,
    configOverwritten: configExists && options.force === true,
    projectCreated: !projectExists,
    directories,
    language: config.language
  };
}
