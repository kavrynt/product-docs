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
| `/metrics` | Prometheus text counters |
| `/v1/routes` | Current routes |
| `/mcp/<namespace>.<name>/...` | Proxied MCP traffic |

## Not yet implemented

Client authentication, tool-level policy, approvals, audit events, and token
exchange for upstream servers. Keep the Gateway on an internal `ClusterIP`
service in this beta.
