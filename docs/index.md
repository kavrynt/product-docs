# Kavrynt Documentation

Kavrynt is a Kubernetes-native control plane for MCP infrastructure. It gives
platform teams one consistent way to register, discover, secure, and route
Model Context Protocol (MCP) servers for AI agents, on any Kubernetes cluster.

[Quickstart](quickstart.md){ .md-button .md-button--primary }
[Test Kavrynt](testing.md){ .md-button }
[Why Kavrynt](why-kavrynt.md){ .md-button }

## What works today (`1.0.0-beta.4`)

- **Registration:** declare MCP servers as Kubernetes `MCPServer` resources,
  validated by the API server and the Operator. The Operator lists each
  server's tools and reported version into its status.
- **Routing:** MCP traffic goes through one Gateway at
  `/mcp/<namespace>.<name>`, with MCP Streamable HTTP checks on every request.
- **Client authentication, on by default:** every MCP call needs an OAuth 2.1
  access token for its route from your authorization server.
- **Tool authorization policy:** Rego policy in the Gateway decides every
  call, can use each tool's reported behavior hints, and can hide the tools a
  caller may not use.
- **Endpoint scope:** an `MCPServer` reaches only its own namespace unless
  you allow a pair, so one team cannot route to another team's Services.
- **One token for many servers:** optionally, listed routes accept a token
  for the whole Gateway, so an agent needs one audience instead of one per
  route.
- **Audit:** one hash-chained JSON event per MCP request, verified with
  `kavryctl audit verify`.
- **Upstream credentials:** the Gateway sends MCP servers their own
  credential, or the caller's token exchanged for the server's audience. The
  caller's token never reaches the server.
- **Operations:**
  - a web console with alerts and 24-hour dashboards, signed in through
    your OpenID Connect provider or a generated admin password;
  - Prometheus metrics, Grafana dashboards, and alerts with runbooks, with
    notifications to Slack, email, Teams, or a webhook;
  - a tested high-availability profile, with MCP session affinity for
    stateful servers;
  - NetworkPolicies that keep traffic on the Gateway;
  - checked upgrades and rollbacks with `kavryctl`;
  - `kavryctl doctor` to check an installation, and `kavryctl export` and
    `import` to move registrations to a rebuilt cluster.

## Components

| Component | Purpose |
| --- | --- |
| Operator | Validates `MCPServer` resources, reports `Accepted` and `Ready`, and discovers their tools. |
| Gateway | Authenticates, checks, authorizes, audits, and proxies MCP traffic to `Ready` servers. Serves the web console. |
| `kavryctl` | CLI to validate and register servers, check an installation, export and import registrations, verify audit chains, and upgrade or roll back Kavrynt. |
| Helm chart | Installs the CRD, the Operator, and the Gateway. |

## Try it

=== "Trial on any cluster"

    A trial has no authorization server, so it opts out of client
    authentication explicitly. Use any Kubernetes cluster: local (Kind, k3d,
    minikube) or managed (EKS, AKS, GKE, OpenShift).

    ```bash
    helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version 1.0.0-beta.4 --namespace kavrynt-system --create-namespace --wait \
      --set gateway.auth.enabled=false
    ```

    Continue with the [Quickstart](quickstart.md).

=== "Existing cluster"

    ```bash
    helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
      --version 1.0.0-beta.4 --namespace kavrynt-system --create-namespace --wait \
      --set gateway.auth.resourceURL=https://mcp.example.com \
      --set-json 'gateway.auth.issuers=[{"issuer":"https://login.example.com/realms/agents"}]'
    ```

    Set your Gateway's external URL and your identity provider. See
    [Install on Kubernetes](installation.md) and [Security](security.md).

## Where to go next

<div class="grid cards" markdown>

-   :material-lightbulb-outline:{ .lg .middle } __Why Kavrynt__

    ---

    What sets a Kubernetes control plane for MCP apart from a gateway alone,
    and where Kavrynt does not fit yet.

    [:octicons-arrow-right-24: Why Kavrynt](why-kavrynt.md)

-   :material-rocket-launch-outline:{ .lg .middle } __Quickstart__

    ---

    Install Kavrynt on any Kubernetes cluster and call your first MCP tool
    through the Gateway.

    [:octicons-arrow-right-24: Quickstart](quickstart.md)

-   :material-clipboard-check-outline:{ .lg .middle } __Test Kavrynt__

    ---

    A step-by-step runbook for developers: routing, the console, policy,
    audit, your own MCP server, and how to send feedback.

    [:octicons-arrow-right-24: Test Kavrynt](testing.md)

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
