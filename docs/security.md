# Security

How the Gateway decides who may call which tool, what it records, and how MCP
servers get credentials, in the order a request meets them:

1. client authentication;
2. MCP request checks;
3. tool authorization policy;
4. the server's credential;
5. the audit event.

## Client authentication

On by default. The Gateway is an OAuth 2.1 resource server: it never issues
tokens. Your authorization server does, and the Gateway trusts it by
configuration.

```yaml
gateway:
  auth:
    resourceURL: https://mcp.example.com      # the Gateway's external origin
    issuers:
      - issuer: https://login.example.com/realms/agents
        # jwksURI: optional; discovered from the issuer's metadata
        # allowHTTP: true only for an in-cluster authorization server on http
    requiredScopes: [mcp:tools]                # optional
```

A request to `/mcp/<namespace>.<name>` is forwarded only with
`Authorization: Bearer <token>`, where the token is a JWT that:

- is signed by a trusted issuer with an asymmetric algorithm (RS, PS, ES, or
  EdDSA);
- has an audience of `<resourceURL>/mcp/<namespace>.<name>`, so a token for
  one route does not work on another;
- is not expired, within 60 seconds of clock skew;
- carries every required scope.

| Case | Answer |
| --- | --- |
| No token | `401` with `WWW-Authenticate: Bearer ... resource_metadata="<url>"` |
| Token in the query string or a form field | `400` |
| Invalid, expired, wrong issuer or audience | `401 invalid_token` (the answer never says which check failed) |
| Missing required scope | `403 insufficient_scope` |
| Issuer's keys cannot be loaded | `503`, `Retry-After: 60` |

Standard MCP clients follow `resource_metadata` to the route's Protected
Resource Metadata (RFC 9728), at
`/.well-known/oauth-protected-resource/mcp/<route>`, to find your
authorization server. The token is removed before forwarding and never
logged.

**One token for many routes (the Gateway audience).** Each route has its
own audience, so an agent that calls ten MCP servers needs a token for all
ten. With `gateway.auth.gatewayAudience.enabled=true`, the routes in
`gateway.auth.gatewayAudience.routes` (names like `team-a.search` or
patterns like `team-a.*`, never `*`) also accept a token whose `aud` is the
Gateway's `resourceURL`. A token for a route's own audience still works, and
every other check still applies. Policy input and audit events say which
audience a call used (`route` or `gateway`), so a policy can require a
route's own audience for sensitive servers. A leaked Gateway-audience token
reaches every listed route: list only what one token should reach. The
Gateway warns at start, and the console names the routes.

`gateway.auth.enabled=false` turns authentication off. Every route is then
open to anyone who can reach the Gateway. The Gateway logs a warning at start,
and the console shows that MCP routes are not authenticated.

## MCP request checks

Every request must be well-formed MCP Streamable HTTP, or it gets `400`
without reaching the server:

- `MCP-Protocol-Version` must be a supported revision: `2024-11-05`,
  `2025-03-26`, `2025-06-18`, `2025-11-25`, or `2026-07-28`;
- no JSON-RPC batches;
- the `Mcp-Method` and `Mcp-Name` headers must match the body;
- from revision `2026-07-28`, `Mcp-Method` is required.

Set `gateway.config.strictProtocol=false` to let clients migrate.

**Request size.** A request body may be at most
`gateway.config.maxRequestBytes` (4 MiB by default). A larger
`Content-Length` gets `413` before anything reaches the MCP server; a body
without a length is forwarded up to the limit and then cut with `413`. With
the tool authorization policy on, a `POST` body without a length that is too
large to read (over 1 MiB) is refused with `400` first.

## Tool authorization policy

Open Policy Agent, embedded in the Gateway, evaluates your Rego policy before
every MCP request is forwarded. The policy comes from a ConfigMap of `.rego`
files and must define `data.kavrynt.authz.decision`. Only
`{"allow": true}` allows; anything else denies, including an error or an
evaluation over 100 ms.

```bash
kubectl -n kavrynt-system create configmap kavrynt-policy --from-file=authz.rego
helm upgrade kavrynt oci://registry-1.docker.io/kavrynt/kavrynt --version 1.0.0-beta.5 \
  -n kavrynt-system --reset-then-reuse-values \
  --set gateway.policy.enabled=true --set gateway.policy.configMap=kavrynt-policy
```

