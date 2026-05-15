import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts", "src/cli.ts", "src/agentCommands.ts", "src/mcpBin.ts", "src/mcpServer.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  target: "node20"
});
