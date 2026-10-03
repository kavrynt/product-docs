# Troubleshooting

## Check the basics

```bash
kubectl config current-context
kubectl get deployments,pods -n kavrynt-system
kubectl get events -n kavrynt-system --sort-by=.lastTimestamp | tail -20
```

## Helm cannot pull the chart

```text
Error: ... failed to do request ... registry-1.docker.io
```

- Use Helm 3.8 or newer (`helm version --short`).
- Use the full OCI reference: `oci://registry-1.docker.io/kavrynt/kavrynt`
  with `--version 0.0.2-beta.1`.
- Behind a proxy, set `HTTPS_PROXY` for Helm.

## Pods stuck in `ImagePullBackOff`

```bash
kubectl describe pod -n kavrynt-system -l app.kubernetes.io/name=gateway
```

Nodes must reach `docker.io`. For private mirrors, set
`gateway.image.repository` and `operator.image.repository`.

## `MCPServer` is not `Ready`

```bash
kubectl describe mcpserver <name> -n <namespace>
```

| Reason | Meaning | Fix |
| --- | --- | --- |
| `InvalidSpec` | The spec failed validation | Read the `Accepted` condition message and fix the spec |
| `UnsupportedTransport` | `transport: stdio` | Expected: only `http` servers are routed |
| No conditions | Operator not running | `kubectl logs -n kavrynt-system deploy/kavrynt-operator` |

## `kubectl apply` rejects the endpoint

```text
spec.endpoint must be an absolute http or https URL without credentials
```

Use `http://` or `https://`, a host, and no `user:password@`.

## Gateway returns 404 for a route

- Use the namespace-qualified name: `/mcp/<namespace>.<name>`.
- Check the server is `Ready` and listed in `GET /v1/routes`.
- If `gateway.config.watchNamespaces` is set, the namespace must be in it.

## Gateway `/readyz` returns 503

The Gateway has not synced `MCPServer` resources yet, usually an RBAC problem:

```bash
kubectl logs -n kavrynt-system deploy/kavrynt-gateway
kubectl auth can-i list mcpservers.kavrynt.io -A \
  --as=system:serviceaccount:kavrynt-system:kavrynt-gateway
```

## Gateway returns 502

The upstream endpoint failed. Test it from inside the cluster:

```bash
kubectl run curl --rm -it --image=curlimages/curl --restart=Never -- \
  curl -sv <spec.endpoint>
```

## MCP server no longer receives the caller's token

Expected since `0.0.2-beta.1`: the Gateway never forwards `Authorization` or
`Cookie`. Give the MCP server its own credentials.
