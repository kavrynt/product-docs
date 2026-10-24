# Operations

## High availability

The production profile runs:

- three Gateway replicas that drain without failing MCP calls;
- a standby Operator that takes over through leader election;
- disruption budgets and spread across nodes and zones;
- audit events.

Start from it:

```bash
curl -fsSLO https://raw.githubusercontent.com/kavrynt/kavrynt/v1.0.0-beta.1/examples/helm/values-production.yaml
helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt --version 1.0.0-beta.1 \
  -n kavrynt-system --create-namespace --values values-production.yaml \
  --set gateway.auth.resourceURL=https://mcp.example.com \
  --set-json 'gateway.auth.issuers=[{"issuer":"https://login.example.com/realms/agents"}]'
```

The Kavrynt end-to-end test installs this profile. It restarts every Gateway
replica while a client calls tools continuously (no call may fail), and it
deletes the Operator leader to check that the standby takes over.

## Metrics and dashboards

The Gateway records metadata for every MCP request on `/metrics`. Request
bodies, tool arguments, and results are never recorded.

| Metric | Labels |
| --- | --- |
| `kavrynt_gateway_mcp_requests_total` | `route`, `method`, `tool`, `outcome` |
| `kavrynt_gateway_mcp_request_duration_seconds` (histogram) | `route`, `method`, `tool`, `outcome` |
| `kavrynt_gateway_mcp_bytes_total` | `route`, `direction` |
| `kavrynt_operator_mcpserver_ready` | `namespace`, `name` |

`outcome` is one of the following:

- `ok`, `tool_error`, `rpc_error`;
- `client_error`, `upstream_error`, `upstream_unreachable`, `timeout`,
  `incomplete`, `gateway_error`;
- `unauthenticated`, `forbidden`, `auth_unavailable`, `denied`;
- `credential_unavailable`, `exchange_failed`, `protocol_error`.

Prometheus discovers the Gateway through `prometheus.io/*` pod annotations by
default. For the Prometheus Operator, set
`gateway.metrics.serviceMonitor.enabled` and
`operator.metrics.serviceMonitor.enabled`.
`gateway.metrics.dashboard.enabled` adds the "Kavrynt MCP Traffic" Grafana
dashboard for the Grafana sidecar.

The web console (`/ui/`) shows the same traffic for one Gateway replica:

- servers and their tools;
- recent calls, per-tool error rates, and latency;
- a playground that calls tools through the Gateway.

## Alerts

`metrics.prometheusRule.enabled=true` adds a PrometheusRule, which needs the
Prometheus Operator CRDs. Each alert links to a runbook:

| Alert | Fires when |
| --- | --- |
| `KavryntGatewayDown` | No Gateway target is up |
| `KavryntGatewayRouteSyncFailing` | The Gateway cannot sync `MCPServer` routes |
| `KavryntOperatorDown` | No Operator target is up |
| `KavryntMCPServerNotReady` | An `MCPServer` stays not `Ready` (default 10 min) |
| `KavryntMCPUpstreamErrorsHigh` | Upstream errors on a route exceed 5% (default) |
| `KavryntMCPLatencyHigh` | A route's p95 latency exceeds 5 s (default) |
| `KavryntCloudSyncStale` | The Operator's Kavrynt Cloud sync is stale (only with the Cloud connector) |

Thresholds are Helm values under `metrics.prometheusRule`. Runbooks:
[`docs/runbooks`](https://github.com/kavrynt/kavrynt/tree/main/docs/runbooks).

## Upgrades and rollbacks

`kavryctl upgrade` and `kavryctl rollback` run Helm (it must be on `PATH`)
with checks before and after. They act on release `kavrynt` in
`kavrynt-system` unless `--release` and `-n` say otherwise.

```bash
kavryctl upgrade --version <target version> --dry-run   # checks only
kavryctl upgrade --version <target version>
kavryctl rollback                                       # or --revision N
```

!!! warning "kavryctl upgrade 1.0.0-beta.1 keeps the old images"
    `kavryctl upgrade` in `1.0.0-beta.1` runs `helm upgrade --reuse-values`.
    That keeps the previous chart's defaults, including its image tags, so
    the old images keep running. Until the next release, upgrade with Helm with
    `helm upgrade --reset-then-reuse-values` (see
    [Upgrade](installation.md#upgrade)). `kavryctl rollback` is not affected.


**Before anything changes,** `upgrade` checks that:

- the release exists;
- the target version exists;
- the release owns the `MCPServer` CRD. `--adopt-crd` adopts a CRD installed
  by `0.0.5-beta.1` or earlier.

**Then it:**

1. records the routed servers;
2. upgrades with your release's values (`--values FILE` adds more);
3. waits for the rollout;
4. prints one line per server, and exits `1` if a server that was routed
   before is not routed now.

`rollback` does the same around `helm rollback`.

The CRD is upgraded with the chart and kept on uninstall and rollback; schema
changes within `v1alpha1` are additive.

## Backup

`MCPServer` resources are ordinary Kubernetes resources; back them up with
your cluster backups or GitOps. Status is recomputed by the Operator and does
not need restoring:

```bash
kubectl get mcpservers -A -o yaml > mcpservers-backup.yaml
```
