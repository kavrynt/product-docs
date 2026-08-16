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
| Registry | Catalog of known MCP servers and their metadata. |

## Why A Control Plane Helps

When one developer runs one MCP server locally, direct connection is enough.

When many teams run many MCP servers, teams need:

- Discovery
- Ownership metadata
- Stable routes
- Runtime visibility
- Approval and policy hooks
- Audit history

Kavrynt starts with discovery, registration, routing, and Kubernetes operation.

## What Kavrynt Does Not Do Yet

The MVP does not yet provide full enterprise governance. The following are
planned areas:

- Authentication and authorization
- Hosted UI
- Tenant isolation
- Advanced policy enforcement
- Tool risk scoring
- Durable audit storage

