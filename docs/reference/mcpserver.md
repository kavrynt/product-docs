# MCPServer Resource

`MCPServer` (`kavrynt.io/v1alpha1`, namespaced, short name `mcps`) declares one
MCP server for the Gateway to route.

```yaml
apiVersion: kavrynt.io/v1alpha1
kind: MCPServer
metadata:
  name: payments
  namespace: team-a
  annotations:
    kavrynt.io/description: Payment search tools
spec:
  version: 1.0.0
  transport: http
  endpoint: http://payments.team-a.svc.cluster.local:8080/mcp
```

## Spec

| Field | Required | Rules |
| --- | --- | --- |
| `version` | yes | Non-empty string |
| `transport` | yes | `http` or `stdio` |
| `endpoint` | when `transport: http` | Absolute `http`/`https` URL, no user credentials, at most 2048 characters |
| `command` | when `transport: stdio` | Command to run (recorded; not run by Kavrynt) |
| `args` | no | Arguments for `command` |
| `environment` | no | Plain-text key/value pairs. Do not put secrets here. |

`metadata.name` must be a lowercase DNS subdomain.

## Status

| Condition | `True` when | `False` reasons |
| --- | --- | --- |
| `Accepted` | The spec is valid | `InvalidSpec` |
| `Ready` | Accepted and `transport: http` | `InvalidSpec`, `UnsupportedTransport` |

`status.observedGeneration` shows which spec generation the conditions describe.

## Routing

A `Ready` server is routed at `/mcp/<namespace>.<name>`. Path suffixes and
query strings after the route name are appended to `spec.endpoint`.

```bash
kubectl get mcpservers -A
kubectl describe mcpserver payments -n team-a
```
