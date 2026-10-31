# System Architecture

Kavrynt separates desired state (Kubernetes resources) from runtime traffic
(the Gateway). The Kubernetes API is the only in-cluster source of truth.

## Logical view

```text
             desired state                                runtime traffic
  +------------------------------+
  | kubectl / GitOps / kavryctl  |
  +--------------+---------------+
                 | MCPServer
                 v
  +------------------------------+   validate, status   +------------------+
  | Kubernetes API server        |<---------------------| Kavrynt Operator |
  | (CRD admission validation)   |   Accepted / Ready,  | (tool discovery) |
  +--------------+---------------+   tools              +------------------+
                 | watch (read-only)
                 v
  +------------------------------+   access token       +------------------+
  | Kavrynt Gateway              |<---------------------| MCP client/agent |
  | /mcp/<namespace>.<name>      |                      +------------------+
  | authn, checks, policy, audit |------> your authorization server
  +--------------+---------------+        (keys, token exchange)
                 | HTTP, caller credentials removed,
                 | server credential added
                 v
  +------------------------------+
  | MCP server workloads         |
  +------------------------------+
```

## Components

| Component | Role | Kubernetes access |
| --- | --- | --- |
| Operator | Validates `MCPServer` resources, writes status conditions, and lists each server's tools (MCP `tools/list`) into `status.tools` | Read and update `MCPServer` and its status; Leases and Events for leader election |
| Gateway | Builds routes from `Ready` servers, enforces authentication and policy, writes audit events, proxies MCP requests, and serves the console | `get`, `list`, `watch` on `MCPServer` only; Secrets are mounted, never read through the API |
| `kavryctl` | Client CLI | Uses the caller's kubeconfig and RBAC |
| Helm chart | Installs the CRD, Operator, and Gateway | — |

## Request path

1. A client sends `POST /mcp/<namespace>.<name>` to the Gateway.
2. **Client authentication:** the bearer token must be valid for this route,
   or the answer is `401` or `403`. This runs before the route lookup, so a
   `404` for an unknown route needs a valid token too.
3. **MCP request checks:** a malformed request gets `400`.
4. **Policy:** with a policy, a denied JSON-RPC request gets `200` with a
   JSON-RPC error; other denied requests get `403`.
5. **Forwarding:**
    - the Gateway removes hop-by-hop headers and caller credentials
      (`Authorization`, `Cookie`, `Proxy-Authorization`);
    - it adds the server's stored credential or exchanged token, if the
      server declares one, and `X-Kavrynt-Route`;
    - it forwards to `spec.endpoint`.
6. **The answer** returns without upstream `Set-Cookie`, sandboxed with
   `Content-Security-Policy`. With the policy's tool-list filter on, a
   `tools/list` answer is filtered first.
7. **Records:** the request is counted in the metrics, and, with audit on,
   written as one audit event.

The Gateway refuses to connect to link-local, cloud metadata, and loopback
addresses, and passes redirects to the client rather than following them.

## Kubernetes boundary

Kavrynt installs into `kavrynt-system` by default. `MCPServer` resources can
live in any namespace; the Gateway route includes the namespace, so equal names
in different namespaces stay distinct.

## Planned: Kavrynt Cloud

Conceptual, not available. A hosted control plane will provide cross-cluster
inventory, SSO, RBAC, central policy, approvals, audit storage, and usage.
Clusters will connect outbound only; MCP traffic and tool calls will stay in
the customer's cluster, with policy evaluated locally by the Gateway.
