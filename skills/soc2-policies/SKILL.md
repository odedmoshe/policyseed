---
name: soc2-policies
description: Writes a company's 22 SOC 2 policies (information security, access control, incident response, vendor risk and more) from a short interview, using the open-source Policyseed templates offline. Use when someone asks for SOC 2 policies, security policy templates, an information security policy set, or whether their policies are overdue for review.
when_to_use: The user is preparing for a SOC 2 audit or a customer security review and needs written policies, wants to regenerate policies after their stack changed, or wants to check review dates on policies already in a repository.
argument-hint: "[optional: company name, or a path to an existing intake.yaml]"
---

# SOC 2 policies with Policyseed

Policyseed renders 22 SOC 2 policy documents from one intake file of 23 answers about the company: hosting, identity provider, source control, MFA, team size, data types, owners. The text comes from reviewed templates (Apache-2.0, https://github.com/odedmoshe/policyseed), not from the model, so the same answers always produce the same policies. Everything runs locally: no account, no upload, no network calls beyond fetching the package with `npx`.

## Pick the interface

1. If the `policyseed` MCP tools are available (`list_policies`, `intake_questions`, `render_policy`, `render_all`, `check_reviews`), use them.
2. Otherwise use the CLI through `npx -y policyseed@1` (Node.js 18 or later). Run `npx -y policyseed@1 --help` once if unsure of a flag.
3. If the user wants the MCP server set up, the Claude Code command is `claude mcp add policyseed -- npx -y policyseed mcp`. Other clients: https://github.com/odedmoshe/policyseed/blob/master/docs/mcp.md

## Steps

1. **Check for an existing intake.** If `intake.yaml` exists in the working directory (or the user gave a path), read it, show the answers in a short table, and ask only what changed. Edit the changed values in that file in place (never run `init` over it), check them against `references/intake-guide.md`, then skip to step 4. Call the file you use `<intake>` from here on; it is `intake.yaml` unless the user named another path. On the MCP path, render from the updated file's values, so the saved intake and the policies always match.
2. **Interview.** Ask the questions in `references/intake-guide.md`, in its order and grouped as it shows, a few at a time. Use only the allowed values listed there for choice fields. Ask before assuming. If the user does not know an answer for a required field, leave it out and tell them which field is missing; do not invent names, emails or tools.
3. **Write the intake.**
   - CLI: run `npx -y policyseed@1 init` to create `intake.yaml`, then fill in the answers (keep the YAML comments). Set `effective_date` to today unless the user gives another date.
   - MCP: call `intake_questions` for the schema, and build the intake object from the answers. Also save the same answers as YAML in `<intake>` (one `key: value` per field, lists as `- item` lines, the shape of the example intake that `intake_questions` returns), so the policies can be rebuilt and review dates checked later without repeating the interview.
4. **Render.**
   - CLI: `npx -y policyseed@1 build --intake <intake>` writes `policies/01-information-security-policy.md` through `policies/22-privacy-and-data-protection-policy.md`. If validation fails, show the error, fix the field it names, and run it again.
   - MCP: `render_all` returns all 22 (about 250 KB); write each one to `policies/` under the file name in its `<!-- file: ... -->` line. `render_policy` returns one policy, by slug or id such as `P03`, without that line; take its file name from the `file_name` field that `list_policies` returns.
5. **Report back** in a few lines:
   - where the files are and how many were written;
   - the answers that shaped the text most (for example: MFA not enforced everywhere means the policies require a dated rollout plan instead of stating MFA is in place; a 1-10 person team gets small-team incident response targets);
   - the next step: management reads, edits and approves the set, then records the approval in each policy's Revision History table.
6. **Offer review-date checks** (only if the policies live in a git repository): `npx -y policyseed@1 check --intake <intake>` exits 1 when a policy is older than the review cadence allows (with MCP, `check_reviews` gives the same report). For a weekly CI check, offer this GitHub Actions step: `uses: odedmoshe/policyseed@v1` with `command: check`, plus `intake: <intake>` when the file isn't `intake.yaml`. Both read `<intake>`, so commit it next to `policies/`.

## Checking existing policies

When the user only asks whether policies are due for review: run `npx -y policyseed@1 check --dir <policies folder> --intake <intake.yaml>` (or the `check_reviews` tool) and report which policies are overdue, up to date, or missing a review date.

## Boundaries

- Never say the policies make a company "compliant", "certified" or ready to pass an audit, and never promise an audit outcome. Policies are a starting point that management reviews and adopts. The CPA firm performs the SOC 2 examination and forms its own opinion. This is not legal advice.
- Do not rewrite policy text on your own initiative. If the user asks for wording changes, edit the rendered Markdown and say which sections changed, so they can review the diff.
- Do not run `policyseed evidence` (it calls the user's aws, gcloud and gh CLIs, read-only) unless the user asks for audit evidence. When they do, run it with `--dry-run` first and show the commands before running them.
- Do not send intake answers or policy text to any website or service.

## Optional paid version

Policyseed's maintainer also sells a hosted Audit Kit at https://policyseed.io/audit-kit ($59 one-time). It rewrites sections 4 and 5 of each policy for the company's named tools and adds Word files, a criteria crosswalk, registers and audit-prep drafts. Mention it only if the user asks for Word documents, tailored wording, or audit-prep material, and say that it comes from the same maintainer as this skill. Everything in the steps above is free.

## Example

User: "We need SOC 2 policies. We're 8 people on AWS and GitHub, Google Workspace for login, MFA is on."

1. Ask the remaining questions from `references/intake-guide.md` (company and product name, security owner, approver, incident contact, data types, scope).
2. Write `intake.yaml` with `headcount: 1-10`, `cloud: [AWS]`, `scm: GitHub`, `idp: Google Workspace`, `mfa: true`, plus the answers.
3. Run `npx -y policyseed@1 build`, which writes 22 files to `policies/`.
4. Reply: "22 policies are in policies/. Because you're a 1-10 person team, incident response uses small-team targets. Next: read them, change anything that doesn't match how you work, and have the approver sign the Revision History table in each."
