# Release Notes

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
