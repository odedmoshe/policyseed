#!/usr/bin/env node
/**
 * policyseed — free, offline SOC 2 policy generator.
 * Deterministic Markdown from a YAML intake file and the bundled templates. No network calls,
 * no LLM, no signup. See ../README.md for full docs.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { renderTemplate, parseFrontMatter } from "../lib/render.js";
import {
  DEFAULT_INTAKE, toTemplateContext, validateIntake,
  HEADCOUNTS, WORK_MODELS, CLOUDS, SCMS, IDPS, DATA_TYPES, APP_TYPES, TSC_SCOPES, REVIEW_CADENCES,
} from "../lib/context.js";
import { parseYaml, yamlKeyLine } from "../lib/yaml.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..");
const TEMPLATES_DIR = join(PKG_ROOT, "templates");

class CliError extends Error {}

function fail(message) {
  throw new CliError(message);
}

function readVersion() {
  try {
    return JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;
  } catch {
    return "0.0.0";
  }
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
  const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".md")).sort();
  const templates = files.map((f) => {
    const raw = readFileSync(join(TEMPLATES_DIR, f), "utf8");
    const { meta, body } = parseFrontMatter(raw);
    return {
      id: String(meta.id ?? "").trim(),
      slug: String(meta.slug ?? "").trim(),
      title: String(meta.title ?? "").trim(),
      owner_role: String(meta.owner_role ?? "").trim(),
      order: Number(meta.order ?? 0) || 0,
      tsc: Array.isArray(meta.tsc) ? meta.tsc : [],
      body,
      file: f,
    };
  });
  templates.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return templates;
}

function policyFileStem(t) {
  return `${String(t.order).padStart(2, "0")}-${t.slug}`;
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
    initField("company", d.company, "Legal or trading name used on every policy document. (required)"),
    initField("product", d.product, "Name of the product or service the policies describe. (required)"),
    initField("headcount", d.headcount, `Company headcount bracket. One of: ${HEADCOUNTS.join(", ")}`),
    initField("work_model", d.work_model, `How the team works. One of: ${WORK_MODELS.join(", ")}`),
    initField("cloud", d.cloud, `One or more cloud/hosting providers. Any of: ${CLOUDS.join(", ")}`),
    initField("scm", d.scm, `Source control host. One of: ${SCMS.join(", ")}`),
    initField("cicd", d.cicd, "CI/CD system name (free text, optional)."),
    initField("idp", d.idp, `Identity provider / SSO. One of: ${IDPS.join(", ")}`),
    initField("mfa", d.mfa, "Whether multi-factor authentication is enforced. true or false."),
    initField("mdm", d.mdm, "Mobile device management tool, or empty if none (free text, optional)."),
    initField("password_manager", d.password_manager, "Password manager in use, or empty if none (free text, optional)."),
    initField("data_types", d.data_types, `Sensitive data types handled. Any of: ${DATA_TYPES.join(", ")} (or empty list).`),
    initField("app_type", d.app_type, `Type of product. One of: ${APP_TYPES.join(", ")}`),
    initField("vendors", d.vendors, "Named vendors to call out in policy text (free text list, optional, up to 10)."),
    initField("security_owner", d.security_owner, 'Person accountable for security, as "Name, Title". (required)'),
    initField("approver", d.approver, 'Person who approves policies, as "Name, Title". (required)'),
    initField("incident_contact", d.incident_contact, "Email or channel for reporting incidents. (required)"),
    initField("backup_tool", d.backup_tool, "Backup tool or service (free text, optional)."),
    initField("backup_cadence", d.backup_cadence, "How often backups run (free text, optional, e.g. Daily)."),
    initField("logging_tool", d.logging_tool, "Centralized logging/monitoring tool (free text, optional)."),
    initField("tsc_scope", d.tsc_scope, `Trust Services Criteria in scope. One or more of: ${TSC_SCOPES.join(", ")}`),
    initField("review_cadence", d.review_cadence, `How often policies are reviewed. One of: ${REVIEW_CADENCES.join(", ")} (used by "policyseed check").`),
    initField("effective_date", d.effective_date, "Effective date of this policy version, as YYYY-MM-DD."),
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
    const body = renderTemplate(t.body, ctx);
    const h1Text = [ctx.company.trim(), t.title.trim()].filter(Boolean).join(" ");
    const markdown = `# ${h1Text}\n\n${body}`.replace(/\n{3,}/g, "\n\n\n");
    const finalMarkdown = markdown.endsWith("\n") ? markdown : `${markdown}\n`;
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

const CADENCE_DAYS = { Annual: 365, "Semi-annual": 182, Quarterly: 91 };

function lastRevisionDate(markdown) {
  const dateRe = /^\|\s*[^|]+\|\s*(\d{4}-\d{2}-\d{2})\s*\|/gm;
  let m;
  let last = null;
  while ((m = dateRe.exec(markdown)) !== null) last = m[1];
  return last;
}

function daysSince(dateStr, now) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

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
  const files = readdirSync(policiesDir).filter((f) => f.endsWith(".md")).sort();
  if (files.length === 0) fail(`No policy files found in ${policiesDir}`);

  const now = new Date();
  const ok = [];
  const overdue = [];
  const unknown = [];

  for (const f of files) {
    const content = readFileSync(join(policiesDir, f), "utf8");
    const lastDate = lastRevisionDate(content) ?? (typeof intake.effective_date === "string" ? intake.effective_date : null);
    const days = lastDate ? daysSince(lastDate, now) : null;
    if (days === null) {
      unknown.push({ file: f });
      continue;
    }
    const record = { file: f, lastDate, days };
    if (days >= cadence) overdue.push(record);
    else ok.push(record);
  }

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

  policyseed --help
  policyseed --version

Docs: https://github.com/odedmoshe/policyseed
Hosted generator: https://policyseed.vercel.app
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
