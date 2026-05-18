import { constants } from "node:fs";
import { access, copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { loadSpecRowConfig } from "./config.js";
import { initSpecRowProject } from "./init.js";
import { serializeLifecycleStatus, type LifecycleStatus } from "./lifecycle.js";
import { getSpecRowMessage, getSpecRowTemplate } from "./templates.js";

export type MigrationSourceKind = "openspec" | "speckit" | "folder";

export interface MigrationSource {
  kind: MigrationSourceKind;
  root: string;
}

export interface MigrationOptions {
  cwd?: string;
  source?: string;
  sourceRoot?: string;
  language?: string;
  dryRun?: boolean;
  force?: boolean;
  now?: Date;
  allowExternalSource?: boolean;
}

export interface MigrationOperation {
  sourcePath: string;
  targetPath: string;
  kind: "archive" | "change" | "change-source" | "imported-doc" | "spec";
}

export interface MigrationSkippedOperation extends MigrationOperation {
  reason: string;
}

export interface MigrationResult {
  projectRoot: string;
  language: string;
  dryRun: boolean;
  initialized: boolean;
  wouldInitialize: boolean;
  source: MigrationSource;
  copied: MigrationOperation[];
  converted: MigrationOperation[];
  skipped: MigrationSkippedOperation[];
  warnings: string[];
}

interface MigrationContext {
  projectRoot: string;
  specrowRoot: string;
  language: string;
  source: MigrationSource;
  dryRun: boolean;
  force: boolean;
  now: Date;
  result: MigrationResult;
}

const SPECROW_DIR = ".specrow";
const DOCUMENTATION_EXTENSIONS = new Set([".adoc", ".asciidoc", ".markdown", ".md", ".mdx", ".rst", ".txt"]);
const SKIPPED_DIRECTORIES = new Set([".git", ".specrow", "node_modules"]);

export async function detectMigrationSource(options: MigrationOptions = {}): Promise<MigrationSource> {
  const projectRoot = path.resolve(options.cwd ?? process.cwd());
  const baseRoot = await resolveSourceBase(projectRoot, options);
  const source = options.source?.trim();

  if (source === undefined || source.length === 0 || source.toLowerCase() === "system") {
    return detectKnownSystem(baseRoot);
  }

  const system = source.toLowerCase();

  if (system === "openspec" || system === "open-spec") {
    return detectOpenSpec(baseRoot);
  }

  if (system === "speckit" || system === "spec-kit" || system === "specify") {
    return detectSpecKit(baseRoot);
  }

  const sourcePath = path.resolve(baseRoot, source);
  assertExternalSourceAllowed(projectRoot, sourcePath, options.allowExternalSource);
  await assertDirectory(sourcePath, `Migration source "${sourcePath}" does not exist or is not a directory.`);

  if (await looksLikeOpenSpecRoot(sourcePath)) {
    return { kind: "openspec", root: sourcePath };
  }

  if (await looksLikeSpecKitRoot(sourcePath)) {
    return { kind: "speckit", root: sourcePath };
  }

  assertNotSpecRowInternal(projectRoot, sourcePath);
  return { kind: "folder", root: sourcePath };
}

export async function runMigration(options: MigrationOptions = {}): Promise<MigrationResult> {
  const projectRoot = path.resolve(options.cwd ?? process.cwd());
  const dryRun = options.dryRun === true;
  const force = options.force === true;
  const source = await detectMigrationSource(options);
  assertNotSpecRowInternal(projectRoot, source.root);

  const initState = await ensureSpecRowInitialized(projectRoot, {
    dryRun,
    language: options.language
  });

  const specrowRoot = path.join(projectRoot, SPECROW_DIR);
  const result: MigrationResult = {
    projectRoot,
    language: initState.language,
    dryRun,
    initialized: initState.initialized,
    wouldInitialize: initState.wouldInitialize,
    source,
    copied: [],
    converted: [],
    skipped: [],
    warnings: []
  };
  const context: MigrationContext = {
    projectRoot,
    specrowRoot,
    language: initState.language,
    source,
    dryRun,
    force,
    now: options.now ?? new Date(),
    result
  };

  switch (source.kind) {
    case "openspec":
      await migrateOpenSpec(context);
      break;
    case "speckit":
      await migrateSpecKit(context);
      break;
    case "folder":
      await migrateDocumentationFolder(context);
      break;
  }

  return result;
}

async function ensureSpecRowInitialized(
  projectRoot: string,
  options: { dryRun: boolean; language?: string }
): Promise<{ language: string; initialized: boolean; wouldInitialize: boolean }> {
  const configPath = path.join(projectRoot, SPECROW_DIR, "config.yml");
  const projectPath = path.join(projectRoot, SPECROW_DIR, "project.md");
  const configExists = await pathExists(configPath);
  const projectExists = await pathExists(projectPath);

  if (configExists && projectExists) {
    return {
      language: (await loadSpecRowConfig(projectRoot)).language,
      initialized: false,
      wouldInitialize: false
    };
  }

  if (options.dryRun) {
    return {
      language: configExists ? (await loadSpecRowConfig(projectRoot)).language : options.language ?? "en",
      initialized: false,
      wouldInitialize: true
    };
  }

  const init = await initSpecRowProject({ cwd: projectRoot, language: options.language });
  return {
    language: init.language,
    initialized: true,
    wouldInitialize: false
  };
}

async function migrateOpenSpec(context: MigrationContext): Promise<void> {
  const specsRoot = path.join(context.source.root, "specs");
  const changesRoot = path.join(context.source.root, "changes");
  const rootArchive = path.join(context.source.root, "archive");
  const changesArchive = path.join(changesRoot, "archive");

  if (await pathExists(specsRoot)) {
    await copyDirectoryContents(context, specsRoot, path.join(context.specrowRoot, "specs"), "spec");
  }

  await copyArchiveEntries(context, changesArchive);
  await copyArchiveEntries(context, rootArchive);

  if (!(await pathExists(changesRoot))) {
    return;
  }

  const entries = await readdir(changesRoot, { withFileTypes: true });
  const usedNames = new Set<string>();

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "archive") {
      continue;
    }

    const changeRoot = path.join(changesRoot, entry.name);
    await migrateChangeDirectory(context, {
      sourceRoot: changeRoot,
      changeName: uniqueChangeName(entry.name, usedNames),
      sourceKind: "OpenSpec",
      stageSpecsRoot: path.join(changeRoot, "specs")
    });
  }
}

