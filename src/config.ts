import { parse, stringify } from "yaml";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const SpecRowConfigSchema = z.object({
  version: z.literal(1),
  language: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, "Use a language code like ru, en, es, or zh-CN.")
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
