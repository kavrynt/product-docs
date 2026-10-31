# Why Kavrynt

An MCP gateway puts one entry point in front of many MCP servers. Kavrynt is
a control plane for MCP on Kubernetes: the Gateway is one part of it, next to
a Kubernetes API for MCP servers, an Operator that knows what each server
offers, and the tools to run all of it day to day. These are the design
choices that shape it.

## Kubernetes is the source of truth

MCP servers are declared as [`MCPServer`](reference/mcpserver.md) resources,
validated by the API server at admission, and applied with `kubectl`, GitOps,
or `kavryctl`. There is no separate registry or gateway database to keep in
sync.

- The Operator reports `Accepted` and `Ready`, lists each server's tools and
  their MCP behavior hints into `status.tools`, and records the version the
  server reports. `kubectl get mcpservers -A` is your inventory.
- A failed tool discovery shows in `kubectl get` and `kavryctl list`, with a
  message that names the cause.
- The Gateway routes only `Ready` servers, at `/mcp/<namespace>.<name>`, and
  picks up changes by watching the API, not by polling or restarting.

## Caller credentials stay at the Gateway

A gateway that forwards the caller's token gives every MCP server a
credential it could use somewhere else. Kavrynt never forwards it: the
Gateway removes `Authorization`, `Cookie`, and `Proxy-Authorization` from
every request. A server that needs a credential declares how it gets one:

- **Its own credential** (`spec.credential`), from a Secret the kubelet
  mounts, sent only to the endpoint origin it is pinned to.
- **The caller's identity**, exchanged for a token with the server's own
  audience (`spec.tokenExchange`, OAuth 2.0 Token Exchange, RFC 8693), and
  only for audiences the platform team allowed for that namespace.

Neither the Gateway nor the Operator has RBAC on Secrets. See
[Credentials for MCP servers](security.md#credentials-for-mcp-servers).

## One token, one server

The Gateway is an OAuth 2.1 resource server for your identity provider. Each
route has its own audience, `<resourceURL>/mcp/<namespace>.<name>`, and its
own Protected Resource Metadata (RFC 9728), so standard MCP clients find
your authorization server and a token issued for one MCP server is refused
by every other.

For agents that call many servers, a token for the whole Gateway can be
accepted on the routes you list (`gateway.auth.gatewayAudience`), never on
all of them by a wildcard. Policy input and audit events say which audience a
call used. See [Client authentication](security.md#client-authentication).

## Secure by default, fail closed

- **Authentication is on by default.** An install fails until it names your
  authorization server or explicitly opts out, and an opt-out is warned
  about at start and in the console.
- **Policy denies unless it allows.** The embedded Open Policy Agent must
  return `{"allow": true}`; an error, a timeout, or a policy that does not
  compile denies or keeps the previous policy in force. A filtered
  `tools/list` that cannot finish returns an empty list.
- **No call without its record.** With audit on, a full audit queue refuses
  new MCP requests instead of serving them unrecorded.
- **Strict MCP checks.** Requests that are not well-formed MCP Streamable
  HTTP get `400` before they reach a server.

## Decisions on tools, not just routes

The [tool authorization policy](security.md#tool-authorization-policy) is
Rego, evaluated in the Gateway for every MCP request. It sees the verified
caller, the route, the MCP method, and the tool, plus the tool's recorded
behavior hints and whether it was discovered, but never its arguments.

- Each caller's `tools/list` can show only the tools that caller may call.
- A denied tool call answers with a JSON-RPC error the agent can read
  (`denied by policy: <reason>`).
- Policy is a ConfigMap of `.rego` files, so it is reviewed and rolled out
  like any other configuration.

## Audit you can verify

With audit on, the Gateway writes one JSON event per MCP request: who called,
which route and tool, the decision and its reason, the outcome, and the
policy revision. Events never contain tool arguments, results, or tokens, and
every response carries the event's `X-Request-Id`.

Events are chained with SHA-256 per Gateway instance, and
`kavryctl audit verify` reports every gap, reordering, or altered event. Ship
the events off the cluster with your log pipeline, so a record cannot be
rewritten where it was written. See [Audit events](security.md#audit-events).

## Team boundaries in shared clusters

- **Endpoint scope.** An `MCPServer` reaches only Services in its own
  namespace unless the platform team allows the pair, so one team cannot
  route the Gateway to another team's workloads. See
  [Endpoint scope](security.md#endpoint-scope).
- **Egress checks.** The Gateway and the Operator refuse link-local, cloud
  metadata, and loopback addresses when they connect, and the Gateway passes
  redirects back instead of following them.
- **Traffic stays on the Gateway.** Opt-in NetworkPolicies make MCP server
  pods reachable only from the Gateway and the Operator. See
  [Keeping traffic on the Gateway](security.md#keeping-traffic-on-the-gateway).
- **Least privilege.** The Gateway can only read `MCPServer` resources and
  EndpointSlices. Images are distroless, non-root, and read-only.

## Built for day two

- [`kavryctl doctor`](reference/kavryctl.md#doctor) checks an installation
  and says what to fix; `--anonymize` makes the report safe for a public
  issue.
- [`kavryctl export` and `import`](reference/kavryctl.md#export-and-import)
  move registrations to a rebuilt cluster, with secrets redacted.
- `kavryctl upgrade` and `rollback` check the release before they change it
  and report every server that is no longer routed afterwards.
- A [high-availability profile](operations.md#high-availability), tested by
  restarting every Gateway replica under load without a failed call, and MCP
  session affinity for stateful servers, with no shared state between
  Gateway replicas.
- Prometheus metrics, Grafana dashboards, and
  [alerts](operations.md#alerts) with a runbook each, with notifications to
  Slack, email, Microsoft Teams, or a webhook.
- A web console with alerts, 24-hour dashboards, a tool catalog, and a
  playground, with sign-in through your OpenID Connect provider.

## In your cluster, in the open

MCP traffic, tool calls, and policy decisions stay in your cluster, and
nothing depends on a hosted service: the Kavrynt Cloud connectors are off
unless you turn them on. The runtime is open source under the
Apache License 2.0 at
[github.com/kavrynt/kavrynt](https://github.com/kavrynt/kavrynt), with
Cosign-signed multi-architecture images and one Helm chart.

## Where Kavrynt does not fit yet

Kavrynt `1.0.0-beta.4` is a beta for development and staging clusters. Choose
something else, or wait, if you need:

- **MCP over stdio routed directly.** Only `http` servers are routed; run a
  stdio server behind a Streamable HTTP bridge in its own pod.
- **A gateway for model or agent-to-agent traffic.** Kavrynt governs MCP
  traffic only.
- **Approvals for high-risk tool calls.** Policy allows or denies; holding a
  call for a person is [planned](overview.md#roadmap-planned-not-implemented).
- **MCP on a laptop without Kubernetes.** Kavrynt runs on any Kubernetes
  cluster, including a local Kind cluster, but not without one.
- **Roles in the console,** or cross-cluster inventory and central policy,
  which Kavrynt Cloud will provide.

Ready to try it? Start with the [Quickstart](quickstart.md).