async function migrateSpecKit(context: MigrationContext): Promise<void> {
  const specsRoot = path.join(context.source.root, "specs");
  const featureRoots = await listSpecKitFeatureRoots(specsRoot);
  const usedNames = new Set<string>();

  for (const featureRoot of featureRoots) {
    const changeName = uniqueChangeName(path.basename(featureRoot), usedNames);
    await migrateChangeDirectory(context, {
      sourceRoot: featureRoot,
      changeName,
      sourceKind: "SpecKit",
      singleSpecFile: path.join(featureRoot, "spec.md")
    });
  }

  await copyArchiveEntries(context, path.join(context.source.root, "archive"));
  await copyArchiveEntries(context, path.join(context.source.root, "archives"));

  if (featureRoots.length === 0) {
    context.result.warnings.push(
      getSpecRowMessage(context.language, "migration.warning.noSpecKitFeatures", {
        path: displayPath(context.projectRoot, specsRoot)
      })
    );
  }
}

async function migrateDocumentationFolder(context: MigrationContext): Promise<void> {
  await copyArchiveEntries(context, path.join(context.source.root, "archive"));
  await copyArchiveEntries(context, path.join(context.source.root, "archives"));

  const docs = await listDocumentationFiles(context.source.root, context.source.root);
  const targetRoot = path.join(context.specrowRoot, "specs", "imported");

  for (const sourcePath of docs) {
    const relativePath = path.relative(context.source.root, sourcePath);
    const targetPath = path.join(targetRoot, relativePath);
    await copyFileOperation(context, sourcePath, targetPath, "imported-doc");
  }

  if (docs.length === 0) {
    context.result.warnings.push(
      getSpecRowMessage(context.language, "migration.warning.noDocumentationFiles", {
        path: displayPath(context.projectRoot, context.source.root)
      })
    );
  } else {
    context.result.warnings.push(getSpecRowMessage(context.language, "migration.warning.importedDocumentationReview"));
  }
}

