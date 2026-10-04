/**
 * Model Context Protocol (MCP) server for policyseed, implemented by hand so the package keeps
 * zero runtime dependencies.
 *
 * Transport: stdio, newline-delimited JSON-RPC 2.0 (one JSON message per line, UTF-8, no embedded
 * newlines). stdout carries protocol messages only; every diagnostic goes to stderr.
 *
 * Methods: initialize, notifications/initialized, ping, tools/list, tools/call, resources/list,
 * resources/templates/list, resources/read. Anything else gets JSON-RPC error -32601.
 *
 * The tools reuse exactly the same code paths as the CLI (lib/policies.js, lib/context.js), so
 * a policy rendered over MCP is byte-for-byte what `policyseed build` writes to disk.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, isAbsolute } from "node:path";

import { DEFAULT_INTAKE, INTAKE_FIELDS, toTemplateContext, validateIntake } from "./context.js";
import { parseYaml } from "./yaml.js";
import {
  readVersion, loadTemplates, policyFileStem, renderPolicy, CADENCE_DAYS, evaluateReviews, readPolicyFiles,
} from "./policies.js";

export const KNOWN_PROTOCOL_VERSIONS = ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"];
export const DEFAULT_PROTOCOL_VERSION = "2025-06-18";

const RESOURCE_PREFIX = "policyseed://templates/";

// JSON-RPC 2.0 error codes.
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;
const RESOURCE_NOT_FOUND = -32002; // MCP convention for resources/read on an unknown URI

class RpcError extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

/** Thrown inside a tool handler to produce an `isError: true` tool result with this message. */
class ToolInputError extends Error {}

const SERVER_INSTRUCTIONS = [
  "Policyseed renders 22 SOC 2 governance policies (Markdown) from a company intake. It is deterministic: no LLM writes the policy text, the templates do.",
  "Typical flow: call intake_questions, interview the user for the required fields (company, product, security_owner, approver, incident_contact) and any defaults they want to change,",
  "then call render_policy for one policy or render_all for the full set. Offer to save each policy as NN-<slug>.md (the same file names `policyseed build` uses).",
  "check_reviews reports which already-rendered policies in a directory are overdue for their periodic review.",
].join(" ");

/* ---------------------------------------------------------------------------------------------
 * Intake schema (derived from INTAKE_FIELDS so it never drifts from validateIntake)
 * ------------------------------------------------------------------------------------------- */

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** The defaults applied to omitted intake fields: DEFAULT_INTAKE plus today's effective_date. */
function intakeDefaults() {
  return { ...DEFAULT_INTAKE, effective_date: todayIso() };
}

