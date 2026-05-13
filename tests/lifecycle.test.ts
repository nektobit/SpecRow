import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";
import {
  acceptChange,
  archiveChange,
  createChange,
  listActiveChanges,
  markChangeBuilt,
  markChangeReviewed,
  markRevisionNeeded,
  readChangeStatus
} from "../src/lifecycle.js";

const tempDirs: string[] = [];

async function createTempProject(language = "en"): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-lifecycle-test-"));
  tempDirs.push(tempDir);
  await initSpecRowProject({ cwd: tempDir, language });
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("SpecRow change lifecycle", () => {
  it("creates a change directory with proposal, tasks, and proposed status", async () => {
    const cwd = await createTempProject("ru");
    const now = new Date("2026-05-14T00:00:00.000Z");

    const result = await createChange({
      cwd,
      changeName: "minimal-lifecycle",
      review: "required",
      now
    });

    expect(result.language).toBe("ru");
    await expect(readFile(path.join(cwd, ".specrow", "changes", "minimal-lifecycle", "proposal.md"), "utf8")).resolves.toContain(
      "# Предложение: minimal-lifecycle"
    );
    await expect(readFile(path.join(cwd, ".specrow", "changes", "minimal-lifecycle", "tasks.md"), "utf8")).resolves.toContain(
      "# Задачи: minimal-lifecycle"
    );

    const status = await readChangeStatus(cwd, "minimal-lifecycle");
    expect(status).toMatchObject({
      version: 1,
      change: "minimal-lifecycle",
      state: "proposed",
      review: { state: "required" },
      acceptance: { explicit: false },
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    });
  });

  it("tracks review, build, revision, and timestamp transitions", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "flow", now: new Date("2026-05-14T00:00:00.000Z") });

    await expect(markChangeReviewed(cwd, "flow", new Date("2026-05-14T00:01:00.000Z"))).resolves.toMatchObject({
      state: "reviewed",
      review: { state: "completed" },
      updatedAt: "2026-05-14T00:01:00.000Z"
    });
    await expect(markChangeBuilt(cwd, "flow", new Date("2026-05-14T00:02:00.000Z"))).resolves.toMatchObject({
      state: "built",
      acceptance: { explicit: false },
      updatedAt: "2026-05-14T00:02:00.000Z"
    });
    await expect(markRevisionNeeded(cwd, "flow", new Date("2026-05-14T00:03:00.000Z"))).resolves.toMatchObject({
      state: "revision-needed",
      updatedAt: "2026-05-14T00:03:00.000Z"
    });
  });

  it("requires explicit user acceptance and blocks archive before accept", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "acceptance" });
    await markChangeBuilt(cwd, "acceptance");

    await expect(acceptChange(cwd, "acceptance", { explicitUserAcceptance: false })).rejects.toThrow(
      'Change "acceptance" requires explicit user acceptance.'
    );
    await expect(archiveChange(cwd, "acceptance")).rejects.toThrow('Change "acceptance" must be accepted before archive.');

    await expect(
      acceptChange(cwd, "acceptance", {
        explicitUserAcceptance: true,
        now: new Date("2026-05-14T00:04:00.000Z")
      })
    ).resolves.toMatchObject({
      state: "accepted",
      acceptance: {
        explicit: true,
        acceptedAt: "2026-05-14T00:04:00.000Z"
      }
    });
  });

  it("allows accepting a revision-needed change only after completed follow-up work", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "revision-flow" });
    await markRevisionNeeded(cwd, "revision-flow");

    await expect(acceptChange(cwd, "revision-flow", { explicitUserAcceptance: true })).rejects.toThrow(
      'Change "revision-flow" must be built before acceptance.'
    );
    await expect(
      acceptChange(cwd, "revision-flow", {
        explicitUserAcceptance: true,
        followUpWorkCompleted: true
      })
    ).resolves.toMatchObject({ state: "accepted" });
  });

  it("archives only accepted changes and keeps archived changes out of active list", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "archive-me" });
    await markChangeBuilt(cwd, "archive-me");
    await acceptChange(cwd, "archive-me", { explicitUserAcceptance: true });

    await expect(archiveChange(cwd, "archive-me")).resolves.toMatchObject({ state: "archived" });
    await expect(stat(path.join(cwd, ".specrow", "archive", "archive-me", "status.yml"))).resolves.toBeTruthy();
    await expect(stat(path.join(cwd, ".specrow", "changes", "archive-me"))).rejects.toThrow();
    await expect(listActiveChanges(cwd)).resolves.toMatchObject({ changes: [], warnings: [] });
  });

  it("lists multiple active changes and warns about likely conflicts", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "first", now: new Date("2026-05-14T00:00:00.000Z") });
    await createChange({ cwd, changeName: "second", now: new Date("2026-05-14T00:01:00.000Z") });

    await expect(listActiveChanges(cwd)).resolves.toMatchObject({
      changes: [{ change: "first" }, { change: "second" }],
      warnings: ["Multiple active changes are open; review them for likely spec or workflow conflicts."]
    });
  });
});
