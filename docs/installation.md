# Install on Kubernetes

Install Kavrynt `1.0.0-beta.4` on any conformant Kubernetes cluster: AKS, EKS,
GKE, OpenShift, self-managed, or a local cluster. For a guided trial, use the
[Quickstart](quickstart.md) or the [testing runbook](testing.md).

## Prerequisites

- Kubernetes 1.29 or newer (CRD validation uses CEL rules).
- `kubectl` with permission to create CRDs, Namespaces, Deployments, Services,
  ServiceAccounts, ClusterRoles, and ClusterRoleBindings.
- Helm 3.14 or newer.
- Nodes that can pull from `docker.io`. For air-gapped clusters, mirror the
  images and chart listed below and override `*.image.repository`.
- For MCP client authentication: an OAuth 2.1 authorization server (your
  identity provider) that issues JWT access tokens, and the external https
  URL your agents use to reach the Gateway.

```bash
kubectl config current-context
kubectl auth can-i create customresourcedefinitions
helm version --short
```

## Artifacts

| Artifact | Reference |
| --- | --- |
| Helm chart | `oci://registry-1.docker.io/kavrynt/kavrynt` (or `oci://ghcr.io/kavrynt/charts/kavrynt`) version `1.0.0-beta.4` |
| Gateway image | `docker.io/kavrynt/gateway:1.0.0-beta.4` (also `ghcr.io/kavrynt/gateway`) |
| Operator image | `docker.io/kavrynt/operator:1.0.0-beta.4` (also `ghcr.io/kavrynt/operator`) |

