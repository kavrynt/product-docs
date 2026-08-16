# Overview

Kavrynt provides a control plane for teams that want to run MCP servers in a
repeatable, Kubernetes-native way.

MCP makes tools and context available to AI agents. As teams add more MCP
servers, they need a way to track what exists, route traffic predictably, apply
policy, and operate the system with familiar platform practices.

Kavrynt starts with that operational foundation.

## Problem

Without a control plane, MCP usage can become difficult to manage:

- MCP servers are created by different teams without a shared catalog.
- AI clients need stable endpoints but MCP servers move or change.
- Platform teams need visibility into what is deployed.
- Security teams need a place to add policy, approval, and audit controls.
- Developers need a simple local and Kubernetes install path.

## Kavrynt MVP

The MVP focuses on the first useful workflow:

```text
Developer
  -> kavryctl or MCPServer custom resource
  -> Registry
  -> Gateway
  -> MCP server
  -> AI client traffic
```

## Product Shape

Kavrynt has two packaging directions:

| Package | Audience | Scope |
| --- | --- | --- |
| Open Kavrynt | Developers and platform teams | CLI, Registry API, Gateway, Operator, Helm charts, local install docs. |
| Kavrynt Cloud | Teams and enterprises | Hosted registry, control UI, SSO, RBAC, audit logs, policy management, usage dashboard, support. |

The public docs focus first on the open Kubernetes install path.

## Current Status

Kavrynt is an early MVP. It is suitable for local testing, demos, and design
feedback. Production hardening work is still planned.

