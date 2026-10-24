# Gateway

The Gateway is the runtime entry point for MCP traffic, and serves the web
console.

## Responsibilities

- Watch `MCPServer` resources (read-only) and route every `Ready` `http`
  server at `/mcp/<namespace>.<name>`.
- Authenticate MCP clients, check each MCP request, apply the tool
  authorization policy, and write audit events. See [Security](../security.md).
- Proxy requests to the server endpoint:
  - removing hop-by-hop headers and caller credentials;
  - adding the server's stored credential or exchanged token;
  - refusing link-local, cloud metadata, and loopback addresses.
- Expose health, readiness, version, metrics, routes, and the console.

## Endpoints

| Path | Purpose |
| --- | --- |
| `/healthz` | Liveness |
| `/readyz` | Ready after the first route sync; `503` while draining on shutdown |
| `/version` | Build version |
| `/metrics` | Prometheus metrics; see [Operations](../operations.md#metrics-and-dashboards) |
| `/v1/routes` | Current routes (without endpoints when client authentication is on) |
| `/mcp/<namespace>.<name>/...` | Proxied MCP traffic |
| `/.well-known/oauth-protected-resource/mcp/<namespace>.<name>` | Protected Resource Metadata of a route (with client authentication) |
| `/ui/` | Web console |
| `/v1/servers`, `/v1/traffic`, `/v1/session` | Console data and login (need the console login) |

Every `/mcp/` response carries `X-Request-Id`, the request's audit event ID.

## Web console

The console at `/ui/` shows:

- an overview of what needs attention;
- every server with its conditions and tools;
- a tools catalog;
- recent traffic with per-tool error rates and latency, for the replica that
  answers;
- a playground that calls tools through the Gateway, with an access token
  when client authentication is on.

It is read-only and never shows tool arguments.

Sign in as `admin` with the password from the Secret
`kavrynt-gateway-console-admin`. To serve the console through an Ingress, add
its URL to `gateway.config.allowedOrigins`: the Gateway rejects browser
requests from other origins.

## Graceful shutdown

On shutdown the Gateway fails `/readyz`, keeps serving for
`gateway.config.shutdownDelay` with every response closing its connection,
then waits up to `gateway.config.shutdownTimeout` for requests in flight. A
rolling restart of several replicas fails no MCP call.
