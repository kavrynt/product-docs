# Gateway

The Gateway is the runtime entry point for MCP traffic.

## Responsibilities

- Watch `MCPServer` resources (read-only) and route every `Ready` `http` server
  at `/mcp/<namespace>.<name>`.
- Proxy requests to the server endpoint, removing hop-by-hop headers and caller
  credentials (`Authorization`, `Cookie`, `Proxy-Authorization`).
- Expose health, readiness, version, metrics, and route listing.

## Endpoints

| Path | Purpose |
| --- | --- |
| `/healthz` | Liveness |
| `/readyz` | Ready after the first route sync |
| `/version` | Build version |
| `/metrics` | Prometheus metrics: MCP traffic, Gateway counters, Go runtime, and process |
| `/v1/routes` | Current routes |
| `/mcp/<namespace>.<name>/...` | Proxied MCP traffic |

## MCP traffic metrics

The Gateway records metadata for every proxied request. Request bodies, tool
arguments, and results are never recorded.

| Metric | Labels |
| --- | --- |
| `kavrynt_gateway_mcp_requests_total` | `route`, `method`, `tool`, `outcome` |
| `kavrynt_gateway_mcp_request_duration_seconds` (histogram) | `route`, `method`, `tool`, `outcome` |
| `kavrynt_gateway_mcp_bytes_total` | `route`, `direction` (`in`, `out`) |

- `method` is the JSON-RPC method, such as `tools/list` or `tools/call`. It
  comes from the `Mcp-Method` header or the request body. Non-POST requests
  use `http_<verb>`, for example `http_get` for streams.
- `tool` is the tool name for `tools/call`, otherwise `none`.
- `outcome` is one of `ok`, `tool_error`, `rpc_error`, `client_error` (4xx),
  `upstream_error` (5xx), `upstream_unreachable`, `timeout`, `incomplete`, or
  `gateway_error`.
- To bound metric cardinality, names longer than 128 characters or with
  unusual characters become `invalid`. After 200 distinct tools or 50 methods
  per route, new names become `other`.

Prometheus discovers the Gateway through `prometheus.io/*` pod annotations by
default. The chart can also create a `ServiceMonitor` and a Grafana dashboard;
see [Configuration](../installation.md#configuration).

## Not yet implemented

Client authentication, tool-level policy, approvals, audit events, and token
exchange for upstream servers. Keep the Gateway on an internal `ClusterIP`
service in this beta.
