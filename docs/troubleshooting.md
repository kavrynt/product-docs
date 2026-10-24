# Troubleshooting

## Check the basics

```bash
kubectl config current-context
kubectl get deployments,pods -n kavrynt-system
kubectl get events -n kavrynt-system --sort-by=.lastTimestamp | tail -20
```

## Install or upgrade stops: "MCP client authentication is on by default"

Client authentication is on by default since `1.0.0-beta.1`. Set your
authorization server:

```bash
--set gateway.auth.resourceURL=https://mcp.example.com \
--set-json 'gateway.auth.issuers=[{"issuer":"https://login.example.com/realms/agents"}]'
```

or, for a trial, `--set gateway.auth.enabled=false`.

## Upgrade fails naming `mcpservers.kavrynt.io`

The CRD was installed by `0.0.5-beta.1` or earlier, outside Helm's control.
Run `kavryctl upgrade --version <version> --adopt-crd`, or adopt it with the
steps in
[Upgrading from 0.0.5-beta.1](installation.md#upgrading-from-005-beta1-or-earlier),
then upgrade again.

## Helm cannot pull the chart

```text
Error: ... failed to do request ... registry-1.docker.io
```

- Use Helm 3.14 or newer (`helm version --short`).
- Use the full OCI reference: `oci://registry-1.docker.io/kavrynt/kavrynt`
  with `--version 1.0.0-beta.2`.
- Behind a proxy, set `HTTPS_PROXY` for Helm.

## Pods stuck in `ImagePullBackOff`

```bash
kubectl describe pod -n kavrynt-system -l app.kubernetes.io/name=gateway
```

Nodes must reach `docker.io`. For private mirrors, set
`gateway.image.repository` and `operator.image.repository`.

## Upgraded, but the old images still run

You upgraded with `helm upgrade --reuse-values`, which keeps the previous
chart's image tags, as `kavryctl upgrade` in `1.0.0-beta.1` does. Upgrade
again with `helm upgrade --reset-then-reuse-values`, or with `kavryctl upgrade`
`1.0.0-beta.2` or later.

## `MCPServer` is not `Ready`

```bash
kubectl describe mcpserver <name> -n <namespace>
```

| Reason | Meaning | Fix |
| --- | --- | --- |
| `InvalidSpec` | The spec failed validation | Read the `Accepted` condition message and fix the spec |
| `UnsupportedTransport` | `transport: stdio` | Expected: only `http` servers are routed |
| `NamespaceNotWatched` | The namespace is not in `global.watchNamespaces` | Add the namespace to `global.watchNamespaces`, or move the server |
| No conditions | Operator not running | `kubectl logs -n kavrynt-system deploy/kavrynt-operator` |

## No tools listed (`ToolsDiscovered=False`)

| Reason | Meaning |
| --- | --- |
| `DiscoveryFailed` | The Operator could not list tools; the message says why. `Ready` is unaffected, and the Operator retries |
| `CredentialUnavailable` | The server declares `spec.credential`, and its key or `.origin` pin is missing from the upstream credentials Secret |
| `CallerTokenRequired` | The server uses token exchange, so the Operator, which has no caller, does not list its tools |

## MCP calls answer 401, 403, or 400

| Answer | Meaning |
| --- | --- |
| `401` | No token, or the token is invalid, expired, from an untrusted issuer, or for another route. Its audience must be `<resourceURL>/mcp/<namespace>.<name>` |
| `403 insufficient_scope` | The token lacks a scope in `gateway.auth.requiredScopes` |
| `403` with `denied by policy` | The tool authorization policy denied the call |
| `400` | A token in the query string, or a request that is not well-formed MCP Streamable HTTP (unsupported `MCP-Protocol-Version`, a batch, or headers that disagree with the body); the body says which |
| `503 authorization server keys unavailable` | The Gateway cannot load the issuer's signing keys |

## `kubectl apply` rejects the endpoint

```text
spec.endpoint must be an absolute http or https URL without credentials
```

Use `http://` or `https://`, a host, and no `user:password@`.

## Gateway returns 404 for a route

- Use the namespace-qualified name: `/mcp/<namespace>.<name>`.
- Check the server is `Ready` and listed in `GET /v1/routes`.
- If `global.watchNamespaces` is set, the namespace must be in it. The server's
  `Ready` condition then shows `NamespaceNotWatched`.

## Gateway `/readyz` returns 503

The Gateway has not synced `MCPServer` resources yet, usually an RBAC problem:

```bash
kubectl logs -n kavrynt-system deploy/kavrynt-gateway
kubectl auth can-i list mcpservers.kavrynt.io -A \
  --as=system:serviceaccount:kavrynt-system:kavrynt-gateway
```

## Gateway returns 502 or 503

| Answer | Meaning |
| --- | --- |
| `502 upstream request failed` | The server's endpoint failed or is an address the Gateway refuses (link-local, cloud metadata, loopback) |
| `503 upstream credential unavailable` | The server's stored credential is missing or not pinned to its endpoint |
| `502 token exchange failed`, `503 token exchange unavailable` | The caller's authorization server refused or could not be reached for token exchange |

Test an endpoint from inside the cluster:

```bash
kubectl run curl --rm -it --image=curlimages/curl --restart=Never -- \
  curl -sv <spec.endpoint>
```

## MCP server no longer receives the caller's token

Expected: the Gateway never forwards `Authorization` or `Cookie`. Give the
server its own credential (`spec.credential`), or the caller's exchanged token
(`spec.tokenExchange`). See
[Security](security.md#credentials-for-mcp-servers).
