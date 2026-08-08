# AGENTS.md

This repository contains the canonical product and engineering documentation
for Kavrynt.

## Project Context

Kavrynt is an open-source AI infrastructure platform for running and operating
AI agents and MCP servers in production. MCP is the starting protocol, not the
final boundary of the product.

The current MVP direction is intentionally constrained around:

- kavryctl
- Gateway
- Kubernetes Operator
- Registry

These component names are working direction. Their exact boundaries,
interfaces, and implementation responsibilities must be validated through PRD,
RFC, HLD, LLD, and contract documents before implementation.

## Working Rules

1. Treat project context as guidance, not as an unquestionable specification.
2. Clearly distinguish confirmed decisions, assumptions, proposals, and open
   questions.
3. Do not invent product requirements, APIs, component boundaries, protocols,
   data models, or implementation details.
4. Use documentation-first development:
   Vision -> Product Strategy -> PRD -> RFC -> HLD -> LLD -> Contracts ->
   Implementation -> Tests -> Security Review.
5. Do not create ADRs just to populate the repository. ADRs record meaningful
   approved decisions.
6. Do not begin implementation from this repository. Implementation belongs in
   the appropriate code repository after the relevant docs are approved.
7. Preserve existing user work. Do not delete, reset, overwrite, or force-push
   changes without explicit approval.
8. Keep changes focused on the requested documentation scope.
9. Before completing a change, run a repo status check and review the final
   diff.

## Document Status

Use one of these status values in substantive documents:

- Draft
- Proposed
- In Review
- Approved
- Superseded
- Rejected
- Deprecated

Draft and Proposed documents are not implementation approval.

## Required Front Matter

Use this metadata block at the top of substantive documents:

```markdown
---
id: TYPE-0000
title: Document Title
status: Draft
owner: Kavrynt Maintainers
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
related: []
---
```

## Traceability

Use stable IDs for requirements and decisions.

Examples:

- `REQ-MVP-001`
- `NFR-MVP-001`
- `RFC-0002`
- `ADR-0001`

When creating or editing design documents, link back to the upstream PRD,
RFC, HLD, or ADR that justifies the work.

## Product Scope Discipline

Do not silently expand Kavrynt into a general AI coding assistant, chatbot,
documentation generator, cloud automation tool, marketplace, or hosted SaaS
unless those directions are explicitly approved in product documents.

## Security Discipline

Security is a first-class design concern. Do not claim security controls exist
until they are documented, implemented, and verified.

Security-sensitive docs should address identity, authentication,
authorization, secrets, audit logging, supply-chain security, deployment
security, least privilege, and operational visibility where relevant.

## Validation

For documentation-only changes, at minimum run:

```bash
git status --short
git diff --stat
```

Also review the changed Markdown files for broken links, stale statuses,
incorrect numbering, and accidental implementation claims.
