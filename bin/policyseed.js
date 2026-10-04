#!/usr/bin/env node
/**
 * policyseed — free, offline SOC 2 policy generator.
 * Deterministic Markdown from a YAML intake file and the bundled templates. No network calls,
 * no LLM, no signup. See ../README.md for full docs.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { DEFAULT_INTAKE, toTemplateContext, validateIntake, INTAKE_FIELDS } from "../lib/context.js";
import { parseYaml, yamlKeyLine } from "../lib/yaml.js";
import {
  TEMPLATES_DIR, readVersion, loadTemplates as loadTemplatesFrom, policyFileStem, renderPolicy,
  CADENCE_DAYS, evaluateReviews, readPolicyFiles,
} from "../lib/policies.js";
import { startMcpServer } from "../lib/mcp.js";

class CliError extends Error {}

function fail(message) {
  throw new CliError(message);
}

function flagValue(args, name, fallback) {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  const v = args[idx + 1];
  if (v === undefined || v.startsWith("--")) fail(`${name} requires a value`);
  return v;
}

function loadTemplates() {
  if (!existsSync(TEMPLATES_DIR)) fail(`Templates directory not found: ${TEMPLATES_DIR}`);
  return loadTemplatesFrom(TEMPLATES_DIR);
}

function printTable(rows, columns) {
  const widths = columns.map((c) => Math.max(c.label.length, ...rows.map((r) => String(r[c.key]).length)));
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join("  ");
  console.log(line(columns.map((c) => c.label)));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) console.log(line(columns.map((c) => r[c.key])));
}

/* ---------------------------------------------------------------------------------------------
 * init
 * ------------------------------------------------------------------------------------------- */

function initField(key, value, comment) {
  const lines = [];
  if (comment) lines.push(`# ${comment}`);
  lines.push(yamlKeyLine(key, value));
  lines.push("");
  return lines.join("\n");
}

