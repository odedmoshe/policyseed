/**
 * Shared policy logic used by both the CLI (bin/policyseed.js) and the MCP server (lib/mcp.js):
 * loading the bundled templates, rendering one policy exactly as `build` writes it, and the
 * review-date evaluation behind `check`. Pure functions where possible; errors are thrown as
 * plain Errors and each caller decides how to report them.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { renderTemplate, parseFrontMatter } from "./render.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PKG_ROOT = resolve(__dirname, "..");
export const TEMPLATES_DIR = join(PKG_ROOT, "templates");

export function readVersion() {
  try {
    return JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;
  } catch {
    return "0.0.0";
  }
}

/** Parse one template file's source into the template record used everywhere else. */
function toTemplateRecord(raw, file) {
  const { meta, body } = parseFrontMatter(raw);
  return {
    id: String(meta.id ?? "").trim(),
    slug: String(meta.slug ?? "").trim(),
    title: String(meta.title ?? "").trim(),
    short: String(meta.short ?? "").trim(),
    owner_role: String(meta.owner_role ?? "").trim(),
    order: Number(meta.order ?? 0) || 0,
    tsc: Array.isArray(meta.tsc) ? meta.tsc : [],
    body,
    raw,
    file,
  };
}

/** Load every bundled template, sorted by front-matter `order` then slug. */
export function loadTemplates(dir = TEMPLATES_DIR) {
  if (!existsSync(dir)) throw new Error(`Templates directory not found: ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  const templates = files.map((f) => toTemplateRecord(readFileSync(join(dir, f), "utf8"), f));
  templates.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return templates;
}

/** "NN-<slug>", the file stem `build` writes each policy under. */
export function policyFileStem(t) {
  return `${String(t.order).padStart(2, "0")}-${t.slug}`;
}

/** Render one template into the final Markdown document `build` writes (company-titled H1 included). */
export function renderPolicy(t, ctx) {
  const body = renderTemplate(t.body, ctx);
  const h1Text = [ctx.company.trim(), t.title.trim()].filter(Boolean).join(" ");
  const markdown = `# ${h1Text}\n\n${body}`.replace(/\n{3,}/g, "\n\n\n");
  return markdown.endsWith("\n") ? markdown : `${markdown}\n`;
}

/* ---------------------------------------------------------------------------------------------
 * Review-cadence checks (`policyseed check`)
 * ------------------------------------------------------------------------------------------- */

export const CADENCE_DAYS = { Annual: 365, "Semi-annual": 182, Quarterly: 91 };

/** The date in the last revision-history table row (`| x | YYYY-MM-DD | ...`), or null. */
export function lastRevisionDate(markdown) {
  const dateRe = /^\|\s*[^|]+\|\s*(\d{4}-\d{2}-\d{2})\s*\|/gm;
  let m;
  let last = null;
  while ((m = dateRe.exec(markdown)) !== null) last = m[1];
  return last;
}

export function daysSince(dateStr, now) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

/**
 * Classify rendered policy files by review status.
 * @param {{review_cadence?: string, effective_date?: string}} intake
 * @param {{file: string, content: string}[]} policies
 * @returns {{cadence: number, ok: object[], overdue: object[], unknown: object[]}}
 * `cadence` is undefined when intake.review_cadence is not a known value; callers report that.
 */
export function evaluateReviews(intake, policies, now = new Date()) {
  const cadence = CADENCE_DAYS[intake.review_cadence];
  const ok = [];
  const overdue = [];
  const unknown = [];
  for (const { file, content } of policies) {
    const lastDate = lastRevisionDate(content) ?? (typeof intake.effective_date === "string" ? intake.effective_date : null);
    const days = lastDate ? daysSince(lastDate, now) : null;
    if (days === null) {
      unknown.push({ file });
      continue;
    }
    const record = { file, lastDate, days };
    if (days >= cadence) overdue.push(record);
    else ok.push(record);
  }
  return { cadence, ok, overdue, unknown };
}

/** Read every *.md file in a rendered-policies directory, sorted by name. */
export function readPolicyFiles(policiesDir) {
  return readdirSync(policiesDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({ file: f, content: readFileSync(join(policiesDir, f), "utf8") }));
}
