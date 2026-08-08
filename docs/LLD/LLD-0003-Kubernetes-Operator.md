---
id: LLD-0003
title: Kubernetes Operator Low-Level Design
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - HLD-0002
  - HLD-0004
---

# LLD-0003: Kubernetes Operator Low-Level Design

## Summary

The Operator is a Kubernetes controller that reconciles Kavrynt custom
resources into Deployments, Services, Gateway route configuration, and status
conditions.

## Runtime Modules

```text
operator/
  cmd/operator
  api/v1alpha1
  internal/controller/mcpserver
  internal/render
  internal/status
  internal/gatewayconfig
  internal/metrics
```

## Candidate CRD: MCPServer

Proposed spec:

- name,
- image or endpoint,
- transport,
- version,
- port,
- env references,
- resource requirements,
- policy reference,
- gateway exposure settings.

Proposed status:

- observed generation,
- phase,
- conditions,
- selected version,
- workload name,
- service name,
- gateway route name,
- last error.

## Reconciliation Flow

```text
watch MCPServer
  -> validate spec
  -> render Deployment
  -> render Service
  -> render Gateway route/config
  -> apply resources
  -> update status conditions
  -> emit event on failure
```

## Status Conditions

Proposed:

- `Accepted`
- `WorkloadReady`
- `ServiceReady`
- `GatewayRouteReady`
- `Degraded`

## RBAC Scope

Operator should access only:

- Kavrynt CRDs,
- Deployments it owns,
- Services it owns,
- ConfigMaps or route resources it owns,
- Events,
- status subresources.

## Failure Handling

Failures should be visible through:

- status conditions,
- Kubernetes events,
- operator logs,
- metrics.

## Tests

- CRD validation tests,
- reconcile create/update/delete tests,
- owner reference tests,
- status condition tests,
- RBAC manifest review,
- Helm/kustomize render tests.

## Open Questions

- Which CRDs ship first?
- Should Operator call Registry API or rely only on Kubernetes resources?
- How does Operator publish observed status back to Registry?
- Is Gateway config a ConfigMap, CRD, or Gateway API resource?
