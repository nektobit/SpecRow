import { parse, stringify } from "yaml";
import { z } from "zod";

export const SpecFlyConfigSchema = z.object({
  version: z.literal(1),
  language: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, "Use a language code like ru, en, es, or zh-CN.")
});

export type SpecFlyConfig = z.infer<typeof SpecFlyConfigSchema>;

export const DEFAULT_CONFIG: SpecFlyConfig = {
  version: 1,
  language: "en"
};

export function createDefaultConfig(language = DEFAULT_CONFIG.language): SpecFlyConfig {
  return SpecFlyConfigSchema.parse({
    ...DEFAULT_CONFIG,
    language
  });
}

export function serializeConfig(config: SpecFlyConfig): string {
  return stringify(SpecFlyConfigSchema.parse(config), {
    sortMapEntries: false
  });
}

export function parseConfig(source: string): SpecFlyConfig {
  return SpecFlyConfigSchema.parse(parse(source));
}