function cmdInit(args) {
  const force = args.includes("--force");
  const outPath = flagValue(args, "--out", "intake.yaml");

  if (existsSync(outPath) && !force) {
    fail(`${outPath} already exists. Re-run with --force to overwrite it.`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const d = { ...DEFAULT_INTAKE, effective_date: today };

  const parts = [
    "# Policyseed intake",
    "# Fill in your company details below, then run `policyseed build`.",
    "# Fields marked (required) must be non-empty. Enum fields must match one of the listed",
    '# values exactly (case-sensitive). Lists use "- item" lines or inline "[a, b]".',
    "",
    ...INTAKE_FIELDS.map((f) => initField(f.key, d[f.key], f.comment)),
  ];

  writeFileSync(outPath, parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Edit it, then run: policyseed build`);
}

/* ---------------------------------------------------------------------------------------------
 * build
 * ------------------------------------------------------------------------------------------- */

function cmdBuild(args) {
  const intakePath = flagValue(args, "--intake", "intake.yaml");
  const outDir = flagValue(args, "--out", "policies");

  if (!existsSync(intakePath)) {
    fail(`Intake file not found: ${intakePath}\nRun "policyseed init" first, or pass --intake <path>.`);
  }

  let intake;
  try {
    intake = parseYaml(readFileSync(intakePath, "utf8"));
  } catch (err) {
    fail(`Could not parse ${intakePath}: ${err.message}`);
  }

  const { ok, errors } = validateIntake(intake);
  if (!ok) {
    console.error(`Invalid intake (${intakePath}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  const ctx = toTemplateContext(intake);
  const templates = loadTemplates();
  if (templates.length === 0) fail("No templates found.");

  mkdirSync(outDir, { recursive: true });

  const rows = [];
  for (const t of templates) {
    const finalMarkdown = renderPolicy(t, ctx);
    const stem = policyFileStem(t);
    writeFileSync(join(outDir, `${stem}.md`), finalMarkdown, "utf8");
    rows.push({ id: t.id, file: `${stem}.md`, title: t.title });
  }

  console.log(`Wrote ${templates.length} polic${templates.length === 1 ? "y" : "ies"} to ${outDir}/\n`);
  printTable(rows, [
    { key: "id", label: "ID" },
    { key: "file", label: "File" },
    { key: "title", label: "Title" },
  ]);
}

/* ---------------------------------------------------------------------------------------------
 * check
 * ------------------------------------------------------------------------------------------- */

function cmdCheck(args) {
  const intakePath = flagValue(args, "--intake", "intake.yaml");
  const policiesDir = flagValue(args, "--dir", "policies");

  if (!existsSync(intakePath)) fail(`Intake file not found: ${intakePath}`);
  const intake = parseYaml(readFileSync(intakePath, "utf8"));

  const cadence = CADENCE_DAYS[intake.review_cadence];
  if (!cadence) {
    fail(`Unknown review_cadence "${intake.review_cadence ?? ""}" in ${intakePath}. Expected one of: ${Object.keys(CADENCE_DAYS).join(", ")}`);
  }

  if (!existsSync(policiesDir)) fail(`Policies directory not found: ${policiesDir}\nRun "policyseed build" first.`);
  const policies = readPolicyFiles(policiesDir);
  if (policies.length === 0) fail(`No policy files found in ${policiesDir}`);

  const { ok, overdue, unknown } = evaluateReviews(intake, policies);

  console.log(`Review cadence: ${intake.review_cadence} (${cadence} days)\n`);

  if (ok.length) {
    console.log(`Up to date (${ok.length}):`);
    for (const r of ok) console.log(`  - ${r.file}  (last reviewed ${r.lastDate}, ${r.days}d ago)`);
  }
  if (unknown.length) {
    console.log(`\nCould not determine a review date (${unknown.length}):`);
    for (const r of unknown) console.log(`  - ${r.file}`);
  }
  if (overdue.length) {
    console.log(`\nOverdue for review (${overdue.length}):`);
    for (const r of overdue) console.log(`  - ${r.file}  (last reviewed ${r.lastDate}, ${r.days}d ago, cadence is ${cadence}d)`);
    console.log("");
    process.exitCode = 1;
    return;
  }

  if (unknown.length) {
    process.exitCode = 1;
    return;
  }

  console.log("\nAll policies are within their review cadence.");
}

/* ---------------------------------------------------------------------------------------------
 * list / help / version
 * ------------------------------------------------------------------------------------------- */

function cmdList() {
  const templates = loadTemplates();
  console.log(`${templates.length} policy templates:\n`);
  printTable(
    templates.map((t) => ({ id: t.id, file: policyFileStem(t), title: t.title, owner: t.owner_role })),
    [
      { key: "id", label: "ID" },
      { key: "file", label: "File stem" },
      { key: "title", label: "Title" },
      { key: "owner", label: "Owner role" },
    ]
  );
}

function cmdMcp() {
  startMcpServer();
}

const HELP = `policyseed — free, offline SOC 2 policy generator (Apache-2.0, no LLM, no signup)

Usage:
  policyseed init [--out <path>] [--force]
      Write a commented intake.yaml (default: ./intake.yaml) with every field and its
      allowed values. Refuses to overwrite an existing file unless --force is given.

  policyseed build [--intake <path>] [--out <dir>]
      Read intake.yaml (default: ./intake.yaml), validate it, and render all 22 policy
      templates into <dir> (default: ./policies) as NN-<slug>.md files.

  policyseed check [--intake <path>] [--dir <dir>]
      Read the rendered policies (default: ./policies) and intake.yaml, and exit 1 if any
      policy's last revision date is older than its review_cadence allows
      (Annual: 365d, Semi-annual: 182d, Quarterly: 91d). Prints which policies are overdue.
      This is what the bundled GitHub Action runs on a schedule.

  policyseed list
      Print the 22 bundled policy templates.

  policyseed mcp
      Start a Model Context Protocol (MCP) server on stdio so AI assistants (Claude Desktop,
      Claude Code, Cursor, ...) can list, interview for and render the policies.
      See docs/mcp.md for client setup.

  policyseed --help
  policyseed --version

Docs: https://github.com/odedmoshe/policyseed
Hosted generator: https://policyseed.io
`;

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const rest = argv.slice(1);

  if (!command || command === "--help" || command === "-h" || command === "help") {
    console.log(HELP);
    return;
  }
  if (command === "--version" || command === "-v" || command === "version") {
    console.log(readVersion());
    return;
  }

  switch (command) {
    case "init":
      return cmdInit(rest);
    case "build":
      return cmdBuild(rest);
    case "check":
      return cmdCheck(rest);
    case "list":
      return cmdList();
    case "mcp":
      return cmdMcp();
    default:
      fail(`Unknown command: ${command}\n\n${HELP}`);
  }
}

try {
  main();
} catch (err) {
  if (err instanceof CliError) {
    console.error(`policyseed: ${err.message}`);
    process.exit(1);
  }
  console.error(`policyseed: unexpected error: ${err.message}`);
  process.exit(1);
}
