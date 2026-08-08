---
id: HLD-0003
title: Gateway High-Level Design
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
  - RFC-0002
  - HLD-0002
---

# HLD-0003: Gateway High-Level Design

## Summary

Gateway is the Kavrynt data-plane component for remote MCP server access.

It provides a controlled endpoint between MCP hosts/clients and registered MCP
server workloads. In the first real design, Gateway focuses on streamable HTTP
MCP traffic. Stdio MCP servers remain local developer/runtime processes and are
not proxied by Gateway in the MVP.

## Responsibilities

- Receive remote MCP client traffic.
- Route requests to registered MCP server workloads.
- Load route configuration produced from Registry and Operator state.
- Expose health and metrics.
- Provide a future enforcement point for authentication, authorization, policy,
  and audit.

## Non-Responsibilities

- Storing product metadata as source of truth.
- Deploying MCP workloads.
- Acting as an MCP host.
- Creating LLM completions.
- Owning Kubernetes reconciliation.

## Architecture

```text
MCP Host / Client
      |
      v
   Gateway
      |
      +--> route lookup
      +--> future authn/authz/policy
      +--> telemetry
      |
      v
MCP Server Service
```

## Inputs

- route configuration,
- upstream MCP server endpoint,
- server version,
- policy reference,
- timeout/retry settings,
- TLS configuration,
- future identity context.

## Outputs

- proxied MCP traffic,
- access logs,
- metrics,
- health state,
- future audit events.

## Interactions

| Component | Interaction |
| --- | --- |
| Registry | Gateway consumes server/route metadata, directly or through generated config |
| Operator | Operator configures Gateway routing when Kubernetes is used |
| `kavryctl` | CLI reads Gateway health/status; does not proxy traffic |
| MCP Server | Gateway forwards approved remote MCP traffic |

## Security Boundaries

Gateway is the runtime trust boundary for remote MCP access.

Future controls:

- TLS termination or pass-through decision,
- client authentication,
- server identity validation,
- policy checks,
- tool-level authorization if Gateway understands MCP messages,
- audit events.

## Observability

Gateway should expose:

- request count,
- error count,
- upstream latency,
- upstream health,
- active routes,
- rejected requests when policy exists.

## Open Questions

- Should MVP Gateway be a transparent HTTP reverse proxy or MCP-aware proxy?
- Should Gateway parse MCP JSON-RPC messages for tool/resource/prompt metadata?
- How does Gateway receive route updates?
- What is the first identity model for MCP clients?
- How are secrets and TLS certificates managed?
