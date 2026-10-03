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
  +------------------------------+   validate, set     +------------------+
  | Kubernetes API server        |<--------------------| Kavrynt Operator |
  | (CRD admission validation)   |   Accepted / Ready  +------------------+
  +--------------+---------------+
                 | watch (read-only)
                 v
  +------------------------------+                     +------------------+
  | Kavrynt Gateway              |<--------------------| MCP client/agent |
  | /mcp/<namespace>.<name>      |                     +------------------+
  +--------------+---------------+
                 | HTTP, caller credentials removed
                 v
  +------------------------------+
  | MCP server workloads         |
  +------------------------------+
```

## Components

| Component | Role | Kubernetes access |
| --- | --- | --- |
| Operator | Validates `MCPServer` resources and writes status conditions | Read/update `MCPServer` and its status; Leases for leader election |
| Gateway | Builds routes from `Ready` servers and proxies HTTP MCP requests | `get`, `list`, `watch` on `MCPServer` only |
| `kavryctl` | Client CLI | Uses the caller's kubeconfig and RBAC |
| Helm chart | Installs the CRD, Operator, and Gateway | — |

## Request path

1. A client sends `POST /mcp/<namespace>.<name>` to the Gateway.
2. The Gateway looks up the route. Unknown routes return `404`.
3. The Gateway removes hop-by-hop headers and caller credentials
   (`Authorization`, `Cookie`, `Proxy-Authorization`) and adds
   `X-Kavrynt-Route`.
4. The request is forwarded to the server's `spec.endpoint`; the response is
   returned without upstream `Set-Cookie`.

## Kubernetes boundary

Kavrynt installs into `kavrynt-system` by default. `MCPServer` resources can
live in any namespace; the Gateway route includes the namespace, so equal names
in different namespaces stay distinct.

## Planned: Kavrynt Cloud

Conceptual, not implemented. A hosted control plane will provide cross-cluster
inventory, console, SSO, RBAC, policy authoring, approvals, audit, and usage.
Clusters will connect outbound only; MCP traffic and tool calls will stay in the
customer's cluster, with policy evaluated locally by the Gateway.
