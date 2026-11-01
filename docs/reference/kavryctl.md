# kavryctl CLI Reference

`kavryctl` manages `MCPServer` resources through your kubeconfig. It also
verifies audit chains, and upgrades and rolls back the Kavrynt release. You
can register servers with `kubectl` alone instead.

## Install

Each release publishes `kavryctl` for Linux, macOS, and Windows (amd64 and
arm64) on the
[GitHub release page](https://github.com/kavrynt/kavrynt/releases/tag/v1.0.0-beta.5),
with a `SHA256SUMS` file signed with Cosign.

On Linux or macOS, the install script downloads the binary for your platform,
verifies its checksum, and installs it to `~/.kavrynt/bin`:

```bash
curl -fsSL https://raw.githubusercontent.com/kavrynt/kavrynt/v1.0.0-beta.5/scripts/install.sh \
  | KAVRYNT_VERSION=v1.0.0-beta.5 sh
export PATH="$HOME/.kavrynt/bin:$PATH"
kavryctl version
```

To verify by hand instead, download the archive and checksums, then check both:

```bash
VERSION=1.0.0-beta.5
BASE=https://github.com/kavrynt/kavrynt/releases/download/v${VERSION}
ARCHIVE=kavryctl_${VERSION}_linux_amd64.tar.gz   # or darwin_arm64, linux_arm64, ...
curl -fsSL -O "$BASE/$ARCHIVE" -O "$BASE/SHA256SUMS" -O "$BASE/SHA256SUMS.sigstore.json"

cosign verify-blob --bundle SHA256SUMS.sigstore.json \
  --certificate-identity "https://github.com/kavrynt/kavrynt/.github/workflows/release.yml@refs/tags/v${VERSION}" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  SHA256SUMS
grep " $ARCHIVE\$" SHA256SUMS | sha256sum -c -   # macOS: shasum -a 256 -c
```

## Cluster flags

| Flag | Purpose |
| --- | --- |
| `--kubeconfig PATH` | Kubeconfig file (default: `KUBECONFIG` or `~/.kube/config`) |
| `--context NAME` | Kubeconfig context |
| `-n`, `--namespace NS` | Namespace (default: manifest namespace, then the context namespace; `kavrynt-system` for `upgrade` and `rollback`) |

## Commands

```bash
kavryctl version
kavryctl validate server.yaml               # offline, YAML or JSON
kavryctl register -n team-a server.yaml     # create or update
kavryctl list -A                            # all namespaces
kavryctl inspect -n team-a payments         # full resource as JSON
kavryctl unregister -n team-a payments
kavryctl doctor [--anonymize]               # read-only installation check
kavryctl export -A -o mcpservers.yaml       # registrations as manifests
kavryctl import [--dry-run] mcpservers.yaml # checked restore
kavryctl audit verify gateway.log           # or read standard input
kavryctl upgrade --version 1.0.0-beta.5     # checked helm upgrade
kavryctl rollback [--revision N]            # checked helm rollback
```

Example `list` output:

```text
NAMESPACE  NAME        VERSION  TRANSPORT  READY  ROUTE                 TOOLS        AGE
team-a     payments    1.0.0    http       True   /mcp/team-a.payments  4            2m
team-a     local-tool  1.0.0    stdio      False  -                     NotRoutable  2m
```

`ROUTE` shows `-` until the server is `Ready`, because the Gateway routes only
`Ready` servers. `TOOLS` shows the number of tools once the Operator has
listed them, the reason when it has not (such as `DiscoveryFailed` or
`NotRoutable`), and `-` before the Operator has looked. In an empty
namespace, `list` says which namespaces have servers.

### doctor

Checks the installation read-only: the `MCPServer` CRD, the Gateway and
Operator Deployments and their versions, MCP client authentication, and
every `MCPServer`'s readiness and tool discovery. Each `warn` or `fail` says
what to do and links a runbook; checks your credentials may not run are
`skipped`.

| Flag | Purpose |
| --- | --- |
| `-n` | Namespace of the Kavrynt release (default `kavrynt-system`) |
| `--release` | Release name (default `kavrynt`) |
| `--output json` | A JSON report (`"type":"kavrynt.doctor.v1"`) |
| `--anonymize` | Replace namespaces and names with per-report hashes and leave out error details, for public issues |

The report never includes condition messages, endpoints, or Secret data.
Exit `0` when every check passed, `1` when one failed, `2` when doctor could
not start or reach the cluster. Attach `kavryctl doctor --anonymize` to bug
reports.

### export and import

Move `MCPServer` registrations to a new or rebuilt cluster:

```bash
kavryctl export -A -o mcpservers.yaml      # file mode 0600
# new cluster: install the chart with your values, create the namespaces,
# and fill the upstream credentials Secret with the keys the file names
kavryctl import --dry-run mcpservers.yaml
kavryctl import mcpservers.yaml
```

- `export` writes only names, namespaces, labels, annotations, and `spec`.
  It never reads Secrets; its header names the credential keys to provide.
- `spec.environment` values and `spec.args` are written empty and listed in
  annotations, since either can hold a key. Fill them in and remove the
  annotations before importing, or export with `--include-environment` and
  `--include-args` and store the file like a secret. An endpoint with a
  query string is exported as stored, with a warning.
- `import` checks every document before writing any (validation, duplicates,
  values still redacted, missing namespaces, and a server-side dry run), so
  a refused file changes nothing. It skips existing servers unless
  `--overwrite`, then waits (`--wait`, default `60s`) and reports servers
  that are not `Ready`.

### audit verify

Reads Gateway logs (other lines are skipped), checks every instance's
SHA-256 chain, and prints each gap, reordering, or altered event. It exits `1`
when it finds one. Events from a newer Gateway with fields this version does
not know verify as written; the count of such fields is printed.

### upgrade and rollback

They need the `helm` binary on `PATH`. Flags:

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

See [Operations](../operations.md#upgrades-and-rollbacks).


Exit codes: `0` success, `1` operation failed, `2` usage error.