async function migrateChangeDirectory(
  context: MigrationContext,
  options: {
    sourceRoot: string;
    changeName: string;
    sourceKind: string;
    stageSpecsRoot?: string;
    singleSpecFile?: string;
  }
): Promise<void> {
  const targetRoot = path.join(context.specrowRoot, "changes", options.changeName);
  const sourceTargetRoot = path.join(targetRoot, "source");

  if ((await pathExists(targetRoot)) && !context.force) {
    context.result.skipped.push({
      sourcePath: displayPath(context.projectRoot, options.sourceRoot),
      targetPath: displayPath(context.projectRoot, targetRoot),
      kind: "change",
      reason: "Target change already exists."
    });
    return;
  }

  if (!context.dryRun) {
    await mkdir(targetRoot, { recursive: true });
  }

  await writeGeneratedChangeFiles(context, {
    changeName: options.changeName,
    sourceRoot: options.sourceRoot,
    sourceKind: options.sourceKind,
    sourceTargetRoot
  });
  await copyDirectoryContents(context, options.sourceRoot, sourceTargetRoot, "change-source");

  if (options.stageSpecsRoot !== undefined && (await pathExists(options.stageSpecsRoot))) {
    await copyDirectoryContents(context, options.stageSpecsRoot, path.join(targetRoot, "specs"), "spec");
  }

  if (options.singleSpecFile !== undefined && (await pathExists(options.singleSpecFile))) {
    await copyFileOperation(context, options.singleSpecFile, path.join(targetRoot, "specs", options.changeName, "spec.md"), "spec");
  }

  context.result.converted.push({
    sourcePath: displayPath(context.projectRoot, options.sourceRoot),
    targetPath: displayPath(context.projectRoot, targetRoot),
    kind: "change"
  });
}

async function writeGeneratedChangeFiles(
  context: MigrationContext,
  options: {
    changeName: string;
    sourceRoot: string;
    sourceKind: string;
    sourceTargetRoot: string;
  }
): Promise<void> {
  const proposalPath = path.join(context.specrowRoot, "changes", options.changeName, "proposal.md");
  const tasksPath = path.join(context.specrowRoot, "changes", options.changeName, "tasks.md");
  const statusPath = path.join(context.specrowRoot, "changes", options.changeName, "status.yml");
  const sourcePath = displayPath(context.projectRoot, options.sourceRoot);
  const targetSourcePath = displayPath(context.projectRoot, options.sourceTargetRoot);
  const proposal = `${renderChangeTemplate(getSpecRowTemplate(context.language, "proposal"), options.changeName)}\n${getSpecRowMessage(
    context.language,
    "migration.proposalAppendix",
    {
      kind: options.sourceKind,
      source: sourcePath,
      path: targetSourcePath
    }
  )}\n`;
  const tasks = `${renderChangeTemplate(getSpecRowTemplate(context.language, "tasks"), options.changeName)}\n${getSpecRowMessage(
    context.language,
    "migration.tasksAppendix",
    {
      kind: options.sourceKind,
      source: sourcePath,
      path: targetSourcePath
    }
  )}\n`;
  const status: LifecycleStatus = {
    version: 1,
    change: options.changeName,
    state: "proposed",
    review: {
      state: "recommended"
    },
    acceptance: {
      explicit: false
    },
    createdAt: context.now.toISOString(),
    updatedAt: context.now.toISOString()
  };

  await writeGeneratedFile(context, proposalPath, proposal, "change");
  await writeGeneratedFile(context, tasksPath, tasks, "change");
  await writeGeneratedFile(context, statusPath, serializeLifecycleStatus(status), "change");
}

