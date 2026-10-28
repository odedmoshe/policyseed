import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { INTAKE_FIELDS } from "../lib/context.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SKILL_DIR = join(ROOT, "skills", "soc2-policies");
const SKILL = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf8");
const GUIDE = readFileSync(join(SKILL_DIR, "references", "intake-guide.md"), "utf8");

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, "SKILL.md starts with YAML frontmatter between --- lines");
  const fields = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z_-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2];
  }
  return fields;
}

describe("skills/soc2-policies", () => {
  test("frontmatter name matches the folder and a description is present", () => {
    const fm = frontmatter(SKILL);
    assert.equal(fm.name, "soc2-policies");
    assert.match(fm.name, /^[a-z0-9-]+$/);
    assert.ok(fm.description && fm.description.length > 40, "description says what it does and when to use it");
  });

  test("every MCP tool the skill names exists in lib/mcp.js", () => {
    const declared = new Set([...readFileSync(join(ROOT, "lib", "mcp.js"), "utf8").matchAll(/name: "([a-z_]+)",/g)].map((m) => m[1]));
    const named = [...SKILL.matchAll(/`([a-z]+_[a-z_]+)`/g)].map((m) => m[1]).filter((n) => !n.includes("-"));
    // Fields of a tool's output (list_policies returns file_name) are named too; they must exist in mcp.js.
    const outputFields = ["file_name"];
    for (const f of outputFields) assert.match(readFileSync(join(ROOT, "lib", "mcp.js"), "utf8"), new RegExp(`\\b${f}:`));
    const tools = named.filter((n) => !INTAKE_FIELDS.some((f) => f.key === n) && !outputFields.includes(n));
    assert.ok(tools.length >= 5, `found tool names: ${tools.join(", ")}`);
    for (const t of tools) assert.ok(declared.has(t), `${t} is not an MCP tool in lib/mcp.js`);
  });

  test("the interview guide covers every intake field and every allowed value", () => {
    for (const f of INTAKE_FIELDS) {
      assert.ok(GUIDE.includes(`\`${f.key}\``), `intake-guide.md is missing the field ${f.key}`);
      for (const v of f.allowed ?? []) assert.ok(GUIDE.includes(`\`${v}\``), `intake-guide.md is missing ${f.key} value ${v}`);
    }
  });

  test("CLI commands in the skill are real subcommands", () => {
    const help = readFileSync(join(ROOT, "bin", "policyseed.js"), "utf8");
    const used = new Set([...SKILL.matchAll(/npx -y policyseed@1 ([a-z]+)/g)].map((m) => m[1]));
    assert.ok(used.size >= 3);
    for (const cmd of used) assert.ok(help.includes(`"${cmd}"`) || help.includes(`'${cmd}'`) || help.includes(`case "${cmd}"`), `policyseed has no "${cmd}" command`);
  });

  test("no claim words outside the line that forbids them", () => {
    const banned = /\b(compliant|certified|guarantee[ds]?|audit-ready)\b/i;
    for (const [name, text] of [["SKILL.md", SKILL], ["intake-guide.md", GUIDE]]) {
      for (const line of text.split("\n")) {
        if (line.startsWith("- Never say")) continue;
        assert.doesNotMatch(line, banned, `${name}: ${line}`);
      }
    }
  });

  test("the skill folder holds only SKILL.md and references/", () => {
    assert.deepEqual(readdirSync(SKILL_DIR).sort(), ["SKILL.md", "references"]);
  });
});
