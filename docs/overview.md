# Overview

MCP makes tools and context available to AI agents. As teams add MCP servers,
platform and security teams need to know what exists, route traffic
predictably, and control who can call which tool. Kavrynt provides that
control plane on Kubernetes.

## Problem

- MCP servers are created by different teams without a shared inventory.
- AI clients need stable endpoints while servers move and change.
- Anyone who can reach an MCP server can call every tool it offers.
- Security teams need one place to authenticate callers, authorize tool
  calls, and keep an audit record.

## How Kavrynt works

```text
Developer / platform engineer
  -> MCPServer resource (kubectl, GitOps, or kavryctl)
  -> Kubernetes API (validated at admission)
  -> Operator sets Accepted / Ready and lists the server's tools
  -> Gateway watches Ready servers

AI agent with an access token
  -> Gateway /mcp/<namespace>.<name>
       authenticate -> check the MCP request -> policy -> audit
       credential for the server (stored, or exchanged for the user)
  -> MCP server
```

Customer MCP traffic stays inside the customer's cluster.

## Product shape

| Offering | Scope | Status |
| --- | --- | --- |
| Kavrynt Runtime | Operator, Gateway with web console, `MCPServer` CRD, Helm chart, `kavryctl`, delivered as signed images and a chart | Beta (`1.0.0-beta.2`) |
| Kavrynt Cloud | Hosted inventory across clusters, SSO, RBAC, central policy, approvals, audit storage, usage | In development, not available |

The runtime is open source under the
[Apache License 2.0](https://github.com/kavrynt/kavrynt/blob/main/LICENSE) at
[github.com/kavrynt/kavrynt](https://github.com/kavrynt/kavrynt). Releases up
to `0.0.4-beta.1` remain under the Elastic License 2.0.

## Current limitations

`1.0.0-beta.2` is a beta for development and staging clusters:

- **No approvals.** Policy allows or denies; it cannot hold a high-risk call
  for a human.
- **Audit events go to standard output only.** Ship them with your log
  pipeline; delivery to Kavrynt Cloud is not built.
- **`http` only.** Only the `http` transport is routed; `stdio` servers are
  accepted but not routable.
- **Token exchange** authenticates the Gateway with a client secret
  (`client_secret_basic`) only.
- **The console** has a single `admin` login, separate from MCP client
  authentication.

## Roadmap (planned, not implemented)

1. Approvals for high-risk tool calls.
2. The console signed in through your identity provider.
3. Audit delivery to Kavrynt Cloud, and usage events.
4. Alerts in the console, alert notifications, and custom dashboards.
5. Kavrynt Cloud: cross-cluster inventory and central policy.
