# Overview

MCP makes tools and context available to AI agents. As teams add MCP servers,
platform and security teams need to know what exists, route traffic
predictably, and eventually control who can call which tool. Kavrynt provides
that operational layer on Kubernetes.

## Problem

- MCP servers are created by different teams without a shared inventory.
- AI clients need stable endpoints while servers move and change.
- Platform teams need MCP servers to follow normal Kubernetes practices.
- Security teams need one place to add authentication, policy, approval, and
  audit for tool calls.

## How Kavrynt works today

```text
Developer / platform engineer
  -> MCPServer resource (kubectl, GitOps, or kavryctl)
  -> Kubernetes API (validated at admission)
  -> Operator sets Accepted / Ready
  -> Gateway watches Ready servers
  -> AI client calls /mcp/<namespace>.<name>
  -> MCP server
```

Customer MCP traffic stays inside the customer's cluster.

## Product shape

| Offering | Scope | Status |
| --- | --- | --- |
| Kavrynt Runtime | Operator, Gateway, `MCPServer` CRD, Helm chart, `kavryctl`, delivered as signed images and a chart | Beta (`0.0.2-beta.1`) |
| Kavrynt Cloud | Hosted inventory across clusters, console, SSO, RBAC, policy, approvals, audit, usage | In development, not available |

Kavrynt is commercial software. Evaluation uses published container images and
the Helm chart; source code is not distributed.

## Current limitations

`0.0.2-beta.1` is an early beta for trusted evaluation clusters:

- The Gateway does not authenticate clients or enforce tool-level policy.
- The Gateway does not exchange tokens for upstream servers, so MCP servers
  that need user identity must use their own credentials.
- Only the `http` transport is routed; `stdio` servers are accepted but not
  routable.
- Single Gateway replica by default; no high-availability profile has been
  validated.
- No audit or usage events yet.

## Roadmap (planned, not implemented)

1. MCP traffic metrics: requests, errors, and latency per MCP server and tool,
   with a Grafana dashboard. Metadata only; tool arguments and results are
   never recorded.
2. Gateway as an OAuth 2.1 resource server following the MCP authorization
   specification, using your identity provider.
3. Tool-level policy evaluated in the Gateway, with approvals for high-risk
   tools.
4. Audit events.
5. Kavrynt Cloud: cross-cluster inventory, MCP traffic dashboards, and central
   policy.
