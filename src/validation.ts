import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { loadSpecRowConfig } from "./config.js";
import { listActiveChanges, parseLifecycleStatus } from "./lifecycle.js";
import { getSpecRowTemplate, type TemplateName } from "./templates.js";

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  path: string;
  message: string;
}

export interface ValidationResult {
  language: string;
  issues: ValidationIssue[];
}

const SPECROW_DIR = ".specrow";

export async function validateSpecRowProject(cwd = process.cwd(), changeName?: string): Promise<ValidationResult> {
  const root = path.resolve(cwd);
  const config = await loadSpecRowConfig(root);
  const issues: ValidationIssue[] = [];

  await validateFileSections(root, path.join(SPECROW_DIR, "project.md"), "project", config.language, issues);

  if (changeName !== undefined) {
    await validateChange(root, changeName, config.language, issues);
  } else {
    const activeChanges = await listActiveChanges(root);

    for (const change of activeChanges.changes) {
      await validateChange(root, change.change, config.language, issues);
    }

    for (const warning of activeChanges.warnings) {
      issues.push({
        severity: "warning",
        path: path.join(SPECROW_DIR, "changes"),
        message: warning
      });
    }
  }

  return {
    language: config.language,
    issues
  };
}

export async function reviewChangeReadiness(cwd = process.cwd(), changeName: string): Promise<ValidationResult> {
  const root = path.resolve(cwd);
  const result = await validateSpecRowProject(root, changeName);
  const proposalPath = path.join(SPECROW_DIR, "changes", changeName, "proposal.md");
  const absoluteProposalPath = path.join(root, proposalPath);

  if (await pathExists(absoluteProposalPath)) {
    const proposal = await readFile(absoluteProposalPath, "utf8");
    const proposalTemplate = getSpecRowTemplate(result.language, "proposal");
    const acceptanceHeading = requiredSections(proposalTemplate).at(-2);

    if (acceptanceHeading !== undefined) {
      const body = sectionBody(proposal, acceptanceHeading);

      if (body.trim().length === 0) {
        result.issues.push({
          severity: "warning",
          path: proposalPath,
          message: `Section "${acceptanceHeading}" is empty.`
        });
      } else if (!/- \[[ xX]\]\s+\S/.test(body)) {
        result.issues.push({
          severity: "warning",
          path: proposalPath,
          message: `Section "${acceptanceHeading}" has no checklist acceptance criteria.`
        });
      }
    }
  }

  return result;
}

async function validateChange(root: string, changeName: string, language: string, issues: ValidationIssue[]): Promise<void> {
  const changeRoot = path.join(SPECROW_DIR, "changes", changeName);
  const statusPath = path.join(changeRoot, "status.yml");

  await validateFileSections(root, path.join(changeRoot, "proposal.md"), "proposal", language, issues);
  await validateFileSections(root, path.join(changeRoot, "tasks.md"), "tasks", language, issues);

  const absoluteStatusPath = path.join(root, statusPath);

  if (!(await pathExists(absoluteStatusPath))) {
    issues.push({
      severity: "error",
      path: statusPath,
      message: "Required change status file is missing."
    });
    return;
  }

  try {
    parseLifecycleStatus(await readFile(absoluteStatusPath, "utf8"));
  } catch (error) {
    issues.push({
      severity: "error",
      path: statusPath,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

async function validateFileSections(
  root: string,
  relativePath: string,
  templateName: TemplateName,
  language: string,
  issues: ValidationIssue[]
): Promise<void> {
  const absolutePath = path.join(root, relativePath);

  if (!(await pathExists(absolutePath))) {
    issues.push({
      severity: "error",
      path: relativePath,
      message: "Required file is missing."
    });
    return;
  }

  const source = await readFile(absolutePath, "utf8");
  const template = getSpecRowTemplate(language, templateName);

  for (const section of requiredSections(template)) {
    if (!hasHeading(source, section)) {
      issues.push({
        severity: "error",
        path: relativePath,
        message: `Missing required section "${section}".`
      });
    }
  }
}

function requiredSections(template: string): string[] {
  return template
    .split(/\r?\n/)
    .filter((line) => line.startsWith("## ") && !line.startsWith("### "))
    .map((line) => line.replace(/^##\s+/, "").trim());
}

function hasHeading(source: string, heading: string): boolean {
  const escaped = escapeRegExp(heading);
  return new RegExp(`^##\\s+${escaped}\\s*$`, "m").test(source);
}

function sectionBody(source: string, heading: string): string {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);

  if (start === -1) {
    return "";
  }

  const end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  return lines.slice(start + 1, end === -1 ? undefined : end).join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