Images are multi-architecture (`linux/amd64`, `linux/arm64`), distroless, run
as non-root, and are signed with Sigstore Cosign (keyless). Verify a signature
with [Cosign](https://docs.sigstore.dev/cosign/system_config/installation/)
3.0 or newer (older versions report "no signatures found"):

```bash
cosign verify \
  --certificate-identity "https://github.com/kavrynt/kavrynt/.github/workflows/release.yml@refs/tags/v1.0.0-beta.4" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  docker.io/kavrynt/gateway:1.0.0-beta.4
```

## Install

MCP client authentication is on by default: the install fails until you name
your authorization server or opt out.

=== "With your authorization server"

    ```bash
    export KAVRYNT_VERSION=1.0.0-beta.4

    helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version "$KAVRYNT_VERSION" \
      --namespace kavrynt-system \
      --create-namespace \
      --set gateway.auth.resourceURL=https://mcp.example.com \
      --set-json 'gateway.auth.issuers=[{"issuer":"https://login.example.com/realms/agents"}]' \
      --set 'gateway.auth.requiredScopes={mcp:tools}' \
      --wait --timeout 3m
    ```

    - `resourceURL` is the Gateway's external https origin, with no path.
      Each route's tokens must carry the audience
      `<resourceURL>/mcp/<namespace>.<name>`.
    - `issuers` lists the authorization servers whose tokens are trusted.
      An in-cluster server on plain http needs `"allowHTTP": true`.
    - `requiredScopes` is optional.

    See [Security](security.md#client-authentication).

=== "Trial without authentication"

    ```bash
    helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version "$KAVRYNT_VERSION" \
      --namespace kavrynt-system \
      --create-namespace \
      --set gateway.auth.enabled=false \
      --wait --timeout 3m
    ```

    Every MCP route then accepts unauthenticated calls. The Gateway logs a
    warning at start, and the install notes and the console say so. Keep
    the Gateway Service internal.

For production settings (replicas, disruption budgets, audit), start from the
[production profile](operations.md#high-availability).

## Verify

```bash
kubectl rollout status deployment/kavrynt-operator -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-gateway -n kavrynt-system --timeout=120s
kubectl get crd mcpservers.kavrynt.io
```

Expected workloads: `kavrynt-gateway` and `kavrynt-operator`, both `1/1`.

## Configuration

Pass values with `--set` or `--values`. The chart validates values against a
schema and rejects unknown keys.

| Value | Default | Purpose |
| --- | --- | --- |
| `gateway.auth.enabled` | `true` | MCP client authentication. `false` leaves every MCP route open |
| `gateway.auth.resourceURL`, `gateway.auth.issuers`, `gateway.auth.requiredScopes` | none | Your Gateway URL, trusted authorization servers, and required scopes |
| `gateway.policy.enabled`, `gateway.policy.configMap` | `false`, none | Tool authorization policy from a ConfigMap of `.rego` files |
| `gateway.policy.filterToolsList` | `false` | List only the tools the policy lets each caller call |
| `gateway.audit.enabled` | `false` | One audit event per MCP request on standard output |
| `global.upstreamCredentials.secretName` | none | Secret with credentials for MCP servers that declare `spec.credential` |
| `gateway.auth.tokenExchangeSecret` | none | Secret with the Gateway's client secrets for token exchange |
| `gateway.config.strictProtocol` | `true` | Refuse requests that are not well-formed MCP Streamable HTTP |
| `gateway.console.enabled`, `gateway.console.auth.enabled` | `true`, `true` | The web console at `/ui/` and its admin login |
| `global.watchNamespaces` | `[]` (all) | Limit the namespaces whose `MCPServer` resources are routed |
| `gateway.config.allowedOrigins` | `[]` | Browser origins allowed besides loopback, for example an Ingress serving the console |
| `gateway.config.stripRequestHeaders` | `[]` | Extra request headers never forwarded. `Authorization`, `Cookie`, and `Proxy-Authorization` are always removed |
| `gateway.config.requestTimeout` | `30s` | Upstream request timeout |
| `gateway.replicaCount`, `operator.replicaCount` | `1`, `1` | Replicas; see [High availability](operations.md#high-availability) |
| `networkPolicy.mcpServers.enabled`, `networkPolicy.gateway.enabled` | `false` | Keep MCP traffic on the Gateway; see [Security](security.md#keeping-traffic-on-the-gateway) |
| `gateway.metrics.serviceMonitor.enabled`, `operator.metrics.serviceMonitor.enabled` | `false` | Prometheus Operator `ServiceMonitor`s |
| `gateway.metrics.dashboard.enabled` | `false` | ConfigMap with the "Kavrynt MCP Traffic" Grafana dashboard |
| `metrics.prometheusRule.enabled` | `false` | Alerting rules with runbooks |
| `gateway.image.repository`, `operator.image.repository` | `kavrynt/gateway`, `kavrynt/operator` | Override for a private mirror |

## Security defaults

- Containers run as UID 65532 with a read-only root filesystem, no privilege
  escalation, all capabilities dropped, and the `RuntimeDefault` seccomp
  profile.
- The Gateway can only `get`, `list`, and `watch` `MCPServer` resources. It
  cannot write resources or read Secrets: Secrets it needs are mounted by the
  kubelet.
- The Gateway is a `ClusterIP` service, and it never forwards the caller's
  `Authorization`, `Cookie`, or `Proxy-Authorization` to MCP servers.
- Customer MCP traffic stays inside your cluster.

## Upgrade

The chart upgrades the `MCPServer` CRD with the release and keeps it on
uninstall and rollback.

```bash
helm upgrade kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
  --version <target version> -n kavrynt-system --reset-then-reuse-values --wait --timeout 3m
kubectl get deployments -n kavrynt-system \
  -o custom-columns='NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image'
```

Both images should show the target version. Use `--reset-then-reuse-values`,
not `--reuse-values`: `--reuse-values` keeps the previous chart's defaults,
including its image tags.

Or let `kavryctl upgrade --version <target version>` (`kavryctl`
`1.0.0-beta.2` or later) check the release, the version, and the CRD first,
and report every server that is no longer routed afterwards. See
[Operations](operations.md#upgrades-and-rollbacks).



### Upgrading from 0.0.5-beta.1 or earlier

1. **Choose authentication or the opt-out.** Add `gateway.auth.resourceURL`
   and `gateway.auth.issuers`, or `--set gateway.auth.enabled=false`. Without
   either, the upgrade stops before changing anything.
2. **Let the release adopt the CRD, once.** These releases installed it
   outside Helm's control. Run
   `kavryctl upgrade --version 1.0.0-beta.4 --adopt-crd`, or adopt it by hand
   and then run the `helm upgrade` above:

    ```bash
    kubectl label crd mcpservers.kavrynt.io app.kubernetes.io/managed-by=Helm --overwrite
    kubectl annotate crd mcpservers.kavrynt.io \
      meta.helm.sh/release-name=kavrynt meta.helm.sh/release-namespace=kavrynt-system --overwrite
    ```

3. **Fix clients that send JSON-RPC batches**, or `Mcp-Method` and
   `Mcp-Name` headers that disagree with the body. They now get `400`.

Read the [release notes](release-notes.md) for the target version before you
upgrade.

## Uninstall

```bash
helm uninstall kavrynt -n kavrynt-system
```

Helm keeps the CRD and your `MCPServer` resources, and the console admin
Secret. To remove everything, including all `MCPServer` resources in every
namespace:

```bash
kubectl delete crd mcpservers.kavrynt.io
kubectl delete namespace kavrynt-system
```