function fieldJsonSchema(f) {
  const s = { description: f.comment };
  switch (f.type) {
    case "enum":
      Object.assign(s, { type: "string", enum: f.allowed });
      break;
    case "enum[]":
      Object.assign(s, { type: "array", items: { type: "string", enum: f.allowed }, uniqueItems: true });
      break;
    case "string[]":
      Object.assign(s, { type: "array", items: { type: "string", minLength: 1, maxLength: f.maxLength } });
      break;
    case "boolean":
      s.type = "boolean";
      break;
    case "date":
      Object.assign(s, { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" });
      break;
    default:
      s.type = "string";
      if (f.maxLength) s.maxLength = f.maxLength;
  }
  if (s.type === "array") {
    if (f.min) s.minItems = f.min;
    if (f.max !== undefined) s.maxItems = f.max;
  }
  return s;
}

/** Fields that have no usable default and must always be supplied. */
const REQUIRED_KEYS = INTAKE_FIELDS.filter((f) => f.type === "string" && f.required).map((f) => f.key);

const INTAKE_SCHEMA = {
  type: "object",
  description:
    "The company intake. Only company, product, security_owner, approver and incident_contact are required; " +
    "any omitted field takes its default (see intake_questions; effective_date defaults to today).",
  properties: Object.fromEntries(INTAKE_FIELDS.map((f) => [f.key, fieldJsonSchema(f)])),
  required: REQUIRED_KEYS,
};

/* ---------------------------------------------------------------------------------------------
 * Tool helpers
 * ------------------------------------------------------------------------------------------- */

function text(t) {
  return { type: "text", text: t };
}

function jsonResult(obj) {
  return { content: [text(JSON.stringify(obj, null, 2))], structuredContent: obj };
}

function requireObject(value, name) {
  if (value === undefined || value === null) throw new ToolInputError(`Missing required argument "${name}" (an object).`);
  if (typeof value !== "object" || Array.isArray(value)) throw new ToolInputError(`Argument "${name}" must be an object.`);
  return value;
}

function optionalString(args, name) {
  const v = args[name];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string" || v.trim() === "") throw new ToolInputError(`Argument "${name}" must be a non-empty string.`);
  return v;
}

/** Merge defaults, validate exactly as `build` does, and return the template context. */
function contextFromIntake(rawIntake) {
  const given = requireObject(rawIntake, "intake");
  const known = new Set(INTAKE_FIELDS.map((f) => f.key));
  const unknownKeys = Object.keys(given).filter((k) => !known.has(k));
  const intake = { ...intakeDefaults() };
  for (const [k, v] of Object.entries(given)) if (known.has(k) && v !== undefined && v !== null) intake[k] = v;

  const { ok, errors } = validateIntake(intake);
  if (!ok) {
    const lines = ["Invalid intake:", ...errors.map((e) => `  - ${e}`)];
    if (unknownKeys.length) lines.push(`Unrecognized fields (ignored): ${unknownKeys.join(", ")}`);
    lines.push("Call intake_questions for every field's type, allowed values and default.");
    throw new ToolInputError(lines.join("\n"));
  }
  return toTemplateContext(intake);
}

function findTemplate(templates, rawSlug) {
  if (typeof rawSlug !== "string" || rawSlug.trim() === "") {
    throw new ToolInputError('Missing required argument "slug" (string). Call list_policies for the valid slugs.');
  }
  const q = rawSlug.trim().toLowerCase().replace(/\.md$/, "");
  const t = templates.find(
    (x) => x.slug.toLowerCase() === q || x.id.toLowerCase() === q || policyFileStem(x).toLowerCase() === q
  );
  if (!t) {
    throw new ToolInputError(
      `Unknown policy "${rawSlug}". Valid slugs:\n${templates.map((x) => `  - ${x.slug} (${x.id})`).join("\n")}`
    );
  }
  return t;
}

function policySummary(t) {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    summary: t.short,
    owner_role: t.owner_role,
    order: t.order,
    file_name: `${policyFileStem(t)}.md`,
    tsc_criteria: t.tsc,
    resource_uri: `${RESOURCE_PREFIX}${t.slug}`,
  };
}

/* ---------------------------------------------------------------------------------------------
 * Tools
 * ------------------------------------------------------------------------------------------- */

function buildTools({ cwd }) {
  return [
    {
      name: "list_policies",
      title: "List SOC 2 policies",
      description:
        "List the 22 SOC 2 policy templates Policyseed can render: id, slug, title, one-line summary, owner role, " +
        "output file name and the SOC 2 Trust Services Criteria each covers. Use the slug with render_policy. " +
        "Every policy shares one review cadence, set by the intake's review_cadence field (Annual by default).",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler() {
        const templates = loadTemplates();
        return jsonResult({
          count: templates.length,
          review_cadence_note:
            "Review cadence is not per-policy: all policies use the intake's review_cadence (Annual: 365 days, Semi-annual: 182, Quarterly: 91).",
          policies: templates.map(policySummary),
        });
      },
    },
    {
      name: "intake_questions",
      title: "Get intake questions",
      description:
        "Return every intake field the policy renderer needs, with type, whether it is required, allowed values, " +
        "length limits, default and a description. Call this first, then interview the user: ask for the required " +
        "fields (company, product, security_owner, approver, incident_contact) and confirm or change the defaults " +
        "(cloud, identity provider, data types, etc.) before calling render_policy or render_all.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler() {
        const defaults = intakeDefaults();
        const fields = INTAKE_FIELDS.map((f) => {
          const out = {
            key: f.key,
            type: f.type,
            required: REQUIRED_KEYS.includes(f.key),
            description: f.comment,
          };
          if (f.allowed) out.allowed_values = f.allowed;
          if (f.min !== undefined) out.min_items = f.min;
          if (f.max !== undefined) out.max_items = f.max;
          if (f.maxLength !== undefined) out.max_length = f.maxLength;
          out.default = defaults[f.key];
          return out;
        });
        return jsonResult({
          notes: [
            "Pass the answers as the `intake` object to render_policy / render_all. Omitted fields use the default shown.",
            "Enum values are case-sensitive and must match allowed_values exactly.",
            'People fields are "Name, Title", e.g. "Jane Doe, CTO". effective_date is YYYY-MM-DD.',
          ],
          fields,
          json_schema: INTAKE_SCHEMA,
          example_intake: {
            ...defaults,
            company: "Acme, Inc.",
            product: "Acme Cloud",
            security_owner: "Jane Doe, CTO",
            approver: "John Smith, CEO",
            incident_contact: "security@acme.example",
          },
        });
      },
    },
    {
      name: "render_policy",
      title: "Render one policy",
      description:
        "Render a single SOC 2 policy as Markdown from the company intake, exactly as `policyseed build` writes it " +
        "(company-titled H1, 9 standard sections, revision history). Returns the Markdown text; suggest saving it " +
        "as the file_name shown by list_policies. Invalid intake values are reported back so you can fix them.",
      inputSchema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: 'Policy slug from list_policies, e.g. "access-control-policy". The policy id ("P03") also works.',
          },
          intake: INTAKE_SCHEMA,
        },
        required: ["slug", "intake"],
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler(args) {
        const templates = loadTemplates();
        const t = findTemplate(templates, args.slug);
        const ctx = contextFromIntake(args.intake);
        return { content: [text(renderPolicy(t, ctx))] };
      },
    },
    {
      name: "render_all",
      title: "Render all policies",
      description:
        "Render all 22 SOC 2 policies (or the subset named in `slugs`) as Markdown from the company intake. " +
        "Output is large (roughly 250 KB for all 22): the first content item is an index, then one item per policy " +
        "starting with an HTML comment naming its file, e.g. <!-- file: 03-access-control-policy.md -->. " +
        "Prefer render_policy when the user only needs one or two documents.",
      inputSchema: {
        type: "object",
        properties: {
          intake: INTAKE_SCHEMA,
          slugs: {
            type: "array",
            items: { type: "string" },
            description: "Optional subset of policy slugs to render. Omit to render all 22.",
          },
        },
        required: ["intake"],
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler(args) {
        const templates = loadTemplates();
        let selected = templates;
        if (args.slugs !== undefined && args.slugs !== null) {
          if (!Array.isArray(args.slugs)) throw new ToolInputError('Argument "slugs" must be an array of strings.');
          selected = [...new Set(args.slugs.map((s) => findTemplate(templates, s)))];
        }
        const ctx = contextFromIntake(args.intake);
        const rendered = selected.map((t) => ({ file: `${policyFileStem(t)}.md`, title: t.title, md: renderPolicy(t, ctx) }));
        const index = [
          `Rendered ${rendered.length} polic${rendered.length === 1 ? "y" : "ies"} for ${ctx.company}.`,
          "Each following content item is one policy; save it under the file name in its first line.",
          "",
          ...rendered.map((r) => `- ${r.file}: ${r.title}`),
        ].join("\n");
        return { content: [text(index), ...rendered.map((r) => text(`<!-- file: ${r.file} -->\n${r.md}`))] };
      },
    },
    {
      name: "check_reviews",
      title: "Check policy review dates",
      description:
        "Run the same logic as `policyseed check`: read previously rendered policies (NN-<slug>.md files) and report " +
        "which are overdue for their periodic review, based on the last date in each policy's revision history and " +
        "the intake's review_cadence (Annual 365d, Semi-annual 182d, Quarterly 91d). Paths are on the machine running " +
        "this server; pass `directory` as an absolute path to the project, since the server's working directory may " +
        "not be the user's project.",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Project directory containing intake.yaml and policies/. Defaults to the server's working directory.",
          },
          policies_dir: {
            type: "string",
            description: 'Directory of rendered policy .md files. Relative paths resolve against `directory`. Default "policies".',
          },
          intake_path: {
            type: "string",
            description: 'Path to intake.yaml. Relative paths resolve against `directory`. Default "intake.yaml". Ignored if `intake` is given.',
          },
          intake: {
            type: "object",
            description: "Optional inline intake instead of reading intake.yaml; only review_cadence and effective_date are used.",
            properties: {
              review_cadence: { type: "string", enum: Object.keys(CADENCE_DAYS) },
              effective_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
            },
          },
        },
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler(args) {
        const directory = optionalString(args, "directory");
        const base = directory ? resolve(cwd, directory) : cwd;
        const at = (p) => (isAbsolute(p) ? p : resolve(base, p));
        const policiesDir = at(optionalString(args, "policies_dir") ?? "policies");

        let intake;
        let intakeSource;
        if (args.intake !== undefined && args.intake !== null) {
          intake = requireObject(args.intake, "intake");
          intakeSource = "inline intake";
        } else {
          const intakePath = at(optionalString(args, "intake_path") ?? "intake.yaml");
          if (!existsSync(intakePath)) {
            throw new ToolInputError(
              `Intake file not found: ${intakePath}\nPass "directory" (absolute path to the project), "intake_path", or an inline "intake" with review_cadence.`
            );
          }
          try {
            intake = parseYaml(readFileSync(intakePath, "utf8"));
          } catch (err) {
            throw new ToolInputError(`Could not parse ${intakePath}: ${err.message}`);
          }
          intakeSource = intakePath;
        }

        const cadence = CADENCE_DAYS[intake.review_cadence];
        if (!cadence) {
          throw new ToolInputError(
            `Unknown review_cadence "${intake.review_cadence ?? ""}" in ${intakeSource}. Expected one of: ${Object.keys(CADENCE_DAYS).join(", ")}`
          );
        }
        if (!existsSync(policiesDir) || !statSync(policiesDir).isDirectory()) {
          throw new ToolInputError(
            `Policies directory not found: ${policiesDir}\nRender the policies first (render_all, or "policyseed build"), or pass "directory"/"policies_dir".`
          );
        }
        const policies = readPolicyFiles(policiesDir);
        if (policies.length === 0) throw new ToolInputError(`No policy files found in ${policiesDir}`);

        const { ok, overdue, unknown } = evaluateReviews(intake, policies);
        const lines = [`Review cadence: ${intake.review_cadence} (${cadence} days). Checked ${policies.length} file(s) in ${policiesDir}.`];
        if (overdue.length) {
          lines.push("", `Overdue for review (${overdue.length}):`);
          for (const r of overdue) lines.push(`  - ${r.file}  (last reviewed ${r.lastDate}, ${r.days}d ago)`);
        }
        if (unknown.length) {
          lines.push("", `Could not determine a review date (${unknown.length}):`);
          for (const r of unknown) lines.push(`  - ${r.file}`);
        }
        if (ok.length) {
          lines.push("", `Up to date (${ok.length}):`);
          for (const r of ok) lines.push(`  - ${r.file}  (last reviewed ${r.lastDate}, ${r.days}d ago)`);
        }
        if (!overdue.length && !unknown.length) lines.push("", "All policies are within their review cadence.");

        const structured = {
          policies_dir: policiesDir,
          review_cadence: intake.review_cadence,
          cadence_days: cadence,
          all_current: overdue.length === 0 && unknown.length === 0,
          overdue: overdue.map((r) => ({ file: r.file, last_reviewed: r.lastDate, days_since: r.days })),
          unknown: unknown.map((r) => r.file),
          up_to_date: ok.map((r) => ({ file: r.file, last_reviewed: r.lastDate, days_since: r.days })),
        };
        return { content: [text(lines.join("\n"))], structuredContent: structured };
      },
    },
  ];
}

