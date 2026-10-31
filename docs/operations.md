# Operations

## High availability

The production profile runs:

- three Gateway replicas that drain without failing MCP calls;
- a standby Operator that takes over through leader election;
- disruption budgets and spread across nodes and zones;
- audit events.

Start from it:

```bash
curl -fsSLO https://raw.githubusercontent.com/kavrynt/kavrynt/v1.0.0-beta.5/examples/helm/values-production.yaml
helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt --version 1.0.0-beta.5 \
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
| `kavrynt_operator_mcpserver_tools_discovered` | `namespace`, `name` |

The Gateway and the Operator also report their own health:

| Metric | Labels |
| --- | --- |
| `kavrynt_gateway_requests_total`, `kavrynt_gateway_proxied_requests_total` | none |
| `kavrynt_gateway_stripped_credential_requests_total` | none; proxied requests whose caller credentials were removed |
| `kavrynt_gateway_routes` | none; routes served now |
| `kavrynt_gateway_route_sync_success_total`, `kavrynt_gateway_route_sync_failure_total` | none |
| `kavrynt_gateway_policy_decisions_total` | `result` (`allow`, `deny`, `error`); with a policy |
| `kavrynt_gateway_policy_load_failures_total` | none; with a policy |
| `kavrynt_gateway_policy_info` | `revision` of the active policy; with a policy |
| `kavrynt_gateway_policy_filtered_tools_total` | `route`; with `gateway.policy.filterToolsList` |
| `kavrynt_gateway_audit_events_total`, `kavrynt_gateway_audit_queue_length` | none; with audit on |
| `kavrynt_gateway_audit_overflow_total` | `action` (`reject`, `drop`); with audit on |
| `kavrynt_gateway_audit_delivery_total` | `result`; with audit delivery to Kavrynt Cloud |
| `kavrynt_gateway_audit_delivery_buffer_length`, `kavrynt_gateway_audit_delivery_dropped_total`, `kavrynt_gateway_audit_delivery_last_success_timestamp_seconds` | none; with audit delivery |
| `kavrynt_operator_cloud_sync_success_total`, `kavrynt_operator_cloud_sync_last_success_timestamp_seconds` | none; with the Cloud connector |
| `kavrynt_operator_cloud_sync_failure_total` | `reason`; with the Cloud connector |

In the MCP request metrics, `outcome` is one of the following:

- `ok`, `tool_error`, `rpc_error`;
- `client_error`, `upstream_error`, `upstream_unreachable`, `timeout`,
  `incomplete`, `gateway_error`;
- `unauthenticated`, `forbidden`, `auth_unavailable`, `denied`;
- `credential_unavailable`, `exchange_failed`, `protocol_error`,
  `session_not_found`.

Prometheus discovers the Gateway through `prometheus.io/*` pod annotations by
default. For the Prometheus Operator, set
`gateway.metrics.serviceMonitor.enabled` and
`operator.metrics.serviceMonitor.enabled`.
`gateway.metrics.dashboard.enabled` adds the "Kavrynt MCP Traffic" and
"Kavrynt MCP Server" Grafana dashboards for the Grafana sidecar;
`gateway.metrics.dashboard.extra` adds your own dashboards with the chart.

The web console (`/ui/`) shows the same traffic for one Gateway replica:

- servers and their tools, and why a server's tool discovery failed;
- recent calls, per-tool error rates, and latency;
- dashboards of the last 24 hours per route and tool, kept in the
  replica's memory (`gateway.console.history.maxTools`; set
  `gateway.console.grafanaURL` to link Grafana for cluster-wide history);
- an Alerts page with the MCP server conditions of the alerts below, without
  Prometheus;
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
| `KavryntMCPToolErrorsHigh` | Over 20% (default) of a tool's calls end in a tool or JSON-RPC error |
| `KavryntMCPToolDiscoveryFailing` | The Operator cannot list a `Ready` server's tools (default 15 min) |
| `KavryntCloudSyncStale` | The Operator's Kavrynt Cloud sync is stale (only with the Cloud connector) |
| `KavryntAuditDeliveryStale` | Audit events wait for Kavrynt Cloud (only with `gateway.audit.cloud.enabled`) |

Thresholds are Helm values under `metrics.prometheusRule`. Runbooks:
[`docs/runbooks`](https://github.com/kavrynt/kavrynt/tree/main/docs/runbooks).

**Notifications.** `metrics.notifications.enabled=true` adds an
`AlertmanagerConfig` that sends these alerts to Slack, email, Microsoft
Teams, or a webhook. Webhook URLs and passwords come from Secrets you name
(for example `metrics.notifications.slack.webhookSecret.name`), never from
values. Set `metrics.notifications.labels` to match your Alertmanager's
`alertmanagerConfigSelector`.

## Upgrades and rollbacks

`kavryctl upgrade` and `kavryctl rollback` run Helm (it must be on `PATH`)
with checks before and after. They act on release `kavrynt` in
`kavrynt-system` unless `--release` and `-n` say otherwise.

```bash
kavryctl upgrade --version <target version> --dry-run   # checks only
kavryctl upgrade --version <target version>
kavryctl rollback                                       # or --revision N
```



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
not need restoring.

To move registrations to a new or rebuilt cluster, export them as
manifests and import them there:

```bash
kavryctl export -A -o mcpservers.yaml
# new cluster: install the chart, create the namespaces, and fill the
# upstream credentials Secret with the keys the file names
kavryctl import --dry-run mcpservers.yaml
kavryctl import mcpservers.yaml
```

Export leaves out status and Secrets, and redacts `spec.environment` values
and `spec.args` unless you ask for them. Import checks every document before
it writes any. See [export and import](reference/kavryctl.md#export-and-import).
