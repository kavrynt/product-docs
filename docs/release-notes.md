# Release Notes

## 0.0.3-beta.1

Beta for evaluation in trusted clusters.

**Added**

- MCP traffic metrics on the Gateway's `/metrics` endpoint: requests,
  outcomes, latency, and bytes per route, method, and tool. Metadata only; tool
  arguments and results are never recorded. See
  [Gateway](components/gateway.md#mcp-traffic-metrics).
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
- Images are scanned with Trivy and signed with Cosign (keyless). The chart is
  published from the same release; it is not signed.

**Known limitations**: see [Overview](overview.md#current-limitations).

## 0.0.1-beta.1

Internal trial build with a separate Registry service. It was not published;
`0.0.2-beta.1` is the first public beta.
