# MCP Concepts

Model Context Protocol, or MCP, gives AI applications a standard way to connect
to external tools and context.

Kavrynt does not replace MCP. Kavrynt helps teams operate MCP servers.

## Basic Roles

| Role | Meaning |
| --- | --- |
| AI client | Application or agent that wants to use tools or context. |
| MCP server | Service that exposes capabilities to an AI client. |
| Tool | Action or capability exposed by an MCP server. |
| Gateway | Stable entry point between clients and registered servers. |
| `MCPServer` | Kubernetes resource that declares an MCP server and its endpoint. |

## Why A Control Plane Helps

When one developer runs one MCP server locally, direct connection is enough.

When many teams run many MCP servers, teams need:

- Discovery
- Ownership metadata
- Stable routes
- Runtime visibility
- Approval and policy hooks
- Audit history

Kavrynt provides discovery (the Operator lists each server's tools), stable
routes, Kubernetes-native registration, client authentication, tool
authorization policy, audit events, and runtime metrics.

## What Kavrynt Does Not Do Yet

- Approvals for high-risk tool calls
- Hosted, cross-cluster inventory (Kavrynt Cloud)
- Tool risk scoring
- Durable audit storage (events go to standard output for your log pipeline)
