#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const PLUGIN_FIELDS = new Set([
  "$schema",
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
  "extensions"
]);

const errors = [];

const [packageJson, plugin, mcp, codexPlugin, codexMcp] = await Promise.all([
  readJson("package.json"),
  readJson("plugin.json"),
  readJson("mcp.json"),
  readJson(".codex-plugin/plugin.json"),
  readJson(".mcp.json")
]);

validatePlugin(plugin, packageJson);
validateMcp(mcp);
validateCodexPlugin(codexPlugin, packageJson);
validateCodexMcp(codexMcp);
validatePackageFiles(packageJson);
await validateSkills();
await requireFile("runtime/specrow-mcp.cjs");

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log("Agent Plugin validation passed.");
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}

function validatePlugin(value, npmPackage) {
  if (!isRecord(value)) {
    errors.push("plugin.json: expected an object.");
    return;
  }

  if (value.$schema !== PLUGIN_SCHEMA) {
    errors.push(`plugin.json: $schema must be ${PLUGIN_SCHEMA}.`);
  }

  if (typeof value.name !== "string" || !/^[a-z0-9](?!.*(?:--|\.\.))[a-z0-9.-]{0,62}[a-z0-9]$|^[a-z0-9]$/.test(value.name)) {
    errors.push("plugin.json: name does not satisfy Agent Plugins v1 constraints.");
  }

  for (const field of Object.keys(value)) {
    if (!PLUGIN_FIELDS.has(field)) {
      errors.push(`plugin.json: unknown top-level field ${field}.`);
    }
  }

  if (value.version !== npmPackage.version) {
    errors.push("plugin.json: version must match package.json.");
  }

  if (value.author !== undefined && (!isRecord(value.author) || Object.keys(value.author).some((field) => !["name", "email", "url"].includes(field)))) {
    errors.push("plugin.json: author must contain only name, email, and url string fields.");
  }
}

function validateMcp(value) {
  if (!isRecord(value)) {
    errors.push("mcp.json: expected an object.");
    return;
  }

  if (value.$schema !== MCP_SCHEMA) {
    errors.push(`mcp.json: $schema must be ${MCP_SCHEMA}.`);
  }

  if (Object.keys(value).some((field) => !["$schema", "mcpServers"].includes(field))) {
    errors.push("mcp.json: only $schema and mcpServers are allowed at the top level.");
  }

  if (!isRecord(value.mcpServers)) {
    errors.push("mcp.json: mcpServers must be an object.");
    return;
  }

  for (const [name, server] of Object.entries(value.mcpServers)) {
    if (!isRecord(server) || server.type !== "stdio" || typeof server.command !== "string") {
      errors.push(`mcp.json: ${name} must be a stdio server with one command token.`);
      continue;
    }

    if (/\s/.test(server.command)) {
      errors.push(`mcp.json: ${name}.command must be one executable token.`);
    }

    if (server.args !== undefined && (!Array.isArray(server.args) || server.args.some((arg) => typeof arg !== "string"))) {
      errors.push(`mcp.json: ${name}.args must be an array of strings.`);
    }
  }
}

function validateCodexPlugin(value, npmPackage) {
  if (!isRecord(value)) {
    errors.push(".codex-plugin/plugin.json: expected an object.");
    return;
  }

  if (value.name !== "specrow") {
    errors.push(".codex-plugin/plugin.json: name must be specrow.");
  }

  if (value.version !== npmPackage.version) {
    errors.push(".codex-plugin/plugin.json: version must match package.json.");
  }

  if (value.skills !== "./skills/" || value.mcpServers !== "./.mcp.json") {
    errors.push(".codex-plugin/plugin.json: skills and mcpServers must point to the bundled plugin resources.");
  }

  if (!isRecord(value.interface) || value.interface.displayName !== "SpecRow") {
    errors.push(".codex-plugin/plugin.json: interface.displayName must be SpecRow.");
  }
}

function validateCodexMcp(value) {
  if (!isRecord(value) || !isRecord(value.mcpServers) || !isRecord(value.mcpServers.specrow)) {
    errors.push(".mcp.json: specrow server must be declared under mcpServers.");
    return;
  }

  const server = value.mcpServers.specrow;
  if (server.type !== "stdio" || server.command !== "node" || !Array.isArray(server.args) || server.args[0] !== "${PLUGIN_ROOT}/runtime/specrow-mcp.cjs") {
    errors.push(".mcp.json: specrow must start the bundled stdio runtime.");
  }
}

function validatePackageFiles(value) {
  const requiredEntries = ["dist", "runtime", "plugin.json", "mcp.json", ".codex-plugin", ".mcp.json", "skills"];
  if (!Array.isArray(value.files)) {
    errors.push("package.json: files must include every portable plugin resource.");
    return;
  }

  for (const entry of requiredEntries) {
    if (!value.files.includes(entry)) {
      errors.push(`package.json: files is missing ${entry}.`);
    }
  }
}

async function validateSkills() {
  const skillsRoot = path.join(root, "skills");
  let entries;

  try {
    entries = await readdir(skillsRoot, { withFileTypes: true });
  } catch (error) {
    errors.push(`skills/: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
    let source;

    try {
      source = await readFile(skillPath, "utf8");
    } catch {
      continue;
    }

    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);

    if (match === null) {
      errors.push(`skills/${entry.name}/SKILL.md: missing YAML frontmatter.`);
      continue;
    }

    const frontmatter = parse(match[1]);

    if (!isRecord(frontmatter) || frontmatter.name !== entry.name) {
      errors.push(`skills/${entry.name}/SKILL.md: frontmatter name must match the directory.`);
    }

    if (typeof frontmatter?.description !== "string" || frontmatter.description.length === 0 || frontmatter.description.length > 1024) {
      errors.push(`skills/${entry.name}/SKILL.md: description must contain 1-1024 characters.`);
    }

    if (!isRecord(frontmatter?.metadata) || frontmatter.metadata.version !== packageJson.version) {
      errors.push(`skills/${entry.name}/SKILL.md: metadata.version must match package.json.`);
    }

    for (const reference of source.matchAll(/\]\((references\/[^)]+)\)/g)) {
      await requireFile(path.join("skills", entry.name, reference[1]));
    }
  }
}

async function requireFile(relativePath) {
  const targetPath = path.resolve(root, relativePath);

  if (!isInside(root, targetPath)) {
    errors.push(`${relativePath}: path escapes the plugin root.`);
    return;
  }

  try {
    await access(targetPath);
  } catch {
    errors.push(`${relativePath}: required file is missing.`);
  }
}

function isInside(parent, targetPath) {
  const relativePath = path.relative(parent, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
