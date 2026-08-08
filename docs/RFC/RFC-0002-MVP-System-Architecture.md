---
id: RFC-0002
title: MVP System Architecture
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
---

# RFC-0002: MVP System Architecture

## Summary

This RFC proposes a working MVP architecture for Kavrynt based on four
candidate components:

- kavryctl
- Gateway
- Kubernetes Operator
- Registry

The proposal is intentionally draft. It exists to validate component
boundaries, identify open questions, and determine the smallest implementable
slice that satisfies `PRD-0001`.

## Context

Kavrynt aims to provide production-oriented infrastructure for MCP servers and
AI agents. The first MVP should focus on MCP infrastructure and a narrow
end-to-end workflow.

The current working journey is:

```text
Register
  -> Deploy
  -> Secure
  -> Authenticate
  -> Authorize
  -> Apply Policy
  -> Observe
  -> Version
  -> Upgrade / Rollback
```

This RFC does not approve all of that functionality for immediate
implementation. It proposes architectural boundaries for review.

## Goals

- Map candidate components to MVP requirements.
- Define initial component responsibilities and non-responsibilities.
- Identify control-plane and data-plane boundaries.
- Identify security and observability questions.
- Determine which HLDs, LLDs, API contracts, and ADRs are needed next.

## Non-Goals

- Finalizing APIs or schemas.
- Choosing implementation languages.
- Choosing a persistence database.
- Approving Kubernetes CRDs.
- Defining a hosted cloud product.
- Starting implementation.

## Requirements Traceability

| Requirement | Architecture Concern |
| --- | --- |
| REQ-MVP-001 | Registry metadata and registration workflow |
| REQ-MVP-002 | Registry discovery behavior |
| REQ-MVP-003 | Gateway access path |
| REQ-MVP-004 | kavryctl developer workflow |
| REQ-MVP-005 | Registry and/or Operator lifecycle states |
| REQ-MVP-006 | Registry version metadata |
| REQ-MVP-007 | Operator and Registry upgrade/rollback semantics |
| REQ-MVP-008 | Gateway, CLI, and control-plane identity model |
| REQ-MVP-009 | Gateway policy enforcement and policy storage |
| REQ-MVP-010 | Gateway, Registry, Operator health and telemetry |
| REQ-MVP-011 | Local validation topology |
| REQ-MVP-012 | Runtime environment boundaries |

## Proposed Component Model

```text
Developer / Operator
        |
        v
    kavryctl
        |
        v
    Registry <----> Kubernetes Operator
        |
        v
     Gateway
        |
        v
   MCP Server Workloads
```

This diagram is conceptual. Actual request flow, persistence, authentication,
and deployment topology require HLD and contract documents.

## Component Responsibilities

| Component | Proposed Responsibilities | Non-Responsibilities |
| --- | --- | --- |
| kavryctl | Local developer/operator interface; registration commands; status commands; validation workflows | Long-running control plane; policy engine; persistent source of truth |
| Registry | Source of truth for MCP server metadata, versions, lifecycle state, and discovery | Runtime traffic proxying; Kubernetes reconciliation unless explicitly designed |
| Gateway | Controlled runtime access path to MCP servers; enforcement point for authn/authz/policy if approved | Owning registry metadata; deploying workloads |
| Kubernetes Operator | Reconcile approved Kavrynt resources into Kubernetes runtime state if Kubernetes is required | Public API gateway; product registry source of truth |

## Control Plane and Data Plane

Working distinction:

- Control plane: kavryctl, Registry, and possibly Operator reconciliation.
- Data plane: Gateway and MCP server runtime traffic.

Open question: whether the Registry directly controls Gateway config, whether
the Operator configures Gateway, or whether both consume a shared contract.

## Deployment Model Options

### Option A: Local-First Without Kubernetes

Kavrynt runs locally with kavryctl, a local Registry, Gateway, and sample MCP
server.

Benefits:

- Fastest developer validation.
- Avoids premature Kubernetes complexity.

Drawbacks:

- Does not validate Operator value.
- Less representative of production infrastructure.

### Option B: Kubernetes-First MVP

Kavrynt requires Kubernetes for the first end-to-end workflow.

Benefits:

- Aligns with cloud-native infrastructure direction.
- Validates Operator and deployment lifecycle early.

Drawbacks:

- Higher local setup cost.
- Risks making the first MVP too heavy.

### Option C: Local-First With Kubernetes Path

Kavrynt supports a local validation workflow first, while architecture keeps a
clear Kubernetes deployment path.

Benefits:

- Preserves developer experience.
- Allows Operator design to be justified through requirements.

Drawbacks:

- Requires careful boundary design to avoid two incompatible models.

Current proposal: evaluate Option C for the first implementable slice.

## Security Considerations

Security model is not approved yet. The architecture must define:

- CLI identity and credentials.
- Gateway authentication.
- Authorization checks for MCP server and tool access.
- Policy storage and enforcement point.
- Secrets handling.
- Audit events.
- Kubernetes RBAC and service accounts if Kubernetes is used.
- Supply-chain and container image expectations.

No implementation should claim these controls until they are designed and
verified.

## Observability Considerations

Each component should define:

- Health endpoint or health command.
- Structured logs.
- Metrics where useful.
- Diagnostic status output.
- Failure signals.
- Audit events where security decisions occur.

For MVP, minimum observability should include operator-visible health and
request/failure information for the Gateway and Registry.

## State and Persistence

Open state categories:

- Registered MCP server metadata.
- Version metadata.
- Lifecycle state.
- Policy bindings.
- Deployment status.
- Audit events.

Open question: which state must be durable in MVP, and what storage backend is
acceptable for the first implementation.

## Required Follow-Up Documents

- `HLD-0001-System-Architecture.md`
- `HLD-0002-Registry.md`
- `HLD-0003-Gateway.md`
- `HLD-0004-kavryctl.md`
- `HLD-0005-Kubernetes-Operator.md` if Operator remains in MVP scope.
- `API-0001-kavryctl-CLI-Contract.md`
- `API-0002-Registry-Contract.md`
- `API-0003-Gateway-Contract.md`
- Security review for the approved MVP slice.

These should be created only after this RFC is reviewed.

## Alternatives Considered

| Alternative | Benefits | Drawbacks | Decision |
| --- | --- | --- | --- |
| CLI-only MVP | Very small scope | Does not prove infrastructure/control-plane value | Not selected yet |
| Gateway + Registry only | Validates core access and discovery | Delays deployment lifecycle | Candidate |
| Full four-component MVP | Exercises long-term architecture | May be too large for first slice | Risky |
| Kubernetes-only MVP | Strong cloud-native signal | Higher setup cost and possible premature complexity | Open |

## Proposed Next Step

Select the first implementable slice:

```text
kavryctl register
  -> Registry stores MCP server metadata
  -> Gateway exposes controlled access
  -> health/status is observable
```

Then decide whether deployment is:

- local process based,
- Docker based,
- Kubernetes based,
- or deferred until the next slice.

## Open Questions

- Is the Registry a service, a file-backed local store, a Kubernetes resource,
  or some combination for MVP?
- Does Gateway enforce policy in MVP or only provide controlled routing first?
- What does authentication mean for the local MVP?
- Does kavryctl talk directly to Registry, Kubernetes, or both?
- Are Kubernetes CRDs required in the first MVP?
- What is the minimum viable audit model?
- What sample MCP server should be used for validation?
- What compatibility promise is made for early API/CLI contracts?
