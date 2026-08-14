---
id: ROADMAP-0001
title: Kavrynt Roadmap
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-14
reviewers: []
related:
  - VISION-0001
  - STRATEGY-0001
  - PRD-0001
---

# Kavrynt Roadmap

This roadmap is a planning document, not an implementation commitment.

## M001 - Product and Architecture Foundation

Status: In Progress

Outcome:

- Documentation architecture is established.
- Product vision and strategy are reconciled.
- MVP PRD is drafted and reviewed.
- Documentation governance RFC is reviewed.
- MVP system architecture RFC is drafted and reviewed.
- Major product and architecture questions are tracked.
- Implementation has started in the public monorepo.
- Remaining foundation work is to reconcile API contracts, security review, and
  release compatibility with the implemented MVP baseline.

## M002 - First Implementable MVP Slice

Status: In Progress

Outcome:

- One narrow MVP workflow is selected.
- Relevant HLD, LLD, API/contract, and security review documents exist.
- Implementation repository is selected.
- Tests and validation plan are defined before coding.
- `kavryctl`, Registry, Gateway, Operator, and umbrella Helm chart exist in the
  public monorepo.
- CI validates Go checks, Docker builds, vulnerability scanning, and Helm
  rendering.

Candidate workflow:

```text
Register a sample MCP server
  -> deploy or connect it through Kavrynt
  -> expose it through a controlled gateway
  -> observe health and basic runtime signals
```

## M003 - MVP Lifecycle Management

Status: Not Started

Outcome:

- Versioning model is defined.
- Upgrade and rollback behavior is documented and implemented.
- Registry lifecycle semantics are validated.
- Operator responsibilities are validated if Kubernetes is part of the approved
  MVP.

## M004 - Security and Governance Baseline

Status: Not Started

Outcome:

- Authentication and authorization model is approved.
- Tool access policy model is approved.
- Audit event model is approved.
- Secure defaults and least-privilege deployment guidance are defined.

## M005 - Production Readiness

Status: Not Started

Outcome:

- Observability model is implemented.
- Operational runbooks exist.
- Failure and recovery workflows are tested.
- Release and compatibility process is defined.

## M006 - Public Alpha Distribution

Status: In Progress

Outcome:

- `kavryctl` is published as Linux, macOS, and Windows release binaries.
- CLI installer verifies checksums before installation.
- Registry, Gateway, and Operator images are published with versioned tags.
- The `charts/kavrynt` umbrella chart is published as an OCI Helm chart.
- Website quickstart points to the current install path and clearly separates
  current source-based testing from tagged-release installation.

## Future Direction

Potential later milestones:

- Multi-protocol AI workload support.
- Enterprise governance and policy.
- Hosted or managed offerings, if approved.
- Public ecosystem and integration model.

## Current Roadmap Risks

- MVP scope may be too broad unless the first workflow is narrowed.
- Kubernetes may be over- or under-weighted without explicit requirements.
- Security model may affect every component boundary.
- Registry ownership and persistence model are unresolved.
