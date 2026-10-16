# kavryctl CLI Reference

`kavryctl` manages `MCPServer` resources through your kubeconfig. Everything it
does can also be done with `kubectl`.

All guides on this site also work with `kubectl` alone.

## Install

Each release publishes `kavryctl` for Linux, macOS, and Windows (amd64 and
arm64) on the
[GitHub release page](https://github.com/kavrynt/kavrynt/releases/tag/v0.0.3-beta.1),
with a `SHA256SUMS` file signed with Cosign.

On Linux or macOS, the install script downloads the binary for your platform,
verifies its checksum, and installs it to `~/.kavrynt/bin`:

```bash
curl -fsSL https://raw.githubusercontent.com/kavrynt/kavrynt/v0.0.3-beta.1/scripts/install.sh \
  | KAVRYNT_VERSION=v0.0.3-beta.1 sh
export PATH="$HOME/.kavrynt/bin:$PATH"
kavryctl version
```

To verify by hand instead, download the archive and checksums, then check both:

```bash
VERSION=0.0.3-beta.1
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
| `-n`, `--namespace NS` | Namespace (default: manifest namespace, then the context namespace) |

## Commands

```bash
kavryctl version
kavryctl validate server.yaml               # offline, YAML or JSON
kavryctl register -n team-a server.yaml     # create or update
kavryctl list -A                            # all namespaces
kavryctl inspect -n team-a payments         # full resource as JSON
kavryctl unregister -n team-a payments
```

Example `list` output:

```text
NAMESPACE  NAME        VERSION  TRANSPORT  READY  ROUTE                 AGE
team-a     payments    1.0.0    http       True   /mcp/team-a.payments  2m
team-a     local-tool  1.0.0    stdio      False  -                     2m
```

`ROUTE` shows `-` until the server is `Ready`: the Gateway routes only `Ready`
servers.

Exit codes: `0` success, `1` operation failed, `2` usage error.
