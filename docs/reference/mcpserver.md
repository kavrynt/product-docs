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
| `credential` | no | The server needs a stored credential: `header` (default `Authorization`) and `scheme` (for example `Bearer`). The value lives in a Secret, never here. `http` only |
| `tokenExchange` | no | The server gets the caller's token exchanged for its own: `audience` (required, absolute URI) and `scopes`. `http` only; not with `credential` |

`metadata.name` must be a lowercase DNS subdomain. `credential.header` must
not be a header that frames or routes the request, `Cookie`, or an `Mcp-*`
header. See [Security](../security.md#credentials-for-mcp-servers).

## Status

| Condition | `True` when | `False` reasons |
| --- | --- | --- |
| `Accepted` | The spec is valid | `InvalidSpec` |
| `Ready` | Accepted, `transport: http`, and in a namespace the Gateway watches | `InvalidSpec`, `UnsupportedTransport`, `NamespaceNotWatched` |
| `ToolsDiscovered` | The Operator listed the server's tools (`Discovered`) | `DiscoveryFailed`, `NotRoutable`, `CredentialUnavailable`, `CallerTokenRequired` |

`ToolsDiscovered` never changes `Ready`. The status also carries:

- `status.tools`: the server's tools and input schemas;
- `status.serverInfo`: the name and version the server reports, shown as
  `REPORTED` in `kubectl get mcpservers`;
- `status.observedGeneration`.

Tools and serverInfo come from the server and are untrusted.

`NamespaceNotWatched` appears only when `global.watchNamespaces` is set and
does not include the server's namespace. See
[Configuration](../installation.md#configuration).

## Routing

A `Ready` server is routed at `/mcp/<namespace>.<name>`. Path suffixes and
query strings after the route name are appended to `spec.endpoint`. Path
segments `.` and `..` are rejected.

```bash
kubectl get mcpservers -A
kubectl describe mcpserver payments -n team-a
```
