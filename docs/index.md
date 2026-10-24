# Kavrynt Documentation

Kavrynt is a Kubernetes-native control plane for MCP infrastructure. It gives
platform teams one consistent way to register, discover, secure, and route
Model Context Protocol (MCP) servers for AI agents, on any Kubernetes cluster.

[Quickstart on Kind](quickstart.md){ .md-button .md-button--primary }
[Read the overview](overview.md){ .md-button }

## What works today (`1.0.0-beta.2`)

- **Registration:** declare MCP servers as Kubernetes `MCPServer` resources,
  validated by the API server and the Operator. The Operator lists each
  server's tools and reported version into its status.
- **Routing:** MCP traffic goes through one Gateway at
  `/mcp/<namespace>.<name>`, with MCP Streamable HTTP checks on every request.
- **Client authentication, on by default:** every MCP call needs an OAuth 2.1
  access token for its route from your authorization server.
- **Tool authorization policy:** Rego policy in the Gateway decides every
  call, and can hide the tools a caller may not use.
- **Audit:** one hash-chained JSON event per MCP request, verified with
  `kavryctl audit verify`.
- **Upstream credentials:** the Gateway sends MCP servers their own
  credential, or the caller's token exchanged for the server's audience. The
  caller's token never reaches the server.
- **Operations:**
  - a web console;
  - Prometheus metrics, a Grafana dashboard, and alerts with runbooks;
  - a tested high-availability profile;
  - NetworkPolicies that keep traffic on the Gateway;
  - checked upgrades and rollbacks with `kavryctl`.

## Components

| Component | Purpose |
| --- | --- |
| Operator | Validates `MCPServer` resources, reports `Accepted` and `Ready`, and discovers their tools. |
| Gateway | Authenticates, checks, authorizes, audits, and proxies MCP traffic to `Ready` servers. Serves the web console. |
| `kavryctl` | CLI to validate and register servers, verify audit chains, and upgrade or roll back Kavrynt. |
| Helm chart | Installs the CRD, the Operator, and the Gateway. |

## Try it

=== "Local trial (Kind)"

    A trial has no authorization server, so it opts out of client
    authentication explicitly:

    ```bash
    kind create cluster --name kavrynt-trial
    helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version 1.0.0-beta.2 --namespace kavrynt-system --create-namespace --wait \
      --set gateway.auth.enabled=false
    ```

    Continue with the [Quickstart](quickstart.md).

=== "Existing cluster"

    ```bash
    helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version 1.0.0-beta.2 --namespace kavrynt-system --create-namespace --wait \
      --set gateway.auth.resourceURL=https://mcp.example.com \
      --set-json 'gateway.auth.issuers=[{"issuer":"https://login.example.com/realms/agents"}]'
    ```

    Set your Gateway's external URL and your identity provider. See
    [Install on Kubernetes](installation.md) and [Security](security.md).

## Where to go next

<div class="grid cards" markdown>

-   :material-rocket-launch-outline:{ .lg .middle } __Quickstart__

    ---

    Install Kavrynt on Kind and route your first MCP server through the
    Gateway.

    [:octicons-arrow-right-24: Quickstart on Kind](quickstart.md)

-   :material-kubernetes:{ .lg .middle } __Install on Kubernetes__

    ---

    Helm values, signature verification, upgrades, and production settings.

    [:octicons-arrow-right-24: Installation](installation.md)

-   :material-shield-lock-outline:{ .lg .middle } __Security__

    ---

    Client authentication, policy, audit, and credentials for MCP servers.

    [:octicons-arrow-right-24: Security](security.md)

-   :material-chart-line:{ .lg .middle } __Operations__

    ---

    High availability, metrics, alerts, and upgrades.

    [:octicons-arrow-right-24: Operations](operations.md)

</div>
