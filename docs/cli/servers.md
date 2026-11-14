# Manage servers

Register, list, inspect, and remove `MCPServer` resources. These commands use
your kubeconfig and RBAC, and take the [cluster flags](index.md#cluster-flags).

## validate

```bash
kavryctl validate server.yaml
```

Checks an `MCPServer` manifest, in YAML or JSON, without contacting a
cluster. Use it in CI before `register`.

## register

```bash
kavryctl register -n team-a server.yaml
```

Creates the `MCPServer`, or updates it if it exists. Without `-n`, the
namespace comes from the manifest, then from the kubeconfig context.

## list

```bash
kavryctl list -n team-a
kavryctl list -A            # all namespaces
```

Example output:

```text
NAMESPACE  NAME        VERSION  TRANSPORT  READY  ROUTE                 TOOLS        AGE
team-a     payments    1.0.0    http       True   /mcp/team-a.payments  4            2m
team-a     local-tool  1.0.0    stdio      False  -                     NotRoutable  2m
```

- `ROUTE` shows `-` until the server is `Ready`, because the Gateway routes
  only `Ready` servers.
- `TOOLS` shows the number of tools once the Operator has listed them, the
  reason when it has not (such as `DiscoveryFailed` or `NotRoutable`), and
  `-` before the Operator has looked. See
  [`MCPServer` is not `Ready`](../troubleshooting.md#mcpserver-is-not-ready).
- In an empty namespace, `list` says how many servers other namespaces
  have and points to `kavryctl list -A`, for example
  `no MCPServers found in namespace team-b; 2 in other namespaces: kavryctl list -A`.

## inspect

```bash
kavryctl inspect -n team-a payments
```

Prints the full `MCPServer` resource, with its status, as JSON.

## unregister

```bash
kavryctl unregister -n team-a payments
```

Deletes the `MCPServer`. The Gateway stops routing it.