async function writeGeneratedFile(context: MigrationContext, targetPath: string, content: string, kind: MigrationOperation["kind"]): Promise<void> {
  if ((await pathExists(targetPath)) && !context.force) {
    context.result.skipped.push({
      sourcePath: "generated",
      targetPath: displayPath(context.projectRoot, targetPath),
      kind,
      reason: "Target file already exists."
    });
    return;
  }

  if (!context.dryRun) {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
  }
}

async function copyArchiveEntries(context: MigrationContext, archiveRoot: string): Promise<void> {
  if (!(await pathExists(archiveRoot))) {
    return;
  }

  const entries = await readdir(archiveRoot, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(archiveRoot, entry.name);
    const targetPath = path.join(context.specrowRoot, "archive", entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryContents(context, sourcePath, targetPath, "archive");
    } else if (entry.isFile()) {
      await copyFileOperation(context, sourcePath, targetPath, "archive");
    }
  }
}

async function copyDirectoryContents(
  context: MigrationContext,
  sourceRoot: string,
  targetRoot: string,
  kind: MigrationOperation["kind"]
): Promise<void> {
  const entries = await readdir(sourceRoot, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(targetRoot, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryContents(context, sourcePath, targetPath, kind);
    } else if (entry.isFile()) {
      await copyFileOperation(context, sourcePath, targetPath, kind);
    }
  }
}

async function copyFileOperation(
  context: MigrationContext,
  sourcePath: string,
  targetPath: string,
  kind: MigrationOperation["kind"]
): Promise<void> {
  if ((await pathExists(targetPath)) && !context.force) {
    context.result.skipped.push({
      sourcePath: displayPath(context.projectRoot, sourcePath),
      targetPath: displayPath(context.projectRoot, targetPath),
      kind,
      reason: "Target file already exists."
    });
    return;
  }

  if (!context.dryRun) {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
  }

  context.result.copied.push({
    sourcePath: displayPath(context.projectRoot, sourcePath),
    targetPath: displayPath(context.projectRoot, targetPath),
    kind
  });
}

async function listDocumentationFiles(root: string, sourceRoot: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (SKIPPED_DIRECTORIES.has(entry.name) || entry.name === "archive" || entry.name === "archives") {
      continue;
    }

    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listDocumentationFiles(entryPath, sourceRoot)));
    } else if (entry.isFile() && DOCUMENTATION_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => path.relative(sourceRoot, left).localeCompare(path.relative(sourceRoot, right)));
}

async function listSpecKitFeatureRoots(specsRoot: string): Promise<string[]> {
  if (!(await pathExists(specsRoot))) {
    return [];
  }

  const entries = await readdir(specsRoot, { withFileTypes: true });
  const features: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "archive" || entry.name === "archives") {
      continue;
    }

    const featureRoot = path.join(specsRoot, entry.name);

    if (
      (await pathExists(path.join(featureRoot, "spec.md"))) ||
      (await pathExists(path.join(featureRoot, "plan.md"))) ||
      (await pathExists(path.join(featureRoot, "tasks.md")))
    ) {
      features.push(featureRoot);
    }
  }

  return features.sort();
}

async function detectKnownSystem(baseRoot: string): Promise<MigrationSource> {
  const openSpec = await findOpenSpecRoot(baseRoot);

  if (openSpec !== undefined) {
    return { kind: "openspec", root: openSpec };
  }

  const specKit = await findSpecKitRoot(baseRoot);

  if (specKit !== undefined) {
    return { kind: "speckit", root: specKit };
  }

  throw new Error(`No OpenSpec or SpecKit workspace was detected under "${baseRoot}". Pass a documentation folder instead.`);
}

