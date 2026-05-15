import { parse, stringify } from "yaml";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const INTEGRATION_TOOLS = ["codex", "claude", "cursor", "windsurf", "generic"] as const;

export const IntegrationToolSchema = z.enum(INTEGRATION_TOOLS);

export type IntegrationTool = z.infer<typeof IntegrationToolSchema>;

const ManagedIntegrationFileSchema = z.object({
  tool: IntegrationToolSchema,
  path: z.string().min(1),
  kind: z.enum(["command", "skill", "instructions", "workflow", "prompt", "rule", "mcp-config"])
});

const IntegrationsConfigSchema = z.object({
  tools: z.array(IntegrationToolSchema),
  installedAt: z.string().min(1),
  managedFiles: z.array(ManagedIntegrationFileSchema)
});

export const SpecRowConfigSchema = z.object({
  version: z.literal(1),
  language: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, "Use a language code like ru, en, es, or zh-CN."),
  integrations: IntegrationsConfigSchema.optional()
});

export type SpecRowConfig = z.infer<typeof SpecRowConfigSchema>;

export const DEFAULT_CONFIG: SpecRowConfig = {
  version: 1,
  language: "en"
};

export function createDefaultConfig(language = DEFAULT_CONFIG.language): SpecRowConfig {
  return SpecRowConfigSchema.parse({
    ...DEFAULT_CONFIG,
    language
  });
}

export function serializeConfig(config: SpecRowConfig): string {
  return stringify(SpecRowConfigSchema.parse(config), {
    sortMapEntries: false
  });
}

export function parseConfig(source: string): SpecRowConfig {
  return SpecRowConfigSchema.parse(parse(source));
}

export async function loadSpecRowConfig(cwd = process.cwd()): Promise<SpecRowConfig> {
  return parseConfig(await readFile(path.join(cwd, ".specrow", "config.yml"), "utf8"));
}
