import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { renderTemplate, isTruthy, stringifyValue, collapseBlankLines, parseFrontMatter, TemplateSyntaxError } from "../lib/render.js";
import { DEFAULT_INTAKE, toTemplateContext, joinList, validateIntake } from "../lib/context.js";
import { parseYaml, yamlKeyLine, yamlScalar } from "../lib/yaml.js";

describe("renderTemplate: variables", () => {
  test("prints a known key", () => {
    assert.equal(renderTemplate("Hello {{name}}.", { name: "World" }), "Hello World.");
  });

  test("unknown keys render as empty string", () => {
    assert.equal(renderTemplate("[{{missing}}]", {}), "[]");
  });

  test("numbers, booleans and arrays stringify per spec", () => {
    assert.equal(renderTemplate("{{n}}", { n: 42 }), "42");
    assert.equal(renderTemplate("{{b}}", { b: true }), "true");
    assert.equal(renderTemplate("{{b}}", { b: false }), "false");
    assert.equal(renderTemplate("{{arr}}", { arr: ["a", "b", "c"] }), "a, b, c");
    assert.equal(renderTemplate("{{n}}", { n: NaN }), "");
    assert.equal(renderTemplate("{{n}}", { n: Infinity }), "");
  });
});

describe("renderTemplate: #if / #unless", () => {
  test("if renders only when truthy", () => {
    assert.equal(renderTemplate("{{#if x}}yes{{/if}}", { x: true }), "yes");
    assert.equal(renderTemplate("{{#if x}}yes{{/if}}", { x: false }), "");
    assert.equal(renderTemplate("{{#if x}}yes{{/if}}", { x: "" }), "");
    assert.equal(renderTemplate("{{#if x}}yes{{/if}}", { x: 0 }), "");
    assert.equal(renderTemplate("{{#if x}}yes{{/if}}", { x: [] }), "");
    assert.equal(renderTemplate("{{#if x}}yes{{/if}}", { x: "no" }), "yes");
  });

  test("unless is the inverse of if", () => {
    assert.equal(renderTemplate("{{#unless x}}yes{{/unless}}", { x: false }), "yes");
    assert.equal(renderTemplate("{{#unless x}}yes{{/unless}}", { x: true }), "");
  });

  test("if/unless nest inside each other", () => {
    const tpl = "{{#if a}}{{#unless b}}both{{/unless}}{{/if}}";
    assert.equal(renderTemplate(tpl, { a: true, b: false }), "both");
    assert.equal(renderTemplate(tpl, { a: true, b: true }), "");
    assert.equal(renderTemplate(tpl, { a: false, b: false }), "");
  });

  test("a standalone block tag on its own line removes the whole line", () => {
    const tpl = "line1\n{{#if x}}\ninside\n{{/if}}\nline2\n";
    assert.equal(renderTemplate(tpl, { x: true }), "line1\ninside\nline2\n");
    assert.equal(renderTemplate(tpl, { x: false }), "line1\nline2\n");
  });
});

describe("renderTemplate: #each / this", () => {
  test("iterates a list, {{this}} is the current item, pieces joined by newline", () => {
    // Iteration pieces are always separated by "\n" unless a piece already ends in one
    // (see the multi-line case below), so a single-line body gets one "\n" per boundary.
    assert.equal(renderTemplate("{{#each items}}{{this}},{{/each}}", { items: ["a", "b", "c"] }), "a,\nb,\nc,");
  });

  test("multi-line loop body: one item per line", () => {
    const tpl = "{{#each items}}\n- {{this}}\n{{/each}}";
    assert.equal(renderTemplate(tpl, { items: ["a", "b"] }), "- a\n- b\n");
  });

  test("each over a non-array truthy value treats it as a single-item list", () => {
    assert.equal(renderTemplate("{{#each x}}[{{this}}]{{/each}}", { x: "solo" }), "[solo]");
  });

  test("each over a falsy value produces nothing", () => {
    assert.equal(renderTemplate("{{#each x}}[{{this}}]{{/each}}", { x: "" }), "");
    assert.equal(renderTemplate("{{#each x}}[{{this}}]{{/each}}", {}), "");
  });

  test("each can nest inside if, and this refers to the innermost scope", () => {
    const tpl = "{{#if show}}{{#each items}}{{this}}-{{/each}}{{/if}}";
    assert.equal(renderTemplate(tpl, { show: true, items: [1, 2] }), "1-\n2-");
  });
});

