/**
 * Intake schema, defaults and template-context mapping — a faithful JavaScript port of
 * src/lib/intake.ts (minus the browser-only URL-hash/localStorage helpers, which have no
 * meaning in a CLI). validateIntake() replaces the zod schema with hand-written checks that
 * enforce the same required fields, string lengths and enum values.
 */

export const HEADCOUNTS = ["1-10", "11-50", "51-200", "201+"];
export const WORK_MODELS = ["Remote", "Hybrid", "Office"];
export const CLOUDS = ["AWS", "GCP", "Azure", "Vercel", "Fly.io", "Hetzner", "Cloudflare", "Other"];
export const SCMS = ["GitHub", "GitLab", "Bitbucket", "Other"];
export const IDPS = ["Google Workspace", "Okta", "Microsoft Entra", "JumpCloud", "None"];
export const DATA_TYPES = ["PII", "PHI", "Payment"];
export const APP_TYPES = ["Web SaaS", "API", "Mobile", "Multiple"];
export const TSC_SCOPES = ["Security", "Availability", "Confidentiality"];
export const REVIEW_CADENCES = ["Annual", "Semi-annual", "Quarterly"];

/**
 * Same shape as the hosted app's DEFAULT_INTAKE, except effective_date: the hosted app bakes in
 * a fixed build-time date, which would immediately look stale in a general-purpose CLI, so this
 * is left as "" here and the `init` command fills it in with today's date at write time.
 */
export const DEFAULT_INTAKE = {
  company: "",
  product: "",
  headcount: "11-50",
  work_model: "Remote",
  cloud: ["AWS"],
  scm: "GitHub",
  cicd: "GitHub Actions",
  idp: "Google Workspace",
  mfa: true,
  mdm: "",
  password_manager: "1Password",
  data_types: ["PII"],
  app_type: "Web SaaS",
  vendors: [],
  security_owner: "",
  approver: "",
  incident_contact: "",
  backup_tool: "",
  backup_cadence: "Daily",
  logging_tool: "",
  tsc_scope: ["Security"],
  review_cadence: "Annual",
  effective_date: "",
};

export function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

/** Neutral prose for the "Other" enum values so no policy prints the literal word "Other". */
export const OTHER_CLOUD_PHRASE = "the hosting provider";
export const OTHER_CLOUD_PHRASE_PLURAL = "other hosting providers";
export const OTHER_SCM_PHRASE = "the source control system";

/** "AWS and Other" -> "AWS and other hosting providers"; ["Other"] -> "the hosting provider". */
export function cloudNames(cloud) {
  if (cloud.length === 1 && cloud[0] === "Other") return [OTHER_CLOUD_PHRASE];
  return cloud.map((c) => (c === "Other" ? OTHER_CLOUD_PHRASE_PLURAL : c));
}

export function scmName(scm) {
  return scm === "Other" ? OTHER_SCM_PHRASE : scm;
}

/** "Annual" -> "annual" (adjective) and "annually" (adverb) for mid-sentence use in the templates. */
export function cadenceWords(cadence) {
  switch (cadence) {
    case "Quarterly":
      return { lc: "quarterly", adverb: "quarterly" };
    case "Semi-annual":
      return { lc: "semi-annual", adverb: "every six months" };
    default:
      return { lc: "annual", adverb: "annually" };
  }
}

/** Flat context consumed by the renderer (lib/render.js) and the policy templates. */
export function toTemplateContext(i) {
  const has = (s) => typeof s === "string" && s.trim().length > 0 && !/^(none|n\/a|no)$/i.test(s.trim());
  const clouds = cloudNames(i.cloud);
  const cadence = cadenceWords(i.review_cadence);
  return {
    company: i.company, product: i.product, headcount: i.headcount, work_model: i.work_model,
    cloud: joinList(clouds), cloud_list: clouds, scm: scmName(i.scm), cicd: i.cicd || "the CI/CD pipeline", idp: i.idp,
    mfa: i.mfa, idp_none: i.idp === "None",
    mdm: i.mdm, has_mdm: has(i.mdm), password_manager: i.password_manager, has_password_manager: has(i.password_manager),
    data_types: joinList(i.data_types), has_pii: i.data_types.includes("PII"), has_phi: i.data_types.includes("PHI"),
    has_payment: i.data_types.includes("Payment"), has_sensitive_data: i.data_types.length > 0,
    app_type: i.app_type, is_mobile: i.app_type === "Mobile" || i.app_type === "Multiple", is_api: i.app_type === "API" || i.app_type === "Multiple",
    vendors: joinList(i.vendors), vendor_list: i.vendors, has_vendors: i.vendors.length > 0,
    security_owner: i.security_owner, approver: i.approver, incident_contact: i.incident_contact,
    backup_tool: i.backup_tool, has_backup_tool: has(i.backup_tool), backup_cadence: i.backup_cadence || "daily", logging_tool: i.logging_tool, has_logging_tool: has(i.logging_tool),
    tsc_scope: joinList(i.tsc_scope), scope_availability: i.tsc_scope.includes("Availability"), scope_confidentiality: i.tsc_scope.includes("Confidentiality"),
    review_cadence: i.review_cadence, review_cadence_lc: cadence.lc, review_cadence_adverb: cadence.adverb,
    effective_date: i.effective_date, policy_version: "1.0", remote_or_hybrid: i.work_model !== "Office",
  };
}