/* ---------------------------------------------------------------------------------------------
 * Server
 * ------------------------------------------------------------------------------------------- */

/**
 * Create a transport-independent MCP server. `handleMessage(obj)` takes one parsed JSON-RPC
 * message and returns the response object, or null when no response is due (notifications).
 */
export function createMcpServer({ cwd = process.cwd(), log = (m) => process.stderr.write(`[policyseed mcp] ${m}\n`) } = {}) {
  const tools = buildTools({ cwd });
  const toolsByName = new Map(tools.map((t) => [t.name, t]));

  const methods = {
    initialize(params) {
      const requested = params && typeof params.protocolVersion === "string" ? params.protocolVersion : undefined;
      const protocolVersion = KNOWN_PROTOCOL_VERSIONS.includes(requested) ? requested : DEFAULT_PROTOCOL_VERSION;
      return {
        protocolVersion,
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "policyseed", title: "Policyseed", version: readVersion() },
        instructions: SERVER_INSTRUCTIONS,
      };
    },
    ping() {
      return {};
    },
    "tools/list"() {
      return {
        tools: tools.map(({ name, title, description, inputSchema, annotations }) => ({ name, title, description, inputSchema, annotations })),
      };
    },
    "tools/call"(params) {
      if (!params || typeof params.name !== "string") throw new RpcError(INVALID_PARAMS, 'tools/call requires a string "name"');
      const tool = toolsByName.get(params.name);
      if (!tool) throw new RpcError(INVALID_PARAMS, `Unknown tool: ${params.name}. Available: ${tools.map((t) => t.name).join(", ")}`);
      const args = params.arguments ?? {};
      if (typeof args !== "object" || Array.isArray(args)) {
        return { content: [text('Tool "arguments" must be an object.')], isError: true };
      }
      try {
        return tool.handler(args);
      } catch (err) {
        if (!(err instanceof ToolInputError)) log(`tool ${tool.name} failed: ${err.stack || err.message}`);
        return { content: [text(err instanceof ToolInputError ? err.message : `${tool.name} failed: ${err.message}`)], isError: true };
      }
    },
    "resources/list"() {
      return {
        resources: loadTemplates().map((t) => ({
          uri: `${RESOURCE_PREFIX}${t.slug}`,
          name: t.slug,
          title: `${t.title} (template)`,
          description: `Raw policyseed template with front matter and {{tags}}: ${t.short}`,
          mimeType: "text/markdown",
        })),
      };
    },
    "resources/templates/list"() {
      return {
        resourceTemplates: [
          {
            uriTemplate: `${RESOURCE_PREFIX}{slug}`,
            name: "policy-template",
            title: "Policy template",
            description: "Raw Markdown template for one policy, by slug (see list_policies).",
            mimeType: "text/markdown",
          },
        ],
      };
    },
    "resources/read"(params) {
      const uri = params && params.uri;
      if (typeof uri !== "string") throw new RpcError(INVALID_PARAMS, 'resources/read requires a string "uri"');
      const slug = uri.startsWith(RESOURCE_PREFIX) ? uri.slice(RESOURCE_PREFIX.length) : null;
      const t = slug ? loadTemplates().find((x) => x.slug === slug) : undefined;
      if (!t) throw new RpcError(RESOURCE_NOT_FOUND, `Resource not found: ${uri}`, { uri });
      return { contents: [{ uri, mimeType: "text/markdown", text: t.raw }] };
    },
  };

  function handleMessage(msg) {
    if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
      return errorResponse(null, INVALID_REQUEST, "Invalid Request: expected a JSON-RPC object");
    }
    const hasId = Object.prototype.hasOwnProperty.call(msg, "id") && msg.id !== undefined;
    if (typeof msg.method !== "string") {
      // A response to something we sent (we never send requests) — nothing to do.
      if (hasId && ("result" in msg || "error" in msg)) return null;
      return errorResponse(hasId ? msg.id : null, INVALID_REQUEST, "Invalid Request: missing method");
    }
    if (!hasId) {
      // Notification: never answered. notifications/initialized, notifications/cancelled, etc.
      return null;
    }
    if (msg.jsonrpc !== "2.0") return errorResponse(msg.id, INVALID_REQUEST, 'Invalid Request: jsonrpc must be "2.0"');

    const fn = Object.prototype.hasOwnProperty.call(methods, msg.method) ? methods[msg.method] : null;
    if (!fn) return errorResponse(msg.id, METHOD_NOT_FOUND, `Method not found: ${msg.method}`);
    try {
      return { jsonrpc: "2.0", id: msg.id, result: fn(msg.params) };
    } catch (err) {
      if (err instanceof RpcError) return errorResponse(msg.id, err.code, err.message, err.data);
      log(`${msg.method} failed: ${err.stack || err.message}`);
      return errorResponse(msg.id, INTERNAL_ERROR, `Internal error: ${err.message}`);
    }
  }

  /** Handle one raw line from the transport; returns the serialized reply line or null. */
  function handleLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return JSON.stringify(errorResponse(null, PARSE_ERROR, "Parse error: each line must be one JSON-RPC message"));
    }
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return JSON.stringify(errorResponse(null, INVALID_REQUEST, "Invalid Request: empty batch"));
      const replies = parsed.map(handleMessage).filter(Boolean);
      return replies.length ? JSON.stringify(replies) : null;
    }
    const reply = handleMessage(parsed);
    return reply ? JSON.stringify(reply) : null;
  }

  return { handleMessage, handleLine, tools };
}

function errorResponse(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id: id ?? null, error };
}

/** Run the server over stdio until stdin closes. */
export function startMcpServer({ input = process.stdin, output = process.stdout, cwd = process.cwd() } = {}) {
  // Guard the protocol stream: anything that would print to stdout goes to stderr instead.
  const toStderr = (...a) => process.stderr.write(`${a.map(String).join(" ")}\n`);
  console.log = toStderr;
  console.info = toStderr;
  console.debug = toStderr;

  const server = createMcpServer({ cwd });
  process.stderr.write(`[policyseed mcp] policyseed ${readVersion()} MCP server listening on stdio\n`);

  let buffer = "";
  input.setEncoding("utf8");
  input.on("data", (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      const reply = server.handleLine(line);
      if (reply) output.write(`${reply}\n`);
    }
  });
  input.on("end", () => {
    const reply = server.handleLine(buffer);
    buffer = "";
    if (reply) output.write(`${reply}\n`);
  });
  return server;
}
