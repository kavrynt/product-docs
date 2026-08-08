# Kavrynt Prompt Library

This directory stores reusable prompts for Kavrynt product, architecture,
documentation, review, and implementation workflows.

Use these prompts to keep Codex and other AI agents aligned with Kavrynt's
documentation-first development model.

## Operating Rules

Before using any prompt in this repository:

1. Open `product-docs` directly when working on product documentation.
2. Read `AGENTS.md`.
3. Read the relevant product and architecture documents.
4. Distinguish confirmed facts, assumptions, proposals, and open questions.
5. Do not start implementation unless the required PRD, RFC, HLD, LLD, API or
   contract, and security review path exists.
6. Do not treat draft documents as approved implementation direction.
7. Preserve existing user changes.

## Prompt Index

- [Repository Exploration](#repository-exploration)
- [Documentation Architecture Review](#documentation-architecture-review)
- [Product Definition](#product-definition)
- [PRD Drafting](#prd-drafting)
- [RFC Drafting](#rfc-drafting)
- [HLD Drafting](#hld-drafting)
- [LLD Drafting](#lld-drafting)
- [API and Contract Drafting](#api-and-contract-drafting)
- [Security Review](#security-review)
- [Documentation Consistency Review](#documentation-consistency-review)
- [Implementation Planning](#implementation-planning)
- [Diff Review](#diff-review)

## Repository Exploration

```text
You are joining the Kavrynt project as a principal product architect and
software architect.

Do not modify any files.

Read AGENTS.md, README.md, Vision.md, ProductStrategy.md, Roadmap.md, and the
relevant PRD/RFC/HLD/LLD/API documents.

Inspect the repository structure and summarize:
1. confirmed facts
2. assumptions
3. existing documents
4. placeholder documents
5. contradictions
6. missing documentation
7. risks
8. open questions
9. recommended next smallest useful step
```

## Documentation Architecture Review

```text
Review the current product-docs documentation architecture.

Do not modify files.

Evaluate:
1. directory structure
2. document categories
3. naming conventions
4. numbering conventions
5. lifecycle/status model
6. traceability model
7. review/approval process
8. templates
9. gaps
10. risks
11. contradictions

Return findings ranked by importance and propose focused improvements.
```

## Product Definition

```text
Help refine Kavrynt's product definition.

Do not invent final product strategy. Clearly separate confirmed facts,
assumptions, proposals, and open questions.

Use the current Vision, ProductStrategy, Roadmap, and PRD documents as context.

Analyze:
1. core problem
2. primary user
3. first compelling workflow
4. MVP scope
5. non-goals
6. differentiation
7. success metrics
8. product risks
9. questions requiring human decision
```

## PRD Drafting

```text
Draft or update a Kavrynt PRD.

Use docs/Templates/PRD.md as the structure.

Requirements:
- Use stable requirement IDs.
- Include goals and non-goals.
- Include personas and user journeys.
- Include functional and non-functional requirements.
- Include acceptance criteria.
- Include risks and open questions.
- Do not approve implementation.
- Do not introduce architecture decisions that belong in an RFC or HLD.
```

## RFC Drafting

```text
Draft or update a Kavrynt RFC.

Use docs/Templates/RFC.md as the structure.

Requirements:
- Reference upstream PRD requirement IDs.
- Explain context, goals, non-goals, proposal, alternatives, and tradeoffs.
- Include security and operational considerations.
- Identify follow-up HLD, LLD, API/contract, ADR, and security review work.
- Keep the RFC in Draft or Proposed status unless explicitly approved.
```

## HLD Drafting

```text
Draft or update a Kavrynt HLD.

Use docs/Templates/HLD.md as the structure.

Requirements:
- Reference upstream PRD and RFC IDs.
- Describe components, responsibilities, boundaries, interactions, data flows,
  deployment topology, security boundaries, observability, reliability, scaling,
  failure behavior, and open questions.
- Do not include implementation-level module details that belong in an LLD.
```

## LLD Drafting

```text
Draft or update a Kavrynt LLD.

Use docs/Templates/LLD.md as the structure.

Requirements:
- Reference upstream PRD, RFC, and HLD IDs.
- Describe modules, interfaces, data models, configuration, error handling,
  lifecycle states, tests, and operational behavior.
- Do not start implementation from the LLD unless the user explicitly approves
  the implementation step.
```

## API and Contract Drafting

```text
Draft or update a Kavrynt API/contract document.

Use docs/Templates/API.md as the structure.

Requirements:
- Reference upstream PRD, RFC, and HLD IDs.
- State the contract type: CLI, REST, gRPC, event, webhook, Kubernetes CRD,
  configuration schema, or data schema.
- Define versioning, compatibility, authentication, authorization, schema,
  errors, and examples.
- Do not choose REST, gRPC, or CRDs by default. Justify the contract type.
```

## Security Review

```text
Perform a Kavrynt security review.

Use docs/Templates/SecurityReview.md as the structure.

Review:
1. assets
2. trust boundaries
3. authentication
4. authorization
5. secrets
6. auditability
7. supply chain
8. deployment security
9. Kubernetes RBAC and security context if applicable
10. threats, mitigations, required fixes, and residual risks

Do not claim a security control exists unless it is documented, implemented,
and verified.
```

## Documentation Consistency Review

```text
Review Kavrynt documentation for consistency.

Do not modify files.

Check:
1. stale product positioning
2. conflicts between Vision, Strategy, PRD, RFC, HLD, LLD, API, and ADR docs
3. missing requirement traceability
4. incorrect statuses
5. broken links
6. unapproved implementation claims
7. security claims without design evidence
8. open questions that block implementation

Return findings ordered by severity with file references.
```

## Implementation Planning

```text
Create an implementation plan for the approved Kavrynt scope.

Do not modify files.

First verify that the relevant PRD, RFC, HLD, LLD, API/contract, and security
review documents exist or identify what is missing.

Include:
1. repository to change
2. files likely affected
3. requirements implemented
4. architecture impact
5. security impact
6. tests
7. validation commands
8. rollout
9. rollback
10. unresolved blockers
```

## Diff Review

```text
Review the current git diff as a principal engineer.

Do not modify files.

Prioritize:
1. correctness
2. product consistency
3. architecture consistency
4. security
5. reliability
6. maintainability
7. traceability
8. test and validation gaps

Return findings first, ordered by severity, with file and line references.
If there are no issues, say that clearly and list residual risks.
```