/**
 * Hand-written equivalent of the zod IntakeSchema in src/lib/intake.ts. Returns
 * { ok: boolean, errors: string[] }. Mirrors the same required fields, max lengths,
 * array bounds and enum values; does not mutate or coerce the input.
 */
export function validateIntake(obj) {
  const errors = [];
  const o = obj && typeof obj === "object" ? obj : {};

  const str = (key, { required = true, max = Infinity } = {}) => {
    const v = o[key];
    if (typeof v !== "string") {
      errors.push(`${key} must be a string`);
      return;
    }
    const t = v.trim();
    if (required && t.length < 1) errors.push(`${key} is required`);
    if (t.length > max) errors.push(`${key} must be at most ${max} characters`);
  };

  const enumField = (key, allowed) => {
    const v = o[key];
    if (!allowed.includes(v)) errors.push(`${key} must be one of: ${allowed.join(", ")} (got ${JSON.stringify(v ?? "")})`);
  };

  const enumArray = (key, allowed, { min = 0, max = Infinity } = {}) => {
    const v = o[key];
    if (!Array.isArray(v)) {
      errors.push(`${key} must be a list`);
      return;
    }
    if (v.length < min) errors.push(`${key} must have at least ${min} item(s)`);
    if (v.length > max) errors.push(`${key} must have at most ${max} item(s)`);
    for (const item of v) {
      if (!allowed.includes(item)) errors.push(`${key} contains an invalid value: ${JSON.stringify(item)} (allowed: ${allowed.join(", ")})`);
    }
  };

  str("company", { max: 120 });
  str("product", { max: 120 });
  enumField("headcount", HEADCOUNTS);
  enumField("work_model", WORK_MODELS);
  enumArray("cloud", CLOUDS, { min: 1, max: 8 });
  enumField("scm", SCMS);
  str("cicd", { required: false, max: 80 });
  enumField("idp", IDPS);
  if (typeof o.mfa !== "boolean") errors.push("mfa must be a boolean (true or false)");
  str("mdm", { required: false, max: 80 });
  str("password_manager", { required: false, max: 80 });
  enumArray("data_types", DATA_TYPES, { min: 0, max: 3 });
  enumField("app_type", APP_TYPES);

  if (!Array.isArray(o.vendors)) {
    errors.push("vendors must be a list");
  } else {
    if (o.vendors.length > 10) errors.push("vendors must have at most 10 item(s)");
    for (const v of o.vendors) {
      if (typeof v !== "string" || v.trim().length < 1) errors.push(`vendors entries must be non-empty strings (got ${JSON.stringify(v)})`);
      else if (v.trim().length > 80) errors.push(`vendors entries must be at most 80 characters (got ${JSON.stringify(v)})`);
    }
  }

  str("security_owner", { max: 120 });
  str("approver", { max: 120 });
  str("incident_contact", { max: 160 });
  str("backup_tool", { required: false, max: 80 });
  str("backup_cadence", { required: false, max: 80 });
  str("logging_tool", { required: false, max: 80 });
  enumArray("tsc_scope", TSC_SCOPES, { min: 1, max: 3 });
  enumField("review_cadence", REVIEW_CADENCES);

  if (typeof o.effective_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.effective_date)) {
    errors.push("effective_date must be a string in YYYY-MM-DD format");
  }

  return { ok: errors.length === 0, errors };
}
