# Release Notes

## 1.0.0-beta.2

**Fixed**

- `kavryctl upgrade` now runs `helm upgrade --reset-then-reuse-values` and
  needs Helm 3.14 or newer. In `1.0.0-beta.1` it ran `--reuse-values`, which
  kept the previous chart's defaults: the old images kept running. Upgrading
  from `0.0.5-beta.1` that way also kept MCP routes open instead of asking
  for the authentication choice.

Everything else is as in `1.0.0-beta.1`. Full notes:
[GitHub release](https://github.com/kavrynt/kavrynt/releases/tag/v1.0.0-beta.2).

## 1.0.0-beta.1

Beta for evaluation in development and staging clusters. Full notes:
[GitHub release](https://github.com/kavrynt/kavrynt/releases/tag/v1.0.0-beta.1).

**Action required: MCP client authentication is on by default.** An install
or upgrade stops until it sets `gateway.auth.resourceURL` and
`gateway.auth.issuers`, or `gateway.auth.enabled=false` for a trial. See
[Install](installation.md#install).

**Added**

- MCP client authentication: the Gateway is an OAuth 2.1 resource server
  with per-route token audiences and Protected Resource Metadata.
- Tool authorization policy: Rego evaluated in the Gateway, deny by default,
  from a ConfigMap. Optionally, each caller's `tools/list` shows only the
  tools it may call.
- Audit events: one hash-chained JSON line per MCP request, verified with
  `kavryctl audit verify`.
- Credentials for MCP servers:
  - stored credentials (`spec.credential`), pinned to the endpoint;
  - token exchange (`spec.tokenExchange`, RFC 8693) for servers that need
    the user.
- MCP Streamable HTTP checks on every route.
- A high-availability profile, NetworkPolicies that keep traffic on the
  Gateway, and alerting rules with runbooks.
- `kavryctl upgrade` and `kavryctl rollback`.

**Changed**

- The `MCPServer` CRD is installed and upgraded with the chart, and kept on
  uninstall and rollback. Releases up to `0.0.5-beta.1` need a one-time
  adoption; see
  [Upgrading from 0.0.5-beta.1](installation.md#upgrading-from-005-beta1-or-earlier).
- JSON-RPC batches, and `Mcp-Method` or `Mcp-Name` headers that disagree
  with the body, are refused with `400`.

## 0.0.5-beta.1

- The runtime is licensed under the Apache License 2.0. Earlier releases
  remain under the Elastic License 2.0.
- Console v2: an overview of what needs attention, a tools catalog across
  servers, and traffic analysis with per-tool error rates and latency.
- Console admin login, on by default, with a generated password.
- The Operator records each server's reported name and version
  (`status.serverInfo`, column `REPORTED`).

## 0.0.4-beta.1

- The Operator discovers each `Ready` server's tools (MCP `tools/list`) into
  `status.tools`, with a `ToolsDiscovered` condition that never affects
  `Ready`.
- Opt-in inventory sync to Kavrynt Cloud.
- A read-only web console on the Gateway at `/ui/`.
- The Gateway and the Operator refuse link-local, cloud metadata, and
  loopback addresses.

## 0.0.3-beta.1

Beta for evaluation in trusted clusters.

**Added**

- MCP traffic metrics on the Gateway's `/metrics` endpoint: requests,
  outcomes, latency, and bytes per route, method, and tool. Metadata only; tool
  arguments and results are never recorded.
- Optional Prometheus Operator `ServiceMonitor` and "Kavrynt MCP Traffic"
  Grafana dashboard in the Helm chart.
- `Ready=False` with reason `NamespaceNotWatched` for servers in namespaces the
  Gateway does not watch. Previously they showed `Ready=True` while the Gateway
  returned 404.

**Changed**

- **Action required if you set it:** `gateway.config.watchNamespaces` is now
  `global.watchNamespaces`, so the Gateway and the Operator read the same list.
  The chart refuses the old key and names the new one.
- `kavryctl list` shows `-` in the `ROUTE` column until a server is `Ready`.

**Fixed**

- The Operator no longer logs `events is forbidden` at startup. Its role now
  allows it to record Events.
- The Gateway forwards `Content-Length` instead of re-sending request bodies
  with chunked encoding, so MCP servers that cannot read chunked bodies work.
- Go standard library and dependency security updates.

The `MCPServer` CRD is unchanged from `0.0.2-beta.1`.

## 0.0.2-beta.1

Beta for evaluation in trusted clusters.

**Changed**

- Removed the separate Registry service. `MCPServer` resources are the only
  source of truth; the Gateway watches them directly instead of polling.
- New `Accepted` and `Ready` conditions replace `Registered`.
- The CRD validates `spec.endpoint` at admission.
- `kavryctl` works through your kubeconfig (`register`, `unregister`, `list`,
  `inspect`, `validate`).

**Security**

- The Gateway never forwards `Authorization`, `Cookie`, or
  `Proxy-Authorization` to MCP servers and drops upstream `Set-Cookie`.
- The Gateway has read-only access to `MCPServer` resources and no other
  Kubernetes permissions.
- Images are scanned with Trivy and signed with Cosign (keyless).

## 0.0.1-beta.1

Internal trial build with a separate Registry service. It was not published;
`0.0.2-beta.1` is the first public beta.