describe("renderTemplate: blank-line collapsing", () => {
  test("collapses three or more blank lines to two", () => {
    assert.equal(collapseBlankLines("a\n\n\n\n\nb"), "a\n\n\nb");
  });

  test("removing a conditional block does not leave extra blank lines", () => {
    const tpl = "para one\n\n{{#if x}}\nconditional para\n\n{{/if}}\npara two\n";
    assert.equal(renderTemplate(tpl, { x: false }), "para one\n\npara two\n");
  });
});

describe("renderTemplate: parse errors", () => {
  test("throws on unclosed block", () => {
    assert.throws(() => renderTemplate("{{#if x}}no close", {}), TemplateSyntaxError);
  });

  test("throws on mismatched close", () => {
    assert.throws(() => renderTemplate("{{#if x}}a{{/each}}", {}), TemplateSyntaxError);
  });

  test("throws on an empty tag", () => {
    assert.throws(() => renderTemplate("{{}}", {}), TemplateSyntaxError);
  });
});

describe("isTruthy / stringifyValue", () => {
  test("isTruthy matches the documented rules", () => {
    for (const v of [false, "", 0, NaN, null, undefined, []]) assert.equal(isTruthy(v), false, `expected falsy: ${String(v)}`);
    for (const v of [true, "x", 1, -1, ["a"], {}]) assert.equal(isTruthy(v), true, `expected truthy: ${String(v)}`);
  });

  test("stringifyValue handles every value kind", () => {
    assert.equal(stringifyValue("s"), "s");
    assert.equal(stringifyValue(3), "3");
    assert.equal(stringifyValue(true), "true");
    assert.equal(stringifyValue(false), "false");
    assert.equal(stringifyValue(["a", "", "b"]), "a, b");
    assert.equal(stringifyValue({}), "");
    assert.equal(stringifyValue(null), "");
    assert.equal(stringifyValue(undefined), "");
  });
});

describe("parseFrontMatter", () => {
  test("splits meta and body, unquotes scalars, reads lists", () => {
    const src = [
      "---",
      "id: P01",
      'title: "Quoted Title"',
      "tsc:",
      "  - CC1.1",
      "  - CC1.2",
      "---",
      "",
      "## 1. Purpose",
      "",
      "Body text.",
    ].join("\n");
    const { meta, body } = parseFrontMatter(src);
    assert.equal(meta.id, "P01");
    assert.equal(meta.title, "Quoted Title");
    assert.deepEqual(meta.tsc, ["CC1.1", "CC1.2"]);
    assert.equal(body, "## 1. Purpose\n\nBody text.");
  });

  test("a bare `key:` with no following list items is an empty string", () => {
    const { meta } = parseFrontMatter("---\nshort:\ntitle: T\n---\nbody");
    assert.equal(meta.short, "");
  });

  test("no front matter delimiter returns the source as the body", () => {
    const { meta, body } = parseFrontMatter("just a body, no frontmatter");
    assert.deepEqual(meta, {});
    assert.equal(body, "just a body, no frontmatter");
  });
});

