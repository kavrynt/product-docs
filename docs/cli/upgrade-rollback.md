# kavryctl upgrade and rollback

`kavryctl upgrade` and `kavryctl rollback` run Helm with checks before and
after. They need the `helm` binary on `PATH` (Helm 3.14 or newer) and act on
release `kavrynt` in `kavrynt-system` unless `--release` and `-n` say
otherwise.

## upgrade

```bash
kavryctl upgrade --version <target version> --dry-run   # checks only
kavryctl upgrade --version <target version>
```

Checks the release, the version, and the CRD first, runs
`helm upgrade --reset-then-reuse-values`, and reports every server that is no
longer routed afterwards.

Upgrading from `0.0.5-beta.1` or earlier, whose CRD was installed outside
Helm's control, adopt the CRD once:

```bash
kavryctl upgrade --version 1.0.0-beta.5 --adopt-crd
```

## rollback

```bash
kavryctl rollback                  # the previous revision
kavryctl rollback --revision N
```

## Flags

| Flag | Purpose |
| --- | --- |
| `--release` | Release name (default `kavrynt`) |
| `--version` | Chart version to upgrade to |
| `--chart` | Chart reference or directory (default `oci://ghcr.io/kavrynt/charts/kavrynt`) |
| `--values FILE` | Values applied on top of the release's values |
| `--adopt-crd` | Adopt an `MCPServer` CRD installed by `0.0.5-beta.1` or earlier |
| `--timeout` | How long to wait for the rollout and the servers (default `5m`) |
| `--dry-run` | Run the checks and print the Helm command only |
| `--revision N` | `rollback` only: the revision to return to |

See [Upgrades and rollbacks](../operations.md#upgrades-and-rollbacks) and
[Install on Kubernetes](../installation.md).
