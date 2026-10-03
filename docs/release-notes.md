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
- Images and the chart are built from one release, scanned with Trivy, and
  signed with Cosign.

**Upgrade**: see [Upgrade to 0.0.2-beta.1](upgrade.md).

**Known limitations**: see [Overview](overview.md#current-limitations).

## 0.0.1-beta.1

First trial definition with Registry, Gateway, and Operator. Superseded by
`0.0.2-beta.1`.
