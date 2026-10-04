# Policyseed GitHub Action

Run `policyseed` in GitHub Actions with `uses: odedmoshe/policyseed@v1`. The usual job is
`check`, which fails the workflow when any rendered policy is past its review cadence. An
overdue policy then shows up as a red check, not something you find out about during an audit.

The action is a composite action. It installs Node.js with `actions/setup-node` and runs
`bin/policyseed.js` from the action's own checkout. It doesn't run `npm install` and doesn't
fetch the package over the network. The CLI output goes to the step log and the job summary.

## Quick start

Put `intake.yaml` and the rendered `policies/` directory in your repository (create them with
`npx github:odedmoshe/policyseed init` and `build`). Then add
`.github/workflows/policy-review.yml`:

```yaml
name: Policy review check

on:
  push:
    branches: [main]
    paths:
      - "intake.yaml"
      - "policies/**"
  schedule:
    - cron: "0 9 * * 1" # every Monday 09:00 UTC
  workflow_dispatch: {}

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run policyseed check
        uses: odedmoshe/policyseed@v1
        with:
          command: check
          intake: intake.yaml
          policies-dir: policies
```

The same file is in this repository as
[`.github/workflows/policy-review.yml`](../.github/workflows/policy-review.yml).

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `command` | `check` | `check` exits non-zero when a policy is overdue for review or has no review date. `build` renders every policy from the intake file. No other values are accepted. |
| `intake` | `intake.yaml` | Path to the intake file, relative to `working-directory`. Passed as `--intake`. |
| `policies-dir` | `policies` | Directory of rendered policies, relative to `working-directory`. Passed as `--dir` to `check` and as `--out` to `build`. |
| `node-version` | `22` | Node.js version for `actions/setup-node` (18 or later). Set it to `""` to skip setup-node and use the Node.js already on the runner. |
| `working-directory` | `.` | Directory to run `policyseed` in, such as a subdirectory that holds `intake.yaml`. |

## Outputs

| Output | Description |
| --- | --- |
| `exit-code` | Exit code of the `policyseed` CLI. `0` means success. |

## Behavior

- If the CLI exits non-zero, the step fails and the workflow goes red. `check` exits 1 when a
  policy's last Revision History date (or the intake's `effective_date`) is older than
  `review_cadence` allows (Annual 365d, Semi-annual 182d, Quarterly 91d). It also exits 1 when
  a policy's review date can't be found, or when the intake or policies directory is missing.
- Pass or fail, the job summary shows the full CLI output. It lists overdue policies with the
  date each was last reviewed.
- Inputs reach the shell script only through environment variables. They are never
  interpolated into the script.

To keep the job going after a failed check and decide what to do yourself, use
`continue-on-error` and read the outcome:

```yaml
      - name: Run policyseed check
        id: policyseed
        continue-on-error: true
        uses: odedmoshe/policyseed@v1

      - if: steps.policyseed.outcome == 'failure'
        run: echo "Policies are overdue for review (exit ${{ steps.policyseed.outputs.exit-code }})"
```

## Versioning and pinning

- `@v1` is a moving major-version tag. It gets compatible fixes and never breaking changes.
- `@v1.2.3` (an exact release tag) or a full commit SHA pins the action completely, for
  reproducible runs and supply-chain hardening:
  `uses: odedmoshe/policyseed@<40-character-sha> # v1.2.3`.

## Publishing (maintainers)

`uses: odedmoshe/policyseed@v1` resolves only after the tag exists. To ship a release:

1. Make sure `action.yml` at the repo root is on `master` and that the **Action self-test**
   workflow (`.github/workflows/action-test.yml`) passes.
2. Create a GitHub release with a semver tag such as `v1.0.0`. In the release form, tick
   **Publish this Action to the GitHub Marketplace**, accept the Marketplace terms if asked,
   and pick a primary category (for example "Security" or "Continuous integration"). The
   Marketplace listing uses `name`, `description` and `branding` from `action.yml`, and the
   name has to be unique across the Marketplace.
3. Point the major tag at the release:

   ```sh
   git tag -fa v1 -m "v1" v1.0.0^{}
   git push origin v1 --force
   ```

   After each later `v1.x.y` release, move `v1` the same way. Start a `v2` tag only for
   breaking changes, such as renamed inputs or a different default command.
