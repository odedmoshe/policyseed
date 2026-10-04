# Using Policyseed from an AI assistant (MCP)

`policyseed mcp` starts a [Model Context Protocol](https://modelcontextprotocol.io) server on
stdio. Any MCP client (Claude Desktop, Claude Code, Cursor, and others) can then list the 22
SOC 2 policies, interview you for the intake, and render the policies in the conversation.

Things that stay the same as the CLI:

- **The text comes from the templates.** The assistant collects your answers and calls the
  tools, but the policy text comes from the same templates and renderer that `policyseed build`
  uses. You get the same bytes for the same intake.
- **Offline.** The server makes no network calls. It reads the bundled templates, and the
  rendered-policies directory only if you ask it to check review dates.
- **No extra dependencies.** The MCP protocol is implemented by hand in
  [`lib/mcp.js`](../lib/mcp.js), so the package still has zero runtime dependencies.

Requires Node.js 18 or later. The snippets below run the server straight from GitHub with
`npx`. If you installed `policyseed` into a project, use `npx policyseed mcp` instead.

## Setup

### Claude Desktop

Open the config file from Settings > Developer > Edit Config, or edit it directly:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "policyseed": {
      "command": "npx",
      "args": ["-y", "github:odedmoshe/policyseed", "mcp"]
    }
  }
}
```

Restart Claude Desktop. The policyseed tools then appear in the tools menu.

### Claude Code

```sh
claude mcp add policyseed -- npx -y github:odedmoshe/policyseed mcp
```

Add `--scope project` to write it to the repository's `.mcp.json`, which shares it with your
team. Run `/mcp` inside Claude Code to confirm the server is connected.

### Cursor

Create `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` to use it in every project):

```json
{
  "mcpServers": {
    "policyseed": {
      "command": "npx",
      "args": ["-y", "github:odedmoshe/policyseed", "mcp"]
    }
  }
}
```

### Other clients

Any client that can launch a stdio server works. The command is `npx`, and the arguments are
`-y github:odedmoshe/policyseed mcp`.

## Tools

| Tool | Arguments | What it returns |
| --- | --- | --- |
| `list_policies` | none | The 22 policies: id, slug, title, summary, owner role, output file name and SOC 2 criteria. All policies share the review cadence set by the intake's `review_cadence`. |
| `intake_questions` | none | Every intake field with its type, whether it is required, allowed values, limits, default and description, plus a JSON Schema and an example intake. |
| `render_policy` | `slug`, `intake` | One policy as Markdown, the same as `policyseed build` writes it. `slug` also accepts the id (`P03`). |
| `render_all` | `intake`, optional `slugs` | An index, then one content item per policy. Each item starts with `<!-- file: NN-slug.md -->`. All 22 come to about 250 KB. |
| `check_reviews` | optional `directory`, `policies_dir`, `intake_path`, `intake` | The same report as `policyseed check`: which rendered policies are overdue for review, which are up to date, and which have no review date. |

The `intake` object has the same fields as `intake.yaml`. Only `company`, `product`,
`security_owner`, `approver` and `incident_contact` are required. Any field you leave out gets
the default that `policyseed init` writes, and `effective_date` defaults to today.

Invalid input does not cause a protocol error. The tool returns `isError: true` with a message
that says what to fix, for example `headcount must be one of: 1-10, 11-50, 51-200, 201+`, so the
assistant can correct it and try again.

`check_reviews` reads files on the machine that runs the server. Desktop clients often start
servers with a working directory that is not your project, so pass `directory` as an absolute
path. Otherwise the server looks for `./intake.yaml` and `./policies/` in its own working
directory.

## Resources

Each raw template, with its front matter and `{{tags}}`, is available as a resource at
`policyseed://templates/<slug>` (`text/markdown`). For example,
`policyseed://templates/access-control-policy`. Use these to see which intake fields change
which sentences.

## Example conversation

> **You:** We're starting SOC 2. Can you draft our access control and incident response policies
> with Policyseed?
>
> **Assistant:** *(calls `intake_questions`)* I need a few details first:
> 1. Company name and product name?
> 2. Who owns security, and who approves policies? (Name, Title)
> 3. Where should people report security incidents?
>
> The defaults are 11-50 people, remote, AWS, GitHub with GitHub Actions, Google Workspace SSO
> with MFA, 1Password, PII only, a web SaaS product, the Security criterion only, and an annual
> review. What should I change?
>
> **You:** Acme, Inc., product is Acme Cloud. Jane Doe, CTO owns security and John Smith, CEO
> approves. Incidents go to security@acme.example. We're on GCP and Okta, about 30 people, and we
> also handle payment data.
>
> **Assistant:** *(calls `render_policy` with `slug: "access-control-policy"` and then
> `"incident-response-policy"`, using intake `{ company: "Acme, Inc.", product: "Acme Cloud",
> security_owner: "Jane Doe, CTO", approver: "John Smith, CEO", incident_contact:
> "security@acme.example", cloud: ["GCP"], idp: "Okta", data_types: ["PII", "Payment"] }`)*
> Here are both policies. The access control policy names Okta as the identity system of record
> and GCP for production roles, and the incident response policy adds the steps for payment data.
> Should I save them as `policies/03-access-control-policy.md` and
> `policies/13-incident-response-policy.md`, or render the other 20 too?
>
> **You:** Which of our policies are due for review?
>
> **Assistant:** *(calls `check_reviews` with `directory: "/Users/jane/acme-compliance"`)* None
> are overdue. All 22 policies were last reviewed on 2026-01-01, and with an annual cadence the
> first ones come due on 2027-01-01.

## Protocol details

- The transport is stdio with newline-delimited JSON-RPC 2.0. stdout carries only protocol
  messages, and logs go to stderr.
- Supported methods: `initialize`, `notifications/initialized`, `ping`, `tools/list`,
  `tools/call`, `resources/list`, `resources/templates/list` and `resources/read`. Any other
  method gets JSON-RPC error `-32601`.
- Protocol versions: if the client asks for `2024-11-05`, `2025-03-26`, `2025-06-18` or
  `2025-11-25`, the server uses that version. For any other version it answers with
  `2025-06-18`.
- To test it by hand:

  ```sh
  printf '%s\n' \
    '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"sh","version":"0"}}}' \
    '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
    | npx -y github:odedmoshe/policyseed mcp
  ```
