# kavryctl

`kavryctl` manages `MCPServer` resources through your kubeconfig. It also
checks an installation, moves registrations between clusters, verifies audit
chains, and upgrades and rolls back the Kavrynt release. You can register
servers with `kubectl` alone instead.

## Commands

| Command | What it does |
| --- | --- |
| [`kavryctl validate`](servers.md#validate) | Checks an `MCPServer` manifest offline. |
| [`kavryctl register`](servers.md#register) | Creates or updates an `MCPServer`. |
| [`kavryctl list`](servers.md#list) | Lists servers with their route, readiness, and tools. |
| [`kavryctl inspect`](servers.md#inspect) | Prints the full resource as JSON. |
| [`kavryctl unregister`](servers.md#unregister) | Removes an `MCPServer`. |
| [`kavryctl doctor`](doctor.md) | Checks the installation read-only and says what to fix. |
| [`kavryctl export`](export-import.md#export) | Writes registrations as manifests. |
| [`kavryctl import`](export-import.md#import) | Restores registrations, checking every document first. |
| [`kavryctl audit verify`](audit-verify.md) | Verifies the Gateway's audit chains. |
| [`kavryctl upgrade`](upgrade-rollback.md#upgrade) | Runs a checked `helm upgrade` of the release. |
| [`kavryctl rollback`](upgrade-rollback.md#rollback) | Runs a checked `helm rollback` of the release. |
| `kavryctl version` | Prints the `kavryctl` version. |

At a glance:

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

Every command that talks to a cluster takes these flags.

| Flag | Purpose |
| --- | --- |
| `--kubeconfig PATH` | Kubeconfig file (default: `KUBECONFIG` or `~/.kube/config`) |
| `--context NAME` | Kubeconfig context |
| `-n`, `--namespace NS` | Namespace (default: manifest namespace, then the context namespace; `kavrynt-system` for `upgrade` and `rollback`) |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | The operation failed |
| `2` | Usage error |

[`doctor`](doctor.md#exit-codes) and [`audit verify`](audit-verify.md) give
`1` a more specific meaning; see their pages.
