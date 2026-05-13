import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/agentCommands.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  target: "node20"
});
