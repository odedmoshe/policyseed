/**
 * Minimal, dependency-free template renderer for the policy templates in templates/.
 *
 * Supported syntax (and nothing else):
 *   {{key}}                          variable; unknown keys render as ""
 *   {{#if key}} ... {{/if}}          rendered when key is truthy
 *   {{#unless key}} ... {{/unless}}  rendered when key is falsy
 *   {{#each list}} ... {{/each}}     repeated for every item; {{this}} is the current item
 *
 * Blocks nest and may span multiple lines. A block tag that stands alone on a line
 * (only whitespace around it) is removed together with its line, so conditional
 * paragraphs and loops do not leave stray blank lines or indentation behind.
 * Loop iterations are joined with a newline when the loop body does not already end in one,
 * so both `{{#each x}}- {{this}}{{/each}}` and the multi-line form produce one item per line.
 *
 * Truthiness: false, "", 0, NaN, null, undefined and empty arrays are falsy; everything else is truthy.
 * Values: strings print as-is, numbers via String(), booleans as "true"/"false",
 * arrays joined with ", ", anything else as "".
 *
 * This is a faithful JavaScript port of the TypeScript renderer used by the hosted
 * generator (src/lib/render.ts). Behaviour, including edge cases, is intended to match exactly.
 */

const TAG_RE = /\{\{\s*(#if|#unless|#each|\/if|\/unless|\/each)?\s*([A-Za-z0-9_.@-]*)\s*\}\}/g;

export class TemplateSyntaxError extends Error {
  constructor(message) {
    super(message);
    this.name = "TemplateSyntaxError";
  }
}

function tokenize(src) {
  const tokens = [];
  let pos = 0;
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(src)) !== null) {
    const tagStart = m.index;
    const tagEnd = tagStart + m[0].length;
    const marker = m[1] ?? "";
    const key = m[2] ?? "";

    let token;
    if (marker === "") {
      if (key === "") throw new TemplateSyntaxError(`Empty tag at offset ${tagStart}`);
      token = { kind: "var", key };
    } else if (marker.startsWith("#")) {
      if (key === "") throw new TemplateSyntaxError(`Block tag ${m[0]} needs a key (offset ${tagStart})`);
      token = { kind: "open", op: marker.slice(1), key };
    } else {
      token = { kind: "close", op: marker.slice(1) };
    }

    let text = src.slice(pos, tagStart);
    let next = tagEnd;

    if (token.kind !== "var") {
      // Standalone-line detection: only whitespace before the tag on its line and only
      // whitespace after it up to the newline (or end of input).
      const lineStart = src.lastIndexOf("\n", tagStart - 1) + 1;
      const prefix = src.slice(lineStart, tagStart);
      const nl = src.indexOf("\n", tagEnd);
      const lineEnd = nl === -1 ? src.length : nl;
      const suffix = src.slice(tagEnd, lineEnd);
      if (/^[ \t]*$/.test(prefix) && /^[ \t\r]*$/.test(suffix)) {
        text = text.slice(0, text.length - prefix.length);
        next = nl === -1 ? src.length : nl + 1;
      }
    }

    if (text) tokens.push({ kind: "text", value: text });
    tokens.push(token);
    pos = next;
    TAG_RE.lastIndex = next;
  }
  if (pos < src.length) tokens.push({ kind: "text", value: src.slice(pos) });
  return tokens;
}

function parse(tokens) {
  const root = [];
  const stack = [];
  const current = () => (stack.length ? stack[stack.length - 1].children : root);

  for (const t of tokens) {
    if (t.kind === "text") current().push({ kind: "text", value: t.value });
    else if (t.kind === "var") current().push({ kind: "var", key: t.key });
    else if (t.kind === "open") stack.push({ op: t.op, key: t.key, children: [] });
    else {
      const top = stack.pop();
      if (!top) throw new TemplateSyntaxError(`Unexpected {{/${t.op}}} with no open block`);
      if (top.op !== t.op) throw new TemplateSyntaxError(`Mismatched block: {{#${top.op} ${top.key}}} closed by {{/${t.op}}}`);
      current().push({ kind: "block", op: top.op, key: top.key, children: top.children });
    }
  }
  if (stack.length) {
    const top = stack[stack.length - 1];
    throw new TemplateSyntaxError(`Unclosed block {{#${top.op} ${top.key}}}`);
  }
  return root;
}

export function isTruthy(v) {
  if (v === undefined || v === null || v === false || v === "") return false;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function stringifyValue(v) {
  if (typeof v === "string") return v;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return v.map(stringifyValue).filter((s) => s !== "").join(", ");
  return "";
}

function lookup(key, ctx, scope) {
  if (key === "this" || key === ".") return scope.length ? scope[scope.length - 1] : undefined;
  return Object.prototype.hasOwnProperty.call(ctx, key) ? ctx[key] : undefined;
}

function evaluate(nodes, ctx, scope) {
  let out = "";
  for (const n of nodes) {
    if (n.kind === "text") out += n.value;
    else if (n.kind === "var") out += stringifyValue(lookup(n.key, ctx, scope));
    else if (n.op === "if") {
      if (isTruthy(lookup(n.key, ctx, scope))) out += evaluate(n.children, ctx, scope);
    } else if (n.op === "unless") {
      if (!isTruthy(lookup(n.key, ctx, scope))) out += evaluate(n.children, ctx, scope);
    } else {
      const value = lookup(n.key, ctx, scope);
      const items = Array.isArray(value) ? value : isTruthy(value) ? [value] : [];
      let acc = "";
      for (let i = 0; i < items.length; i++) {
        const piece = evaluate(n.children, ctx, [...scope, items[i]]);
        if (i === 0) acc = piece;
        else acc += (acc.endsWith("\n") ? "" : "\n") + piece;
      }
      out += acc;
    }
  }
  return out;
}

/** Collapse runs of three or more blank (or whitespace-only) lines into two. */
export function collapseBlankLines(s) {
  return s.replace(/\n(?:[ \t]*\n){3,}/g, "\n\n\n");
}

export function renderTemplate(src, ctx) {
  return collapseBlankLines(evaluate(parse(tokenize(src)), ctx ?? {}, []));
}

/* ------------------------------------------------------------------------------------------------
 * Front matter: a simple YAML subset.
 *   key: value
 *   key: "quoted value"
 *   key: [a, b, c]
 *   key:
 *     - item
 *     - item
 * Lines starting with # are comments. Values are strings (or arrays of strings).
 * ---------------------------------------------------------------------------------------------- */

function unquote(v) {
  const t = v.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

export function parseFrontMatterMeta(block) {
  const meta = {};
  const bare = new Set(); // keys written as "key:" with nothing after (list header or empty value)
  let listKey = null;
  for (const raw of block.split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && listKey !== null) {
      const arr = meta[listKey];
      if (Array.isArray(arr)) arr.push(unquote(item[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    if (value === "") {
      meta[key] = [];
      bare.add(key);
      listKey = key;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      meta[key] = inner === "" ? [] : inner.split(",").map(unquote).filter((s) => s !== "");
      listKey = null;
    } else {
      meta[key] = unquote(value);
      listKey = null;
    }
  }
  // "key:" followed by no "- item" lines is an empty string, not an empty list.
  for (const key of bare) {
    const v = meta[key];
    if (Array.isArray(v) && v.length === 0) meta[key] = "";
  }
  return meta;
}

export function parseFrontMatter(src) {
  const text = src.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  if (!text.startsWith("---\n") && text !== "---") return { meta: {}, body: text };
  const lines = text.split("\n");
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { meta: {}, body: text };
  const meta = parseFrontMatterMeta(lines.slice(1, end).join("\n"));
  let body = lines.slice(end + 1).join("\n");
  if (body.startsWith("\n")) body = body.slice(1);
  return { meta, body };
}
