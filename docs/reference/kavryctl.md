# kavryctl CLI Reference

`kavryctl` manages `MCPServer` resources through your kubeconfig. It also
verifies audit chains, and upgrades and rolls back the Kavrynt release. You
can register servers with `kubectl` alone instead.

## Install

Each release publishes `kavryctl` for Linux, macOS, and Windows (amd64 and
arm64) on the
[GitHub release page](https://github.com/kavrynt/kavrynt/releases/tag/v1.0.0-beta.1),
with a `SHA256SUMS` file signed with Cosign.

On Linux or macOS, the install script downloads the binary for your platform,
verifies its checksum, and installs it to `~/.kavrynt/bin`:

```bash
curl -fsSL https://raw.githubusercontent.com/kavrynt/kavrynt/v1.0.0-beta.1/scripts/install.sh \
  | KAVRYNT_VERSION=v1.0.0-beta.1 sh
export PATH="$HOME/.kavrynt/bin:$PATH"
kavryctl version
```

To verify by hand instead, download the archive and checksums, then check both:

```bash
VERSION=1.0.0-beta.1
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
kavryctl audit verify gateway.log           # or read standard input
kavryctl upgrade --version 1.0.0-beta.1     # checked helm upgrade
kavryctl rollback [--revision N]            # checked helm rollback
```

Example `list` output:

```text
NAMESPACE  NAME        VERSION  TRANSPORT  READY  ROUTE                 TOOLS  AGE
team-a     payments    1.0.0    http       True   /mcp/team-a.payments  4      2m
team-a     local-tool  1.0.0    stdio      False  -                     -      2m
```

`ROUTE` shows `-` until the server is `Ready`, because the Gateway routes only
`Ready` servers. `TOOLS` shows `-` until the Operator has listed the tools.

### audit verify

Reads Gateway logs (other lines are skipped), checks every instance's
SHA-256 chain, and prints each gap, reordering, or altered event. It exits `1`
when it finds one.

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

!!! warning
    `kavryctl upgrade` in `1.0.0-beta.1` runs `helm upgrade --reuse-values`,
    which keeps the previous chart's image tags. Until the next release,
    upgrade with `helm upgrade --reset-then-reuse-values`.

Exit codes: `0` success, `1` operation failed, `2` usage error.
