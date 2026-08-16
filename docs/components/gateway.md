# Gateway

Gateway is the runtime entry point for MCP traffic.

It reads route information from Registry and proxies traffic to registered MCP
servers.

## Responsibilities

- Load route data from Registry.
- Expose stable HTTP routes.
- Proxy requests to upstream MCP servers.
- Provide a single point where future policy and audit controls can be added.

## Runtime

Gateway runs in Kubernetes as:

```text
deployment/kavrynt-gateway
service/kavrynt-gateway
```

## Test Access

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-gateway 18080:8080
curl -fsS http://127.0.0.1:18080/v1/routes
```

## Route Shape

The MVP route pattern is:

```text
/mcp/<server-name>
```

Future versions may add richer routing, authentication, and policy controls.

