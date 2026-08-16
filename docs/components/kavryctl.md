# kavryctl

`kavryctl` is the Kavrynt developer CLI.

It is the first tool a developer installs on a laptop or workstation.

## Responsibilities

- Register MCP server records.
- Unregister MCP server records.
- List known server records.
- Inspect server metadata.
- Help test a Kavrynt install.

## Install

Release path:

```bash
curl -fsSL https://kavrynt.com/install.sh | sh
export PATH="$HOME/.kavrynt/bin:$PATH"
kavryctl version
```

Source fallback:

```bash
git clone https://github.com/kavrynt/kavrynt.git
cd kavrynt
go install ./cmd/kavryctl
```

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

