# Upgrade to 0.0.2-beta.1

`0.0.2-beta.1` removes the separate Registry service. `MCPServer` resources in
the Kubernetes API become the only source of truth. Existing `MCPServer`
resources keep working and keep their Gateway routes.

## What changes

| Area | 0.0.1-beta.1 | 0.0.2-beta.1 |
| --- | --- | --- |
| Deployments | `kavrynt-registry`, `kavrynt-gateway`, `kavrynt-operator` | `kavrynt-gateway`, `kavrynt-operator` |
| Status condition | `Registered` | `Accepted` and `Ready` |
| Gateway routes | polled from Registry every 10 seconds | Kubernetes watch with read-only RBAC |
| Caller credentials | forwarded to MCP servers | never forwarded |
| `spec.endpoint` | not validated at admission | absolute `http`/`https` URL without credentials |
| `kavryctl` | `--registry`, `--home`, `init` | kubeconfig-based: `--context`, `-n`, `-A` |
| Chart values | `registry.*`, `*.config.registryURL`, `gateway.config.syncInterval`, `operator.config.syncRetryPeriod` | removed |

## Before you start

List endpoints. The new CRD rejects endpoints with embedded credentials or
non-HTTP schemes the next time a resource is written:

```bash
kubectl get mcpservers -A \
  -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name}{"\t"}{.spec.endpoint}{"\n"}{end}'
```

Remove `registry.*`, `registryURL`, `syncInterval`, and `syncRetryPeriod` from
any custom values file.

## Steps

1. Apply the new CRD (Helm never upgrades CRDs):

    ```bash
    export KAVRYNT_VERSION=0.0.2-beta.1
    helm pull oci://registry-1.docker.io/kavrynt/kavrynt --version "$KAVRYNT_VERSION" --untar --untardir /tmp/kavrynt-chart
    kubectl apply --server-side --force-conflicts \
      -f /tmp/kavrynt-chart/kavrynt/charts/k8s-operator/crds/
    ```

2. Upgrade the release:

    ```bash
    helm upgrade kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version "$KAVRYNT_VERSION" \
      --namespace kavrynt-system \
      --wait --timeout 3m
    ```

## Verify

```bash
kubectl get deployments -n kavrynt-system
kubectl wait mcpserver --all -A --for=condition=Ready --timeout=120s
kubectl get mcpservers -A
```

Expected: only `kavrynt-gateway` and `kavrynt-operator`; `READY` is `True` for
`http` servers. The Operator removes the old
`mcpservers.kavrynt.io/registry-sync` finalizer automatically.

## Behaviour change: no token passthrough

The Gateway no longer forwards `Authorization`, `Cookie`, or
`Proxy-Authorization` to MCP servers. If an MCP server relied on receiving the
caller's token, give it its own credentials. Per-server token exchange is
planned.

## Rollback

Rollback with `helm rollback` is not covered by automated tests. Prefer fixing
forward. If you must roll back, the restored Registry starts empty and the old
Operator re-registers every `MCPServer` on its next reconcile.