describe("context: toTemplateContext / joinList", () => {
  test("joinList formats 0, 1, 2 and 3+ items", () => {
    assert.equal(joinList([]), "");
    assert.equal(joinList(["a"]), "a");
    assert.equal(joinList(["a", "b"]), "a and b");
    assert.equal(joinList(["a", "b", "c"]), "a, b and c");
  });

  test("derives the expected booleans from an intake", () => {
    const intake = { ...DEFAULT_INTAKE, company: "Acme", product: "Widgets", idp: "None", data_types: ["PII", "PHI"], vendors: ["Stripe"] };
    const ctx = toTemplateContext(intake);
    assert.equal(ctx.company, "Acme");
    assert.equal(ctx.idp_none, true);
    assert.equal(ctx.has_pii, true);
    assert.equal(ctx.has_phi, true);
    assert.equal(ctx.has_payment, false);
    assert.equal(ctx.has_vendors, true);
    assert.equal(ctx.vendors, "Stripe");
    assert.equal(ctx.cicd, "GitHub Actions");
  });

  test("empty cicd falls back to a generic phrase", () => {
    const ctx = toTemplateContext({ ...DEFAULT_INTAKE, cicd: "" });
    assert.equal(ctx.cicd, "the CI/CD pipeline");
  });
});

describe("context: validateIntake", () => {
  test("accepts a filled-in default intake", () => {
    const intake = {
      ...DEFAULT_INTAKE,
      company: "Acme",
      product: "Widgets",
      security_owner: "Jane Doe, CTO",
      approver: "Jane Doe, CTO",
      incident_contact: "security@acme.example",
      effective_date: "2026-01-01",
    };
    const { ok, errors } = validateIntake(intake);
    assert.deepEqual(errors, []);
    assert.equal(ok, true);
  });

  test("reports every missing required field and bad enum value", () => {
    const { ok, errors } = validateIntake({ ...DEFAULT_INTAKE, headcount: "bogus", cloud: [] });
    assert.equal(ok, false);
    assert.ok(errors.some((e) => e.includes("company")));
    assert.ok(errors.some((e) => e.includes("headcount")));
    assert.ok(errors.some((e) => e.includes("cloud")));
  });

  test("rejects a malformed effective_date", () => {
    const { ok, errors } = validateIntake({ ...DEFAULT_INTAKE, company: "A", product: "B", security_owner: "C", approver: "D", incident_contact: "e@x.com", effective_date: "01/01/2026" });
    assert.equal(ok, false);
    assert.ok(errors.some((e) => e.includes("effective_date")));
  });
});

describe("yaml: parse and format round-trip", () => {
  test("parses scalars, booleans, quoted strings and lists", () => {
    const text = [
      "company: Acme, Inc.",
      "mfa: true",
      'product: "Widget Suite"',
      "cloud:",
      "  - AWS",
      "  - GCP",
      "vendors: []",
      "mdm:",
      "tsc_scope: [Security, Availability]",
    ].join("\n");
    const parsed = parseYaml(text);
    assert.equal(parsed.company, "Acme, Inc.");
    assert.equal(parsed.mfa, true);
    assert.equal(parsed.product, "Widget Suite");
    assert.deepEqual(parsed.cloud, ["AWS", "GCP"]);
    assert.deepEqual(parsed.vendors, []);
    assert.equal(parsed.mdm, "");
    assert.deepEqual(parsed.tsc_scope, ["Security", "Availability"]);
  });

  test("yamlKeyLine round-trips through parseYaml", () => {
    const lines = [yamlKeyLine("name", "Ann"), yamlKeyLine("ok", true), yamlKeyLine("list", ["x", "y"]), yamlKeyLine("empty", [])].join("\n");
    const parsed = parseYaml(lines);
    assert.equal(parsed.name, "Ann");
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.list, ["x", "y"]);
    assert.deepEqual(parsed.empty, []);
  });

  test("yamlScalar quotes values that would otherwise be ambiguous", () => {
    assert.equal(yamlScalar(""), '""');
    assert.equal(yamlScalar("plain"), "plain");
    assert.equal(yamlScalar("has: colon"), '"has: colon"');
  });
});
