import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_INTAKE } from "../lib/context.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, "..", "bin", "policyseed.js");
const VERSION = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8")).version;

const INTAKE = {
  ...DEFAULT_INTAKE,
  company: "Acme, Inc.",
  product: "Widget Suite",
  security_owner: "Jane Doe, CTO",
  approver: "Jane Doe, CTO",
  incident_contact: "security@acme.example",
  effective_date: "2026-01-01",
};

/** Spawn `policyseed mcp`, send all messages, close stdin, and collect every stdout line. */
function runSession(messages, { cwd } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [BIN, "mcp"], { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => resolvePromise({ code, stdout, stderr }));
    for (const m of messages) child.stdin.write(`${typeof m === "string" ? m : JSON.stringify(m)}\n`);
    child.stdin.end();
  });
}

function parseLines(stdout) {
  const lines = stdout.split("\n").filter((l) => l !== "");
  return lines.map((l) => {
    let parsed;
    assert.doesNotThrow(() => (parsed = JSON.parse(l)), `stdout line is not valid JSON: ${l.slice(0, 200)}`);
    assert.equal(parsed.jsonrpc, "2.0");
    return parsed;
  });
}

const init = (id = 1, protocolVersion = "2025-06-18") => ({
  jsonrpc: "2.0",
  id,
  method: "initialize",
  params: { protocolVersion, capabilities: {}, clientInfo: { name: "test", version: "0.0.0" } },
});
const call = (id, name, args) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });

