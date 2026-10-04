# policyseed

Free, offline SOC 2 policy generator. `policyseed` renders 22 governance policy documents
from a single YAML intake file, using a small template engine and zero runtime dependencies.

- **Free and Apache-2.0.** Use it, fork it, modify it, ship it internally or to customers.
- **Deterministic.** The same `intake.yaml` always produces the same Markdown. No randomness.
- **No LLM.** Templates are plain Markdown with a Mustache-style tag syntax, not model output.
- **No signup, no network calls.** Runs entirely on your machine or CI runner.

It will not, by itself, make you SOC 2 compliant. See [What this is not](#what-this-is-not).

## Quick start

Requires Node.js 18 or later. No install step — run it straight from GitHub:

```sh
npx github:odedmoshe/policyseed init
# edit intake.yaml with your company's details
npx github:odedmoshe/policyseed build
npx github:odedmoshe/policyseed check
```

- `init` writes a commented `intake.yaml` in the current directory with every field, its
  allowed values, and sensible defaults. It refuses to overwrite an existing file unless you
  pass `--force`.
- `build` reads `intake.yaml`, validates it, and writes all 22 policies to `./policies/` as
  `NN-<slug>.md` files with a company-titled heading.
- `check` reads `./policies/` and `intake.yaml` and exits with status 1 if any policy's last
  reviewed date is older than its `review_cadence` allows. This is what the bundled GitHub
  Action runs on a schedule so an overdue policy shows up as a failing check.
- `list` prints the 22 bundled templates.
- `--help` and `--version` do what you'd expect.

If you'd rather install it as a dependency:

```sh
npm install --save-dev policyseed
npx policyseed init
```

## Template syntax reference

Templates are plain Markdown files with YAML front matter and a small set of tags, implemented
in [`lib/render.js`](./lib/render.js):

| Tag | Behavior |
| --- | --- |
| `{{key}}` | Prints the value of `key` from the intake context. Unknown keys render as an empty string. |
| `{{#if key}} … {{/if}}` | Renders the block only when `key` is truthy. |
| `{{#unless key}} … {{/unless}}` | Renders the block only when `key` is falsy. |
| `{{#each list}} … {{/each}}` | Repeats the block once per item in `list`; `{{this}}` is the current item. |

Truthiness matches JavaScript, plus empty arrays count as falsy: `false`, `""`, `0`, `NaN`,
`null`, `undefined` and `[]` are falsy; everything else is truthy.

A block tag that stands alone on its own line (only whitespace before and after it) is removed
together with its line, so conditional paragraphs and loops don't leave stray blank lines
behind. Three or more consecutive blank lines collapse to two.

The context available to every template is built by `toTemplateContext()` in
[`lib/context.js`](./lib/context.js) from your `intake.yaml` — company name, cloud providers,
identity provider, MFA status, data types handled, and so on, plus derived booleans like
`has_mdm`, `has_vendors` and `scope_availability` that templates branch on.

## The 22 policies

| # | Title |
| - | --- |
| 1 | Information Security Policy |
| 2 | Acceptable Use Policy |
| 3 | Access Control Policy |
| 4 | Authentication and Password Policy |
| 5 | Asset Management Policy |
| 6 | Data Classification and Handling Policy |
| 7 | Data Retention and Disposal Policy |
| 8 | Encryption and Key Management Policy |
| 9 | Change Management Policy |
| 10 | Secure Software Development Policy |
| 11 | Vulnerability and Patch Management Policy |
| 12 | Logging and Monitoring Policy |
| 13 | Incident Response Policy |
| 14 | Business Continuity and Disaster Recovery Policy |
| 15 | Backup and Recovery Policy |
| 16 | Vendor and Third-Party Risk Management Policy |
| 17 | Risk Assessment and Management Policy |
| 18 | Human Resources Security Policy |
| 19 | Endpoint and Workstation Security Policy |
| 20 | Network and Infrastructure Security Policy |
| 21 | Physical and Remote Work Security Policy |
| 22 | Privacy and Data Protection Policy |

Each one has nine standard sections: Purpose, Scope, Roles and Responsibilities, Policy
Statements, Procedures, Exceptions, Enforcement, Review Cadence, and Revision History.

## Keeping policies current in CI

Use the GitHub Action in a repo that keeps `intake.yaml` and `policies/` under version control:

```yaml
- uses: actions/checkout@v4
- uses: odedmoshe/policyseed@v1
  with:
    command: check
```

It fails the check when a policy is overdue for review, so a stale policy shows up as a red X
instead of quietly rotting. [`.github/workflows/policy-review.yml`](./.github/workflows/policy-review.yml)
is a complete weekly workflow to copy; inputs and outputs are in
[docs/github-action.md](./docs/github-action.md).

## Use it from an AI assistant (MCP)

`policyseed mcp` starts a [Model Context Protocol](https://modelcontextprotocol.io) server, so
Claude, Cursor and other MCP clients can list the policies, ask you the intake questions and
render any policy in the conversation. Nothing leaves your machine except what you type to the
assistant.

```sh
claude mcp add policyseed -- npx -y github:odedmoshe/policyseed mcp
```

Claude Desktop and Cursor configuration, the tool list and an example conversation are in
[docs/mcp.md](./docs/mcp.md).

## Relationship to the hosted generator and Audit Kit

This package is the same rendering engine that powers the hosted generator at
[policyseed.io](https://policyseed.io), packaged for people who'd rather run it
locally, script it into CI, or read exactly how it works; the hosted site also offers a paid
Audit Kit that uses Claude to tailor the Policy Statements and Procedures sections to your
specific stack and adds export formats — this CLI does not include that tailoring step.

## What this is not

These are governance document templates, not legal advice, and using this tool does not by
itself make you SOC 2 compliant or guarantee you'll pass an audit. SOC 2 compliance depends on
whether you actually operate the controls these policies describe — access reviews happening on
schedule, incidents actually being logged and triaged, backups actually being tested — not just
on having the documents. Have a qualified person (counsel, an auditor, or an experienced
compliance practitioner) review the output before you rely on it externally.

## Contributing

Issues and pull requests are welcome at
[github.com/odedmoshe/policyseed](https://github.com/odedmoshe/policyseed). If you're proposing
a change to a policy's wording, prefer editing the template's prose directly and running the
test suite (`node --test test/`) so the renderer parity and CLI smoke tests still pass. If
you're adding a new intake field, update `lib/context.js` (`DEFAULT_INTAKE`,
`toTemplateContext`, `validateIntake`) together, since the three are meant to stay in lockstep.

## License

Apache License 2.0 — see [LICENSE](./LICENSE). Copyright the policyseed contributors.
