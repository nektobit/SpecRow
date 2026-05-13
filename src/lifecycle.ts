import { constants } from "node:fs";
import { access, copyFile, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse, stringify } from "yaml";
import { z } from "zod";

import { loadSpecRowConfig } from "./config.js";
import { getSpecRowTemplate } from "./templates.js";

export const LIFECYCLE_STATES = [
  "proposed",
  "reviewed",
  "built",
  "revision-needed",
  "accepted",
  "archived"
] as const;

export const REVIEW_STATES = ["required", "recommended", "completed"] as const;

export type LifecycleState = (typeof LIFECYCLE_STATES)[number];
export type ReviewState = (typeof REVIEW_STATES)[number];

const LifecycleStatusSchema = z.object({
  version: z.literal(1),
  change: z.string().min(1),
  state: z.enum(LIFECYCLE_STATES),
  review: z.object({
    state: z.enum(REVIEW_STATES)
  }),
  acceptance: z.object({
    explicit: z.boolean(),
    acceptedAt: z.string().datetime().optional()
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>;

export interface CreateChangeOptions {
  cwd?: string;
  changeName: string;
  review?: ReviewState;
  now?: Date;
}

export interface ChangeResult {
  root: string;
  proposalPath: string;
  tasksPath: string;
  statusPath: string;
  status: LifecycleStatus;
  language: string;
}

export interface ListActiveChangesResult {
  changes: LifecycleStatus[];
  warnings: string[];
}

const SPECROW_DIR = ".specrow";
const ACTIVE_CHANGE_STATES = new Set<LifecycleState>([
  "proposed",
  "reviewed",
  "built",
  "revision-needed",
  "accepted"
]);

export async function createChange(options: CreateChangeOptions): Promise<ChangeResult> {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const changeName = normalizeChangeName(options.changeName);
  const config = await loadSpecRowConfig(cwd);
  const changeRoot = activeChangePath(cwd, changeName);
  const statusPath = path.join(changeRoot, "status.yml");
  const proposalPath = path.join(changeRoot, "proposal.md");
  const tasksPath = path.join(changeRoot, "tasks.md");
  const now = toIso(options.now);

  if (await pathExists(changeRoot)) {
    throw new Error(`Change "${changeName}" already exists.`);
  }

  const status: LifecycleStatus = {
    version: 1,
    change: changeName,
    state: "proposed",
    review: {
      state: options.review ?? "recommended"
    },
    acceptance: {
      explicit: false
    },
    createdAt: now,
    updatedAt: now
  };

  await mkdir(changeRoot, { recursive: true });
  await writeFile(proposalPath, renderChangeTemplate(getSpecRowTemplate(config.language, "proposal"), changeName), "utf8");
  await writeFile(tasksPath, renderChangeTemplate(getSpecRowTemplate(config.language, "tasks"), changeName), "utf8");
  await writeFile(statusPath, serializeLifecycleStatus(status), "utf8");

  return {
    root: changeRoot,
    proposalPath,
    tasksPath,
    statusPath,
    status,
    language: config.language
  };
}

export async function readChangeStatus(cwd: string, changeName: string): Promise<LifecycleStatus> {
  const statusPath = path.join(activeChangePath(path.resolve(cwd), normalizeChangeName(changeName)), "status.yml");
  return parseLifecycleStatus(await readFile(statusPath, "utf8"));
}

export async function markChangeReviewed(cwd: string, changeName: string, now?: Date): Promise<LifecycleStatus> {
  const status = await readChangeStatus(cwd, changeName);
  status.state = "reviewed";
  status.review.state = "completed";
  return writeChangeStatus(cwd, updateTimestamp(status, now));
}

export async function markChangeBuilt(cwd: string, changeName: string, now?: Date): Promise<LifecycleStatus> {
  const status = await readChangeStatus(cwd, changeName);
  status.state = "built";
  return writeChangeStatus(cwd, updateTimestamp(status, now));
}

export async function markRevisionNeeded(cwd: string, changeName: string, now?: Date): Promise<LifecycleStatus> {
  const status = await readChangeStatus(cwd, changeName);
  status.state = "revision-needed";
  return writeChangeStatus(cwd, updateTimestamp(status, now));
}

export async function acceptChange(
  cwd: string,
  changeName: string,
  options: { explicitUserAcceptance: boolean; followUpWorkCompleted?: boolean; now?: Date }
): Promise<LifecycleStatus> {
  const status = await readChangeStatus(cwd, changeName);

  if (options.explicitUserAcceptance !== true) {
    throw new Error(`Change "${status.change}" requires explicit user acceptance.`);
  }

  if (status.state !== "built" && !(status.state === "revision-needed" && options.followUpWorkCompleted === true)) {
    throw new Error(`Change "${status.change}" must be built before acceptance.`);
  }

  const acceptedAt = toIso(options.now);
  status.state = "accepted";
  status.acceptance = {
    explicit: true,
    acceptedAt
  };
  status.updatedAt = acceptedAt;
  return writeChangeStatus(cwd, status);
}

export async function archiveChange(cwd: string, changeName: string, now?: Date): Promise<LifecycleStatus> {
  const root = path.resolve(cwd);
  const status = await readChangeStatus(root, changeName);

  if (status.state !== "accepted") {
    throw new Error(`Change "${status.change}" must be accepted before archive.`);
  }

  if (status.acceptance.explicit !== true || status.acceptance.acceptedAt === undefined) {
    throw new Error(`Change "${status.change}" must have explicit acceptance recorded before archive.`);
  }

  const archiveRoot = path.join(root, SPECROW_DIR, "archive", status.change);

  if (await pathExists(archiveRoot)) {
    throw new Error(`Archived change "${status.change}" already exists.`);
  }

  await integrateSpecUpdates(root, status.change);

  const archivedStatus = updateTimestamp(
    {
      ...status,
      state: "archived"
    },
    now
  );
  await writeChangeStatus(root, archivedStatus);
  await rename(activeChangePath(root, status.change), archiveRoot);
  return archivedStatus;
}

export async function listActiveChanges(cwd = process.cwd()): Promise<ListActiveChangesResult> {
  const root = path.resolve(cwd);
  const changesRoot = path.join(root, SPECROW_DIR, "changes");
  const names = await readdir(changesRoot).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });
  const changes: LifecycleStatus[] = [];

  for (const name of names) {
    const statusPath = path.join(changesRoot, name, "status.yml");

    if (await pathExists(statusPath)) {
      const status = parseLifecycleStatus(await readFile(statusPath, "utf8"));

      if (ACTIVE_CHANGE_STATES.has(status.state)) {
        changes.push(status);
      }
    }
  }

  changes.sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  return {
    changes,
    warnings:
      changes.length > 1
        ? ["Multiple active changes are open; review them for likely spec or workflow conflicts."]
        : []
  };
}

export function serializeLifecycleStatus(status: LifecycleStatus): string {
  return stringify(LifecycleStatusSchema.parse(status), {
    sortMapEntries: false
  });
}

export function parseLifecycleStatus(source: string): LifecycleStatus {
  return LifecycleStatusSchema.parse(parse(source));
}

function normalizeChangeName(changeName: string): string {
  const trimmed = changeName.trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(trimmed)) {
    throw new Error("Change name must use letters, numbers, dots, underscores, or hyphens and cannot contain paths.");
  }

  return trimmed;
}

function activeChangePath(cwd: string, changeName: string): string {
  return path.join(cwd, SPECROW_DIR, "changes", normalizeChangeName(changeName));
}

function renderChangeTemplate(template: string, changeName: string): string {
  return template.replace(/<[^>\n]*>/, changeName);
}

async function integrateSpecUpdates(root: string, changeName: string): Promise<void> {
  const stagedSpecsRoot = path.join(activeChangePath(root, changeName), "specs");

  if (!(await pathExists(stagedSpecsRoot))) {
    return;
  }

  await copyDirectoryContents(stagedSpecsRoot, path.join(root, SPECROW_DIR, "specs"));
}

async function copyDirectoryContents(sourceRoot: string, targetRoot: string): Promise<void> {
  const entries = await readdir(sourceRoot, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(targetRoot, entry.name);

    if (entry.isDirectory()) {
      await mkdir(targetPath, { recursive: true });
      await copyDirectoryContents(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(sourcePath, targetPath);
    }
  }
}

async function writeChangeStatus(cwd: string, status: LifecycleStatus): Promise<LifecycleStatus> {
  await writeFile(path.join(activeChangePath(path.resolve(cwd), status.change), "status.yml"), serializeLifecycleStatus(status), "utf8");
  return status;
}

function updateTimestamp(status: LifecycleStatus, now?: Date): LifecycleStatus {
  return {
    ...status,
    updatedAt: toIso(now)
  };
}

function toIso(now = new Date()): string {
  return now.toISOString();
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