```rego
package kavrynt.authz

default decision := {"allow": false, "reason": "tool not allowed for client"}

decision := {"allow": true} if input.mcp_method != "tools/call"

decision := {"allow": true} if {
	input.client_id == "support-agent"
	input.tool in {"search", "get_ticket"}
}
```

| Input | Value |
| --- | --- |
| `subject`, `client_id`, `issuer`, `scopes` | The verified caller |
| `audience` | `route` when the token is for the route's own audience, `gateway` when it was accepted for the [Gateway audience](#client-authentication) |
| `route.namespace`, `route.name` | The `MCPServer` |
| `http_method`, `mcp_method`, `tool` | What was asked; tool arguments are never part of the input |
| `tool_annotations` | For `tools/call`, the MCP behavior hints the Operator recorded for the tool (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`), absent hints left out; `{}` otherwise |
| `tool_discovered` | Whether the tool is among the server's tools from a successful discovery of its current spec |
| `time` | Request time, RFC 3339, UTC |

**Tool hints are the server's own claims,** so decide on them only for
servers you trust, and write the policy to fail closed: allow on
`tool_discovered` and `readOnlyHint == true`, and treat everything else as
unknown. After a failed discovery every tool has `tool_annotations: {}` and
`tool_discovered: false`, so a rule that only denies
`destructiveHint == true` would let destructive tools through. MCP's default
for an absent `destructiveHint` is `true`.

**Responses and reloads:**

- A denied JSON-RPC request gets `200` with a JSON-RPC error,
  `denied by policy: <reason>`, so MCP client SDKs show the agent the
  reason. Other denied requests get `403`.
- A policy update is picked up within seconds of the kubelet updating the
  mount.
- An update that does not compile is counted, and the previous policy stays
  in force.
- Whoever can edit the ConfigMap controls authorization: restrict it with
  RBAC.

More examples:
[`examples/policy`](https://github.com/kavrynt/kavrynt/tree/main/examples/policy).

**Filtered tool lists.** With `gateway.policy.filterToolsList=true`, a
`tools/list` answer shows each caller only the tools the policy would let it
call. If the filter cannot finish within 500 ms, the caller gets an empty
list.

## Credentials for MCP servers

The caller's token is never passed to an MCP server. A server that needs a
credential declares how it gets one.

**A stored credential** (`spec.credential`), such as an API key:

1. The platform team stores it in the Secret named by
   `global.upstreamCredentials.secretName`:
    - key `<namespace>.<name>`: the value;
    - key `<namespace>.<name>.origin`: the endpoint origin it may be sent to.
2. The Gateway sends it only to that origin. The Operator uses it for tool
   discovery.
3. Without it, calls get `503`.

```yaml
spec:
  credential:
    scheme: Bearer       # or header: X-API-Key
```

**The user's identity** (`spec.tokenExchange`), for servers that check who
the user is:

- For each call, the Gateway exchanges the caller's token at the caller's
  authorization server (OAuth 2.0 Token Exchange, RFC 8693) for one with the
  server's audience, and sends only that.
- The Gateway authenticates as an OAuth client, configured on the trusted
  issuer, with its secret in `gateway.auth.tokenExchangeSecret`.
- Failures answer `502` or `503` and never reach the server.

```yaml
spec:
  tokenExchange:
    audience: https://tickets.example.com
    scopes: [tickets:read]
```

```yaml
gateway:
  auth:
    issuers:
      - issuer: https://login.example.com/realms/agents
        tokenExchange:
          clientID: kavrynt-gateway
          clientSecretKey: client-secret    # key in tokenExchangeSecret
    tokenExchangeSecret: kavrynt-token-exchange
```

Neither the Gateway nor the Operator has RBAC on Secrets: the kubelet mounts
them. Values never appear in responses, status, logs, or metrics.

## Audit events

With `gateway.audit.enabled=true` (on in the production profile), the
Gateway writes one JSON line per MCP request to standard output
(`"type":"kavrynt.audit.v1"`). Each event has:

- the caller, route, method, and tool;
- the decision (`allow`, `deny`, `unauthenticated`, `forbidden`, `invalid`,
  `unavailable`) and the reason;
- the outcome, status, duration, and sizes;
- the policy revision.

Events never contain tool arguments, results, or tokens. Every response
carries the event's `X-Request-Id`.

Events are chained with SHA-256 per Gateway instance, so gaps, reordering,
and edits are detectable:

```bash
kubectl -n kavrynt-system logs -l app.kubernetes.io/name=gateway --prefix=false --tail=-1 \
  | kavryctl audit verify
```

Ship the events out of the cluster with your log pipeline. With a full queue,
the Gateway refuses new MCP requests by default (`503`), so no call is served
without its record.

## Endpoint scope

An `MCPServer` may reach only its own namespace. The Operator reads the
endpoint's host the way cluster DNS resolves it; one that reaches another
namespace keeps the server not `Ready` with `EndpointNotAllowed`, and the
Gateway does not route it. That covers Service names, short names, and,
with `global.endpoints.clusterCIDRs` (your Service and Pod CIDRs), cluster
IP addresses.

```yaml
global:
  endpoints:
    crossNamespace:
      - {from: team-a, to: shared-tools}   # team-a's servers may use shared-tools Services
    clusterCIDRs: [10.96.0.0/12, 10.244.0.0/16]
  tokenExchangeAudiences:
    team-a: [https://tickets.example.com]
```

A token exchange audience must be listed for the server's namespace
(`"*"` for every namespace), or the server is not `Ready`
(`AudienceNotAllowed`) and the Gateway exchanges nothing for it.

The Gateway forwards only `POST`, `GET`, and `DELETE`, to the route's own
path. A server that serves other paths below its endpoint needs
`spec.forwardSubpaths: true`.

**Limitation.** Endpoint scope judges an endpoint by its host name. A
Service in the server's own namespace that forwards elsewhere passes it: an
`ExternalName` Service whose name points at another namespace, or a Service
without a selector whose EndpointSlices list another namespace's pods. Until
the Operator follows such Services, keep namespace owners from creating
`ExternalName` Services and EndpointSlices (with RBAC or an admission
policy), or limit where the Gateway may connect with an egress
NetworkPolicy.

## Keeping traffic on the Gateway

All of the above is skipped by a client that calls an MCP server's Service
directly. Two opt-in NetworkPolicies, which need a CNI that enforces them,
close that path:

- `networkPolicy.mcpServers`: MCP server pods labelled
  `kavrynt.io/gateway-only: "true"` accept traffic only from the Gateway and
  the Operator.
- `networkPolicy.gateway`: limits who can call the Gateway.

## The console login

The web console at `/ui/` has a single `admin` login, on by default, with a
password the chart generates into the Secret
`kavrynt-gateway-console-admin`. It protects the console and the endpoints
it reads. It is not MCP client authentication and never authorizes `/mcp/`
calls.

**Sign-in through your identity provider.** With
`gateway.console.auth.oidc.enabled`, people sign in with your OpenID Connect
provider instead of the shared password, and only the subjects in
`allowedSubjects` or members of `allowedGroups` get a session:

- Register a confidential client whose redirect URL is
  `https://<gateway host>/v1/session/oidc/callback`, and put its secret in
  the Secret named by `gateway.console.auth.oidc.clientSecret`.
- The Gateway uses PKCE, `state`, and `nonce`, and verifies the ID token's
  signature, issuer, times, audience, and nonce. It never keeps, logs, or
  returns the code or any token.
- The admin password stops working unless
  `gateway.console.auth.oidc.keepAdminLogin` keeps it as a break-glass login.
- When people open the console at an address other than loopback, add that
  origin to `gateway.config.allowedOrigins`.

There are no roles within the console.

Sessions are signed cookies, not stored by the Gateway, so **Log out**
removes the cookie from that browser only; a copy keeps working until it
expires (12 hours). Changing the console password ends every session.

Failed logins are limited per client. Behind an Ingress or load balancer,
set `gateway.console.auth.trustedProxies` to the proxies' CIDRs, so failures
count against the client their `X-Forwarded-For` names, not the proxy.
