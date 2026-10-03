# kavryctl CLI Reference

`kavryctl` manages `MCPServer` resources through your kubeconfig. Everything it
does can also be done with `kubectl`.

!!! note "Availability"
    During the beta, `kavryctl` binaries are provided with trial access. All
    guides on this site work with `kubectl` alone.

## Cluster flags

| Flag | Purpose |
| --- | --- |
| `--kubeconfig PATH` | Kubeconfig file (default: `KUBECONFIG` or `~/.kube/config`) |
| `--context NAME` | Kubeconfig context |
| `-n`, `--namespace NS` | Namespace (default: manifest namespace, then the context namespace) |

## Commands

```bash
kavryctl version
kavryctl validate server.yaml               # offline, YAML or JSON
kavryctl register -n team-a server.yaml     # create or update
kavryctl list -A                            # all namespaces
kavryctl inspect -n team-a payments         # full resource as JSON
kavryctl unregister -n team-a payments
```

Example `list` output:

```text
NAMESPACE  NAME      VERSION  TRANSPORT  READY  ROUTE                AGE
team-a     payments  1.0.0    http       True   /mcp/team-a.payments  2m
```

Exit codes: `0` success, `1` operation failed, `2` usage error.
