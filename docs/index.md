# Kavrynt Documentation

Kavrynt is a Kubernetes-native control plane for MCP infrastructure.

It helps platform and AI engineering teams deploy, secure, and operate MCP
servers for AI agents across local, self-managed, and managed Kubernetes
clusters.

[Try Kavrynt](trial-images-kind.md){ .md-button .md-button--primary }
[Read the overview](overview.md){ .md-button }

## What You Can Do Today

- Run Kavrynt trial images in a Kubernetes cluster.
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

## How to try Kavrynt

```bash
export KAVRYNT_IMAGE_REGISTRY=docker.io/kavrynt
export KAVRYNT_IMAGE_TAG=0.0.1-beta

kind create cluster --name kavrynt-dev
kubectl create namespace kavrynt-system
docker pull "$KAVRYNT_IMAGE_REGISTRY/registry:$KAVRYNT_IMAGE_TAG"
```

Continue with [Kavrynt Images on Kind](trial-images-kind.md).

## Where To Go Next

- New users should start with [Overview](overview.md).
- Platform engineers should use [Installation](installation.md).
- Developers testing locally should use [Images on Kind](trial-images-kind.md).
- Architecture reviewers should read [System Architecture](architecture.md).
