# kavryctl

`kavryctl` is the Kavrynt developer CLI.

For the current commercial trial path, developers can evaluate Kavrynt with
container images only. `kavryctl` remains part of the product roadmap, but the
public documentation no longer requires source access or a CLI install.

## Responsibilities

- Register MCP server records.
- Unregister MCP server records.
- List known server records.
- Inspect server metadata.
- Help test a Kavrynt install.

## Availability

Kavrynt will distribute `kavryctl` through approved commercial release channels
when it is included in the trial package. Until then, use the
[Trial Images on Kind](../trial-images-kind.md) runbook.

## How It Connects

`kavryctl` talks to Registry over HTTP.

For local cluster testing, use port-forwarding:

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-registry 18081:8080
```

Then point `kavryctl` at:

```text
http://127.0.0.1:18081
```
