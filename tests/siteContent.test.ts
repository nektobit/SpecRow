import { describe, expect, it } from "vitest";

import { createProgram } from "../src/cli.js";
import { SPECROW_MCP_TOOL_NAMES } from "../src/mcpServer.js";
import { SUPPORTED_LANGUAGES } from "../src/templates.js";
import {
  anchorAliases,
  docContent,
  contentDigest,
  documentedCliCommands,
  documentedCliOptions,
  documentedCliPaths,
  documentedMcpTools,
  locales,
  reviewedContentRevisions,
  reviewedContentDigests,
  reviewedSourceDigests,
  resolvedAnchorAliases,
  sourceContentDigests,
  validateSiteContent,
  type PageContent
} from "../site/src/content.js";

describe("site content contract", () => {
  it("keeps every locale structurally complete and command catalogs current", () => {
    expect(validateSiteContent()).toEqual([]);
  });

  it("keeps site locales and command catalogs aligned with runtime exports", () => {
    expect(locales.map(({ code }) => code)).toEqual(SUPPORTED_LANGUAGES);
    expect(createProgram().commands.map((command) => command.name())).toEqual(documentedCliCommands);
    expect(SPECROW_MCP_TOOL_NAMES).toEqual(documentedMcpTools);
  });

  it("uses only CLI options registered by Commander", () => {
    const program = createProgram();

    const commandsByPath = new Map(
      program.commands.flatMap((command) => {
        const entries: Array<[string, typeof command]> = command.commands.length === 0 ? [[command.name(), command]] : [];
        for (const child of command.commands) entries.push([`${command.name()} ${child.name()}`, child]);
        return entries;
      })
    );

    expect([...commandsByPath.keys()]).toEqual(documentedCliPaths);
    for (const [commandPath, expectedOptions] of Object.entries(documentedCliOptions)) {
      expect(commandsByPath.get(commandPath)?.options.map(({ long }) => long), commandPath).toEqual(expectedOptions);
    }

    for (const localePages of Object.values(docContent)) {
      for (const page of Object.values(localePages)) {
        for (const block of page.blocks) {
          if (block.exampleKind !== "cli") continue;
          const examples = block.type === "section" || block.type === "command-section" ? block.commands ?? [] : [];

          for (const example of examples) {
            const match = example.match(/^specrow\s+([a-z-]+)/);
            if (match === null) continue;
            const command = program.commands.find((candidate) => candidate.name() === match[1]);
            expect(command, example).toBeDefined();
            for (const option of example.match(/--[a-z-]+/g) ?? []) {
              expect(command?.options.some((candidate) => candidate.long === option), `${example}: ${option}`).toBe(true);
            }
          }
        }
      }
    }
  });

  it("rejects a missing translated section", () => {
    const content = structuredClone(docContent);
    content.ru.instructions.blocks.pop();

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ path: "content.ru.instructions.blocks" })
    );
  });

  it("invalidates review when translated text changes without a digest update", () => {
    const content = structuredClone(docContent);
    content.en.instructions.description += " Changed.";

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ path: "contentDigests.en.instructions" })
    );
  });

  it("marks every translation stale when source content changes", () => {
    const content = structuredClone(docContent);
    const contentDigests = structuredClone(reviewedContentDigests);
    const sourceDigests = structuredClone(sourceContentDigests);
    content.en.instructions.description += " Changed source.";
    const nextDigest = contentDigest(content.en.instructions);
    contentDigests.en.instructions = nextDigest;
    sourceDigests.instructions = nextDigest;

    expect(
      validateSiteContent(content, reviewedContentRevisions, contentDigests, sourceDigests, reviewedSourceDigests)
    ).toContainEqual(expect.objectContaining({ path: "translationSourceDigests.ru.instructions" }));
  });

  it("rejects topology drift even when the number of blocks still matches", () => {
    const content = structuredClone(docContent);
    content.es.workflow.blocks[0] = {
      id: "states",
      type: "list-section",
      heading: "Estados",
      intro: "Estados",
      items: ["proposed"],
      outro: "Fin"
    };

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({
        path: "content.es.workflow.blocks.0",
        message: "Block topology differs from en."
      })
    );
  });

  it("requires an explicit review acknowledgement after a page revision changes", () => {
    const revisions = structuredClone(reviewedContentRevisions);
    revisions["zh-CN"].instructions -= 1;

    expect(validateSiteContent(docContent, revisions)).toContainEqual(
      expect.objectContaining({ path: "revisions.zh-CN.instructions" })
    );
  });

  it("rejects swapping same-kind sections because IDs travel with their content", () => {
    const content = structuredClone(docContent);
    [content.ru.workflow.blocks[1], content.ru.workflow.blocks[2]] = [
      content.ru.workflow.blocks[2],
      content.ru.workflow.blocks[1]
    ];

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ path: "content.ru.workflow.blocks.1.id" })
    );
  });

  it("rejects removed commands presented as executable", () => {
    const content = structuredClone(docContent);
    const page = content.en["cli-reference"] as PageContent;
    const block = page.blocks[0];
    if (block.type !== "section") throw new Error("Unexpected fixture topology");
    block.commands = ["specrow update"];

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({
        path: "content.en.cli-reference.blocks.0",
        message: "Removed command or tool is still presented as executable: specrow update."
      })
    );
  });

  it("validates executable examples outside the CLI reference", () => {
    const content = structuredClone(docContent);
    const block = content.en.templates.blocks[4];
    if (block.type !== "section") throw new Error("Unexpected fixture topology");
    block.commands = ["specrow frobnicate"];

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ message: "Unknown CLI command path in executable example: frobnicate." })
    );
  });

  it("rejects removed commands hidden in code sections or npx wrappers", () => {
    const content = structuredClone(docContent);
    const block = content.en.templates.blocks[0];
    if (block.type !== "code-section") throw new Error("Unexpected fixture topology");
    block.code = "npx specrow update";
    block.exampleKind = "cli";

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ message: "Removed command or tool is still presented as executable: npx specrow update." })
    );
  });

  it("rejects removed commands through package-manager wrappers", () => {
    const content = structuredClone(docContent);
    const block = content.en.templates.blocks[0];
    if (block.type !== "code-section") throw new Error("Unexpected fixture topology");
    block.code = "npm --silent exec specrow update";
    block.exampleKind = "cli";

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ message: "Removed command or tool is still presented as executable: npm --silent exec specrow update." })
    );
  });

  it("rejects unknown options after normalizing a CLI wrapper", () => {
    const content = structuredClone(docContent);
    const block = content.en.templates.blocks[0];
    if (block.type !== "code-section") throw new Error("Unexpected fixture topology");
    block.code = "npx specrow init --definitely-unknown";
    block.exampleKind = "cli";

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ message: "Unknown option --definitely-unknown for CLI command path init." })
    );
  });

  it("rejects unknown nested CLI command paths", () => {
    const content = structuredClone(docContent);
    const block = content.en["cli-reference"].blocks[5];
    if (block.type !== "section") throw new Error("Unexpected fixture topology");
    block.commands = ["specrow locales frobnicate"];

    expect(validateSiteContent(content)).toContainEqual(
      expect.objectContaining({ message: "Unknown CLI command path in executable example: locales frobnicate." })
    );
  });

  it("allows durable anchor chains and resolves every old anchor to the current section", () => {
    const aliases = anchorAliases.migration as Record<string, string>;
    aliases["old-migration"] = "renamed-migration";
    aliases["renamed-migration"] = "choose-path";
    try {
      expect(validateSiteContent()).toEqual([]);
      expect(resolvedAnchorAliases("migration", docContent.en.migration.blocks[0].id)).toEqual([
        "old-migration",
        "renamed-migration"
      ]);
    } finally {
      delete aliases["old-migration"];
      delete aliases["renamed-migration"];
    }
  });

  it("rejects cyclic anchor aliases", () => {
    const aliases = anchorAliases.migration as Record<string, string>;
    aliases["old-migration"] = "renamed-migration";
    aliases["renamed-migration"] = "old-migration";
    try {
      expect(validateSiteContent()).toContainEqual(
        expect.objectContaining({ path: "anchorAliases.migration.old-migration" })
      );
    } finally {
      delete aliases["old-migration"];
      delete aliases["renamed-migration"];
    }
  });
});
