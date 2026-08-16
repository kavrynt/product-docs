# Registry

Registry is the Kavrynt control-plane API.

It stores MCP server records and gives other components a consistent way to
discover what can be routed.

## Responsibilities

- Store MCP server metadata.
- Expose server records over HTTP APIs.
- Support create, read, list, and delete workflows.
- Provide route data to Gateway.
- Receive desired-state updates from Operator.

## Runtime

Registry runs in Kubernetes as:

```text
deployment/kavrynt-registry
service/kavrynt-registry
```

## Test Access

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-registry 18081:8080
curl -fsS http://127.0.0.1:18081/v1/servers
```

## Future Work

- Durable storage
- Authentication
- Tenant boundaries
- API versioning
- Audit events
- Hosted registry for Kavrynt Cloud

