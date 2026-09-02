/**
 * A tiny YAML subset, just enough for intake.yaml. Not a general YAML parser.
 *
 * Supported on parse:
 *   key: value                 bare scalar string
 *   key: "quoted value"        quoted string (single or double quotes)
 *   key: true / key: false     boolean
 *   key: [a, b, "c d"]         inline list
 *   key:                       block list header
 *     - item
 *     - item
 *   key:                       (with no following "- item" lines) parses as an empty string,
 *                               not an empty list — mirrors the front-matter parser in lib/render.js
 *   # comment                  full-line comments only; blank lines are ignored
 *
 * Anything else (nested maps, multi-line scalars, anchors, etc.) is out of scope.
 */

function unquote(v) {
  const t = v.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseScalar(v) {
  const t = v.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  return unquote(t);
}

export function parseYaml(text) {
  const src = String(text).replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const result = {};
  const bare = new Set();
  let listKey = null;

  for (const raw of src.split("\n")) {
    const line = raw;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && listKey !== null) {
      const arr = result[listKey];
      if (Array.isArray(arr)) arr.push(parseScalar(item[1]));
      continue;
    }

    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();

    if (value === "") {
      result[key] = [];
      bare.add(key);
      listKey = key;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      result[key] = inner === "" ? [] : inner.split(",").map((s) => parseScalar(s));
      listKey = null;
    } else {
      result[key] = parseScalar(value);
      listKey = null;
    }
  }

  // "key:" followed by no "- item" lines is an empty string, not an empty list.
  for (const key of bare) {
    if (Array.isArray(result[key]) && result[key].length === 0) result[key] = "";
  }

  return result;
}

/** Format one scalar value (string or boolean) for YAML output, quoting where needed. */
export function yamlScalar(v) {
  if (typeof v === "boolean") return v ? "true" : "false";
  const s = String(v ?? "");
  if (s === "") return '""';
  if (/^[\s]|[\s]$|[:#\[\]{}'"]/.test(s)) return JSON.stringify(s);
  return s;
}

/** Format one `key: value` line, or a `key:` block-list header followed by "  - item" lines. */
export function yamlKeyLine(key, value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return `${key}: []`;
    return `${key}:\n` + value.map((v) => `  - ${yamlScalar(v)}`).join("\n");
  }
  return `${key}: ${yamlScalar(value)}`;
}

/** Serialize a full intake-shaped object in the given key order, one `yamlKeyLine` per field. */
export function stringifyYaml(obj, keyOrder) {
  const keys = keyOrder ?? Object.keys(obj);
  return keys.map((k) => yamlKeyLine(k, obj[k])).join("\n") + "\n";
}
