import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";
import { createChange } from "../src/lifecycle.js";
import { reviewChangeReadiness, validateSpecRowProject } from "../src/validation.js";

const tempDirs: string[] = [];

async function createTempProject(language = "en"): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-validation-test-"));
  tempDirs.push(tempDir);
  await initSpecRowProject({ cwd: tempDir, language });
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("SpecRow validation and review", () => {
  it("fails on missing required change files", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "missing-files" });
    await rm(path.join(cwd, ".specrow", "changes", "missing-files", "tasks.md"));
    await rm(path.join(cwd, ".specrow", "changes", "missing-files", "status.yml"));

    const result = await validateSpecRowProject(cwd, "missing-files");

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          path: path.join(".specrow", "changes", "missing-files", "tasks.md"),
          message: "Required file is missing."
        }),
        expect.objectContaining({
          severity: "error",
          path: path.join(".specrow", "changes", "missing-files", "status.yml"),
          message: "Required change status file is missing."
        })
      ])
    );
  });

  it("fails on missing required sections", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "missing-section" });
    await writeFile(
      path.join(cwd, ".specrow", "changes", "missing-section", "proposal.md"),
      "# Proposal: missing-section\n\n## Summary\nOnly a summary.\n",
      "utf8"
    );

    const result = await validateSpecRowProject(cwd, "missing-section");

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          path: path.join(".specrow", "changes", "missing-section", "proposal.md"),
          message: 'Missing required section "Problem".'
        })
      ])
    );
  });

  it("reports empty acceptance criteria during review", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "empty-criteria" });
    await writeFile(
      path.join(cwd, ".specrow", "changes", "empty-criteria", "proposal.md"),
      proposalWithAcceptance(""),
      "utf8"
    );

    const result = await reviewChangeReadiness(cwd, "empty-criteria");

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "warning",
          path: path.join(".specrow", "changes", "empty-criteria", "proposal.md"),
          message: 'Section "Acceptance Criteria" is empty.'
        })
      ])
    );
  });

  it("reports weak acceptance criteria without a checklist during review", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "weak-criteria" });
    await writeFile(
      path.join(cwd, ".specrow", "changes", "weak-criteria", "proposal.md"),
      proposalWithAcceptance("Acceptance is done when the feature feels ready."),
      "utf8"
    );

    const result = await reviewChangeReadiness(cwd, "weak-criteria");

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "warning",
          path: path.join(".specrow", "changes", "weak-criteria", "proposal.md"),
          message: 'Section "Acceptance Criteria" has no checklist acceptance criteria.'
        })
      ])
    );
  });

  it("validates localized files with the configured language", async () => {
    const cwd = await createTempProject("es");
    await createChange({ cwd, changeName: "idioma" });

    const proposal = await readFile(path.join(cwd, ".specrow", "changes", "idioma", "proposal.md"), "utf8");
    const result = await validateSpecRowProject(cwd, "idioma");

    expect(proposal).toContain("# Propuesta: idioma");
    expect(result.language).toBe("es");
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });
});

function proposalWithAcceptance(acceptanceBody: string): string {
  return `# Proposal: review

## Summary
Review behavior.

## Problem
The proposal needs review coverage.

## Proposed Change
Add review validation coverage.

## Scope
- Validation tests.

## Out of Scope
- Runtime changes.

## User Impact
Agents see clearer warnings.

## Risks
- Risk:
  - Mitigation:
  - Verification:

## Decisions
- Decision:
  - Reason:

## Acceptance Criteria
${acceptanceBody}

## Spec Updates
No spec updates.
`;
}
