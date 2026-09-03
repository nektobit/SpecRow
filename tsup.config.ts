import { defineConfig, type Options } from "tsup";

const shared = {
  splitting: false,
  target: "node20"
} satisfies Options;

export default defineConfig([
  {
    ...shared,
    format: ["esm"],
    entry: ["src/bin.ts", "src/cli.ts", "src/mcpBin.ts", "src/mcpServer.ts"],
    clean: true,
    dts: true,
    sourcemap: true,
    outDir: "dist"
  },
  {
    ...shared,
    format: ["cjs"],
    entry: {
      "specrow-mcp": "src/pluginMcp.ts"
    },
    clean: true,
    dts: false,
    sourcemap: false,
    noExternal: [/.*/],
    outExtension: () => ({ js: ".cjs" }),
    outDir: "runtime"
  }
]);
