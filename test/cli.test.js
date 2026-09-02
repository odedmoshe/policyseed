import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, "..", "bin", "policyseed.js");

function run(args, cwd) {
  return execFileSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });
}

function runFailing(args, cwd) {
  try {
    run(args, cwd);
    return { status: 0, output: "" };
  } catch (err) {
    return { status: err.status ?? 1, output: (err.stdout ?? "") + (err.stderr ?? "") };
  }
}

function withTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "policyseed-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const REQUIRED_HEADINGS = [
  "## 1. Purpose",
  "## 2. Scope",
  "## 3. Roles and Responsibilities",
  "## 4. Policy Statements",
  "## 5. Procedures",
  "## 6. Exceptions",
  "## 7. Enforcement",
  "## 8. Review Cadence",
  "## 9. Revision History",
];

function fillIntake(dir) {
  const path = join(dir, "intake.yaml");
  let text = readFileSync(path, "utf8");
  text = text
    .replace(/^company:.*$/m, "company: Acme, Inc.")
    .replace(/^product:.*$/m, "product: Widget Suite")
    .replace(/^security_owner:.*$/m, "security_owner: Jane Doe, CTO")
    .replace(/^approver:.*$/m, "approver: Jane Doe, CTO")
    .replace(/^incident_contact:.*$/m, "incident_contact: security@acme.example");
  writeFileSync(path, text, "utf8");
}

describe("policyseed CLI smoke test", () => {
  test("init writes a commented intake.yaml", () => {
    withTempDir((dir) => {
      const out = run(["init"], dir);
      assert.match(out, /Wrote intake\.yaml/);
      const intakePath = join(dir, "intake.yaml");
      assert.ok(existsSync(intakePath));
      const text = readFileSync(intakePath, "utf8");
      assert.match(text, /^# Policyseed intake/);
      assert.match(text, /^company:/m);
      assert.match(text, /^effective_date: \d{4}-\d{2}-\d{2}/m);
    });
  });

  test("init refuses to overwrite without --force", () => {
    withTempDir((dir) => {
      run(["init"], dir);
      const result = runFailing(["init"], dir);
      assert.equal(result.status, 1);
      assert.match(result.output, /already exists/);
      run(["init", "--force"], dir); // should not throw
    });
  });

  test("build renders 22 policies, each with the 9 standard headings", () => {
    withTempDir((dir) => {
      run(["init"], dir);
      fillIntake(dir);
      const out = run(["build"], dir);
      assert.match(out, /Wrote 22 policies to policies\//);

      const policiesDir = join(dir, "policies");
      const files = readdirSync(policiesDir).filter((f) => f.endsWith(".md"));
      assert.equal(files.length, 22);

      for (const f of files) {
        const content = readFileSync(join(policiesDir, f), "utf8");
        assert.match(content, /^# Acme, Inc\. /, `${f} should start with the company-titled H1`);
        const headings = (content.match(/^## \d+\.\s.+$/gm) || []).map((h) => h.replace(/\s+$/, ""));
        assert.equal(headings.length, 9, `${f} should have exactly 9 "## " headings, found ${headings.length}`);
        assert.deepEqual(headings, REQUIRED_HEADINGS, `${f} headings should match the standard 9 sections in order`);
        assert.doesNotMatch(content, /\{\{|\}\}/, `${f} should have no unrendered template tags`);
      }
    });
  });

  test("build fails clearly on an invalid intake", () => {
    withTempDir((dir) => {
      run(["init"], dir);
      // leave required fields (company, product, security_owner, approver, incident_contact) empty
      const result = runFailing(["build"], dir);
      assert.equal(result.status, 1);
      assert.match(result.output, /Invalid intake/);
      assert.match(result.output, /company/);
    });
  });

  test("check reports overdue policies and exits 1", () => {
    withTempDir((dir) => {
      run(["init"], dir);
      fillIntake(dir);
      // Backdate effective_date well past the Annual (365d) cadence.
      const intakePath = join(dir, "intake.yaml");
      const text = readFileSync(intakePath, "utf8").replace(/^effective_date:.*$/m, "effective_date: 2000-01-01");
      writeFileSync(intakePath, text, "utf8");
      run(["build"], dir);

      const result = runFailing(["check"], dir);
      assert.equal(result.status, 1);
      assert.match(result.output, /Overdue for review/);
    });
  });

  test("check passes when policies were just built with today's date", () => {
    withTempDir((dir) => {
      run(["init"], dir);
      fillIntake(dir);
      run(["build"], dir);
      const out = run(["check"], dir);
      assert.match(out, /All policies are within their review cadence/);
    });
  });

  test("list prints all 22 templates", () => {
    const out = run(["list"]);
    assert.match(out, /22 policy templates/);
    assert.match(out, /Information Security Policy/);
    assert.match(out, /Privacy and Data Protection Policy/);
  });

  test("--help and --version work", () => {
    assert.match(run(["--help"]), /Usage:/);
    assert.match(run(["--version"]).trim(), /^\d+\.\d+\.\d+$/);
  });
});
