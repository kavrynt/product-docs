# Install on Kubernetes

Install Kavrynt `0.0.2-beta.1` on any conformant Kubernetes cluster: AKS, EKS,
GKE, OpenShift, self-managed, or Kind. For a guided local trial, use the
[Quickstart](quickstart.md).

## Prerequisites

- Kubernetes 1.29 or newer (CRD validation uses CEL rules).
- `kubectl` with permission to create CRDs, Namespaces, Deployments, Services,
  ServiceAccounts, ClusterRoles, and ClusterRoleBindings.
- Helm 3.8 or newer.
- Nodes that can pull from `docker.io`. For air-gapped clusters, mirror the
  images and chart listed below and override `*.image.repository`.

```bash
kubectl config current-context
kubectl auth can-i create customresourcedefinitions
helm version --short
```

## Artifacts

| Artifact | Reference |
| --- | --- |
| Helm chart | `oci://registry-1.docker.io/kavrynt/kavrynt` version `0.0.2-beta.1` |
| Gateway image | `docker.io/kavrynt/gateway:0.0.2-beta.1` |
| Operator image | `docker.io/kavrynt/operator:0.0.2-beta.1` |

Images are multi-architecture (`linux/amd64`, `linux/arm64`), run as non-root,
and are signed with Sigstore Cosign (keyless). Verify a signature:

```bash
cosign verify \
  --certificate-identity "https://github.com/kavrynt/kavrynt/.github/workflows/release.yml@refs/tags/v0.0.2-beta.1" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  docker.io/kavrynt/gateway:0.0.2-beta.1
```

## Install

```bash
export KAVRYNT_VERSION=0.0.2-beta.1

helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
  --version "$KAVRYNT_VERSION" \
  --namespace kavrynt-system \
  --create-namespace \
  --wait --timeout 3m
```

## Verify

```bash
kubectl rollout status deployment/kavrynt-operator -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-gateway -n kavrynt-system --timeout=120s
kubectl get crd mcpservers.kavrynt.io
```

Expected workloads: `kavrynt-gateway` and `kavrynt-operator`, both `1/1`.

## Configuration

Pass values with `--set` or `--values`:

| Value | Default | Purpose |
| --- | --- | --- |
| `gateway.config.watchNamespaces` | `[]` (all) | Limit the namespaces whose `MCPServer` resources the Gateway routes. A list switches its RBAC to per-namespace Roles. |
| `gateway.config.stripRequestHeaders` | `[]` | Extra request headers never forwarded to MCP servers. `Authorization`, `Cookie`, and `Proxy-Authorization` are always removed. |
| `gateway.config.requestTimeout` | `30s` | Upstream request timeout |
| `gateway.replicaCount` | `1` | Gateway replicas |
| `operator.config.leaderElect` | `true` | Operator leader election |
| `gateway.image.repository`, `operator.image.repository` | `kavrynt/gateway`, `kavrynt/operator` | Override for a private mirror |

Example: route only two team namespaces.

```bash
helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
  --version "$KAVRYNT_VERSION" -n kavrynt-system --reuse-values \
  --set 'gateway.config.watchNamespaces={team-a,team-b}'
```

## Security defaults

- Containers run as UID 65532 with a read-only root filesystem, no privilege
  escalation, all capabilities dropped, and the `RuntimeDefault` seccomp
  profile.
- The Gateway can only `get`, `list`, and `watch` `MCPServer` resources. It
  cannot write resources or read Secrets.
- The Gateway is a `ClusterIP` service. Do not expose it to untrusted networks
  in this beta: it does not authenticate clients yet.
- Customer MCP traffic stays inside your cluster.

## Upgrade

From `0.0.1-beta.1`, follow [Upgrade to 0.0.2-beta.1](upgrade.md). Helm does
not upgrade CRDs, so always apply the CRD from the target version first.

## Uninstall

```bash
helm uninstall kavrynt -n kavrynt-system
```

Helm keeps the CRD and your `MCPServer` resources. To remove everything,
including all `MCPServer` resources in every namespace:

```bash
kubectl delete crd mcpservers.kavrynt.io
kubectl delete namespace kavrynt-system
```
