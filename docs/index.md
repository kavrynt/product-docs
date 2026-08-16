# Kavrynt Documentation

Kavrynt is a Kubernetes-native control plane for MCP infrastructure.

It helps platform and AI engineering teams deploy, secure, and operate MCP
servers for AI agents across local, self-managed, and managed Kubernetes
clusters.

[Install Kavrynt](installation.md){ .md-button .md-button--primary }
[Read the overview](overview.md){ .md-button }

## What You Can Do Today

- Install the Kavrynt control plane into a Kubernetes cluster with Helm.
- Install `kavryctl` on a developer workstation.
- Register MCP server metadata in Registry.
- Route MCP traffic through Gateway.
- Sync Kubernetes `MCPServer` resources with the Operator.
- Test the full path locally with Kind or on a cloud Kubernetes cluster.

## Core Components

| Component | Purpose |
| --- | --- |
| `kavryctl` | Developer CLI for working with Kavrynt and MCP server records. |
| Registry | Control-plane API and source of truth for MCP server metadata. |
| Gateway | Data-plane entry point for routing MCP traffic. |
| Operator | Kubernetes controller that syncs `MCPServer` resources into Registry. |

## First Install Path

```bash
git clone https://github.com/kavrynt/kavrynt.git
cd kavrynt

helm dependency build charts/kavrynt
helm upgrade --install kavrynt charts/kavrynt \
  --namespace kavrynt-system \
  --create-namespace

kubectl get pods -n kavrynt-system
```

## Where To Go Next

- New users should start with [Overview](overview.md).
- Platform engineers should use [Installation](installation.md).
- Developers testing locally should use [Quickstart](quickstart.md).
- Architecture reviewers should read [System Architecture](architecture.md).

