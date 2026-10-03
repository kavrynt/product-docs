# Kavrynt Documentation

Kavrynt is a Kubernetes-native control plane for MCP infrastructure. It gives
platform teams one consistent way to register, discover, and route Model
Context Protocol (MCP) servers for AI agents, on any Kubernetes cluster.

[Quickstart on Kind](quickstart.md){ .md-button .md-button--primary }
[Read the overview](overview.md){ .md-button }

## What works today (`0.0.2-beta.1`)

- Declare MCP servers as Kubernetes `MCPServer` resources, validated by the API
  server and the Operator.
- Route MCP traffic through one Gateway at `/mcp/<namespace>.<name>`.
- Gateway never forwards caller credentials (`Authorization`, `Cookie`) to MCP
  servers.
- Install with one Helm chart from signed, multi-architecture images.

## Components

| Component | Purpose |
| --- | --- |
| Operator | Validates `MCPServer` resources and reports `Accepted` and `Ready`. |
| Gateway | Watches `Ready` servers and proxies MCP traffic to them. |
| `kavryctl` | CLI to validate, register, list, inspect, and remove `MCPServer` resources. |
| Helm chart | Installs the CRD, Operator, and Gateway. |

## Try it

```bash
kind create cluster --name kavrynt-trial
helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
  --version 0.0.2-beta.1 --namespace kavrynt-system --create-namespace --wait
```

Continue with the [Quickstart](quickstart.md).

## Where to go next

- Evaluating Kavrynt: [Overview](overview.md)
- Installing on a real cluster: [Install on Kubernetes](installation.md)
- Upgrading from `0.0.1-beta.1`: [Upgrade](upgrade.md)
- Reviewing the design: [System Architecture](architecture.md)
