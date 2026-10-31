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

## Tool authorization policy

Open Policy Agent, embedded in the Gateway, evaluates your Rego policy before
every MCP request is forwarded. The policy comes from a ConfigMap of `.rego`
files and must define `data.kavrynt.authz.decision`. Only
`{"allow": true}` allows; anything else denies, including an error or an
evaluation over 100 ms.

```bash
kubectl -n kavrynt-system create configmap kavrynt-policy --from-file=authz.rego
helm upgrade kavrynt oci://registry-1.docker.io/kavrynt/kavrynt --version 1.0.0-beta.3 \
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

- A denied call gets `403` with a JSON-RPC error,
  `denied by policy: <reason>`.
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

Failed logins are limited per client. Behind an Ingress or load balancer,
set `gateway.console.auth.trustedProxies` to the proxies' CIDRs, so failures
count against the client their `X-Forwarded-For` names, not the proxy.