async function detectOpenSpec(baseRoot: string): Promise<MigrationSource> {
  const root = await findOpenSpecRoot(baseRoot);

  if (root === undefined) {
    throw new Error(`No OpenSpec workspace was detected under "${baseRoot}".`);
  }

  return { kind: "openspec", root };
}

async function detectSpecKit(baseRoot: string): Promise<MigrationSource> {
  const root = await findSpecKitRoot(baseRoot);

  if (root === undefined) {
    throw new Error(`No SpecKit workspace was detected under "${baseRoot}".`);
  }

  return { kind: "speckit", root };
}

async function findOpenSpecRoot(baseRoot: string): Promise<string | undefined> {
  const candidates = [baseRoot, path.join(baseRoot, "openspec"), path.join(baseRoot, ".openspec")];

  for (const candidate of candidates) {
    if (await looksLikeOpenSpecRoot(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function findSpecKitRoot(baseRoot: string): Promise<string | undefined> {
  const candidates = [baseRoot, path.join(baseRoot, ".specify")];

  for (const candidate of candidates) {
    const root = path.basename(candidate) === ".specify" ? path.dirname(candidate) : candidate;

    if (await looksLikeSpecKitRoot(root)) {
      return root;
    }
  }

  return undefined;
}

async function looksLikeOpenSpecRoot(candidate: string): Promise<boolean> {
  return (
    (await directoryExists(candidate)) &&
    ((await pathExists(path.join(candidate, "specs"))) ||
      (await pathExists(path.join(candidate, "changes"))) ||
      (await pathExists(path.join(candidate, "config.yaml"))))
  );
}

async function looksLikeSpecKitRoot(candidate: string): Promise<boolean> {
  return (await directoryExists(candidate)) && ((await pathExists(path.join(candidate, ".specify"))) || (await listSpecKitFeatureRoots(path.join(candidate, "specs"))).length > 0);
}

async function resolveSourceBase(projectRoot: string, options: MigrationOptions): Promise<string> {
  const baseRoot = path.resolve(projectRoot, options.sourceRoot ?? ".");
  assertExternalSourceAllowed(projectRoot, baseRoot, options.allowExternalSource);
  await assertDirectory(baseRoot, `Migration source root "${baseRoot}" does not exist or is not a directory.`);
  return baseRoot;
}

function assertExternalSourceAllowed(projectRoot: string, targetPath: string, allowExternalSource = true): void {
  if (allowExternalSource) {
    return;
  }

  const relativePath = path.relative(projectRoot, targetPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Migration source "${targetPath}" must be inside the SpecRow project root.`);
  }
}

function assertNotSpecRowInternal(projectRoot: string, sourcePath: string): void {
  const specrowRoot = path.resolve(projectRoot, SPECROW_DIR);
  const relativePath = path.relative(specrowRoot, path.resolve(sourcePath));

  if (relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))) {
    throw new Error("Migration source cannot be inside .specrow.");
  }
}

async function assertDirectory(targetPath: string, message: string): Promise<void> {
  if (!(await directoryExists(targetPath))) {
    throw new Error(message);
  }
}

async function directoryExists(targetPath: string): Promise<boolean> {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

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

function uniqueChangeName(sourceName: string, usedNames: Set<string>): string {
  const baseName = normalizeChangeName(sourceName);
  let candidate = baseName;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    candidate = `${baseName}-${suffix}`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function normalizeChangeName(sourceName: string): string {
  const normalized = sourceName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "")
    .replace(/[-_]{2,}/g, "-")
    .slice(0, 80);

  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(normalized) ? normalized : "migrated-change";
}

function renderChangeTemplate(template: string, changeName: string): string {
  return template.replace(/<[^>\n]*>/, changeName);
}

function displayPath(projectRoot: string, targetPath: string): string {
  const relativePath = path.relative(projectRoot, targetPath);
  return relativePath.startsWith("..") || path.isAbsolute(relativePath) ? targetPath : relativePath || ".";
}