describe("policyseed mcp (stdio)", () => {
  let session;
  let byId;
  let dir;

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), "policyseed-mcp-"));
    // Prepare a project for check_reviews: an intake backdated past the Annual cadence, then build.
    execFileSync(process.execPath, [BIN, "init"], { cwd: dir });
    const intakePath = join(dir, "intake.yaml");
    writeFileSync(
      intakePath,
      readFileSync(intakePath, "utf8")
        .replace(/^company:.*$/m, "company: Acme, Inc.")
        .replace(/^product:.*$/m, "product: Widget Suite")
        .replace(/^security_owner:.*$/m, "security_owner: Jane Doe, CTO")
        .replace(/^approver:.*$/m, "approver: Jane Doe, CTO")
        .replace(/^incident_contact:.*$/m, "incident_contact: security@acme.example")
        .replace(/^effective_date:.*$/m, "effective_date: 2000-01-01"),
    );
    execFileSync(process.execPath, [BIN, "build"], { cwd: dir });

    session = await runSession([
      init(1),
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "ping" },
      { jsonrpc: "2.0", id: 3, method: "tools/list" },
      call(4, "render_policy", { slug: "access-control-policy", intake: INTAKE }),
      { jsonrpc: "2.0", id: 5, method: "resources/list" },
      { jsonrpc: "2.0", id: 6, method: "resources/read", params: { uri: "policyseed://templates/access-control-policy" } },
      { jsonrpc: "2.0", id: 7, method: "no/such/method" },
      call(8, "render_policy", { slug: "nope", intake: INTAKE }),
      call(9, "render_policy", { slug: "access-control-policy", intake: { company: "Acme" } }),
      call(10, "list_policies", {}),
      call(11, "intake_questions", {}),
      call(12, "render_all", { intake: INTAKE }),
      call(13, "check_reviews", { directory: dir }),
      call(14, "check_reviews", { directory: join(dir, "missing") }),
      { jsonrpc: "2.0", id: 15, method: "resources/read", params: { uri: "policyseed://templates/nope" } },
      "this is not json",
    ]);
    byId = new Map(parseLines(session.stdout).filter((m) => m.id !== null).map((m) => [m.id, m]));
  });

  after(() => rmSync(dir, { recursive: true, force: true }));

  test("stdout contains only valid JSON-RPC lines, one reply per request, none for the notification", () => {
    const msgs = parseLines(session.stdout);
    // 15 requests + 1 parse error; the notification gets no reply.
    assert.equal(msgs.length, 16);
    assert.equal(session.code, 0);
    assert.match(session.stderr, /MCP server listening on stdio/);
    const parseError = msgs.find((m) => m.id === null);
    assert.equal(parseError.error.code, -32700);
  });

  test("initialize negotiates protocol version and reports server info", () => {
    const r = byId.get(1).result;
    assert.equal(r.protocolVersion, "2025-06-18");
    assert.deepEqual(r.serverInfo.name, "policyseed");
    assert.equal(r.serverInfo.version, VERSION);
    assert.deepEqual(r.capabilities, { tools: {}, resources: {} });
    assert.deepEqual(byId.get(2).result, {});
  });

  test("tools/list exposes the five tools with input schemas", () => {
    const tools = byId.get(3).result.tools;
    assert.deepEqual(
      tools.map((t) => t.name),
      ["list_policies", "intake_questions", "render_policy", "render_all", "check_reviews"],
    );
    for (const t of tools) {
      assert.equal(t.inputSchema.type, "object");
      assert.ok(t.description.length > 40);
    }
    const rp = tools.find((t) => t.name === "render_policy");
    assert.deepEqual(rp.inputSchema.required, ["slug", "intake"]);
    assert.deepEqual(rp.inputSchema.properties.intake.properties.headcount.enum, ["1-10", "11-50", "51-200", "201+"]);
  });

  test("render_policy returns the same Markdown `build` writes", () => {
    const r = byId.get(4).result;
    assert.notEqual(r.isError, true);
    const md = r.content[0].text;
    assert.match(md, /^# Acme, Inc\. Access Control Policy\n/);
    assert.match(md, /## 9\. Revision History/);
    assert.match(md, /\| 1\.0 \| 2026-01-01 \| Initial release \| Jane Doe, CTO \|/);
    assert.doesNotMatch(md, /\{\{|\}\}/);
  });

  test("resources list and read the raw templates", () => {
    const resources = byId.get(5).result.resources;
    assert.equal(resources.length, 22);
    assert.ok(resources.every((r) => r.uri.startsWith("policyseed://templates/") && r.mimeType === "text/markdown"));
    const c = byId.get(6).result.contents[0];
    assert.equal(c.uri, "policyseed://templates/access-control-policy");
    assert.equal(c.mimeType, "text/markdown");
    assert.match(c.text, /^---\nid: P03\n/);
    assert.match(c.text, /\{\{company\}\}/);
    assert.equal(byId.get(15).error.code, -32002);
  });

  test("unknown methods get -32601", () => {
    assert.equal(byId.get(7).error.code, -32601);
  });

  test("bad tool input returns isError results, not protocol errors", () => {
    const badSlug = byId.get(8).result;
    assert.equal(badSlug.isError, true);
    assert.match(badSlug.content[0].text, /Unknown policy "nope"/);
    const badIntake = byId.get(9).result;
    assert.equal(badIntake.isError, true);
    assert.match(badIntake.content[0].text, /product is required/);
    const badDir = byId.get(14).result;
    assert.equal(badDir.isError, true);
    assert.match(badDir.content[0].text, /not found/);
  });

  test("list_policies and intake_questions describe the catalog and the intake", () => {
    const list = byId.get(10).result.structuredContent;
    assert.equal(list.count, 22);
    assert.equal(list.policies[0].slug, "information-security-policy");
    assert.ok(list.policies.every((p) => p.id && p.title && p.owner_role && p.file_name.endsWith(".md")));
    const q = byId.get(11).result.structuredContent;
    assert.equal(q.fields.length, Object.keys(DEFAULT_INTAKE).length);
    const company = q.fields.find((f) => f.key === "company");
    assert.equal(company.required, true);
    assert.deepEqual(q.fields.find((f) => f.key === "review_cadence").allowed_values, ["Annual", "Semi-annual", "Quarterly"]);
  });

  test("render_all returns an index plus one item per policy", () => {
    const content = byId.get(12).result.content;
    assert.equal(content.length, 23);
    assert.match(content[0].text, /Rendered 22 policies for Acme, Inc\./);
    assert.match(content[1].text, /^<!-- file: 01-information-security-policy\.md -->\n# Acme, Inc\. /);
  });

  test("check_reviews reports overdue policies using the same logic as `check`", () => {
    const r = byId.get(13).result;
    assert.notEqual(r.isError, true);
    assert.match(r.content[0].text, /Overdue for review \(22\)/);
    assert.equal(r.structuredContent.all_current, false);
    assert.equal(r.structuredContent.cadence_days, 365);
  });

  test("initialize falls back to 2025-06-18 for an unknown protocol version and echoes known ones", async () => {
    const { stdout } = await runSession([init(1, "1999-01-01"), init(2, "2024-11-05")]);
    const [a, b] = parseLines(stdout);
    assert.equal(a.result.protocolVersion, "2025-06-18");
    assert.equal(b.result.protocolVersion, "2024-11-05");
  });
});
