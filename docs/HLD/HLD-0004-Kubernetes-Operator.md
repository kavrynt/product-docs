---
id: HLD-0004
title: Kubernetes Operator High-Level Design
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
  - RFC-0002
  - HLD-0002
---

# HLD-0004: Kubernetes Operator High-Level Design

## Summary

The Kubernetes Operator reconciles Kavrynt desired state into Kubernetes
runtime resources.

It lets platform teams run MCP server workloads in Kubernetes with a standard
lifecycle model instead of hand-writing deployments, services, gateway routes,
labels, security context, and status tracking for every MCP server.

## Responsibilities

- Watch Kavrynt custom resources.
- Reconcile MCP server workloads.
- Create or update Kubernetes Deployment/Service resources.
- Configure Gateway route resources or config.
- Report observed status.
- Emit Kubernetes events for failures.
- Apply secure defaults.

## Non-Responsibilities

- Acting as the source of truth for product metadata.
- Proxying MCP traffic.
- Implementing user-facing CLI behavior.
- Storing long-term audit history.

## Architecture

```text
Kavrynt Custom Resource
        |
        v
 Kubernetes Operator
        |
        +--> Deployment
        +--> Service
        +--> Gateway route/config
        +--> Status conditions
```

## Candidate Custom Resources

These are proposed, not approved:

- `MCPServer`: desired server runtime state.
- `MCPServerVersion`: version-specific image/endpoint metadata.
- `MCPPolicyBinding`: policy reference attached to server/tool access.
- `GatewayRoute`: route from Gateway to MCP server service.

The MVP should start with the smallest CRD set that supports one workflow.

## Interactions

| Component | Interaction |
| --- | --- |
| `kavryctl` | Applies or updates custom resources for deploy/status workflows |
| Registry | Supplies desired metadata; receives observed status if remote Registry exists |
| Gateway | Receives route config produced by Operator |
| Kubernetes API | Source of observed runtime state |

## Security Boundaries

Operator should use least-privilege RBAC.

It should only access:

- Kavrynt custom resources,
- workloads it manages,
- services it manages,
- route/config resources it manages,
- events/status updates.

Workloads should use secure defaults:

- non-root containers,
- read-only root filesystem where possible,
- resource requests/limits,
- explicit service account,
- probes,
- labels and owner references.

## Observability

Operator should expose:

- reconciliation count,
- reconciliation errors,
- reconciliation duration,
- managed resource count,
- status conditions,
- Kubernetes events.

## Open Questions

- Which CRDs are required for MVP?
- Does Operator sync from Registry API, Kubernetes CRDs, or both?
- How are Gateway routes represented?
- How are secrets mounted or referenced?
- How does rollback work?
