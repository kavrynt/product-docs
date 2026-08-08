# Kavrynt Product Docs

This repository is the canonical product and engineering documentation
repository for Kavrynt.

Kavrynt is being developed documentation-first. Major product and
architecture work should be traceable from product intent to requirements,
design proposals, implementation designs, contracts, tests, and operational
reviews.

The canonical portable project context is kept at the repository root:
`KAVRYNT-MASTER-CONTEXT.md`.

## Documentation Architecture

The repository uses the following document chain:

```text
Vision
  -> Product Strategy
  -> PRD
  -> RFC
  -> HLD
  -> LLD
  -> API / Data / CRD Contracts
  -> Implementation
  -> Tests
  -> Security Review
  -> Documentation Review
```

## Structure

```text
docs/
├── Vision.md
├── ProductStrategy.md
├── Roadmap.md
├── PRD/
├── RFC/
├── HLD/
├── LLD/
├── API/
├── ADR/
└── Templates/
```

## Document Categories

- `Vision`: why Kavrynt exists and the long-term product direction.
- `ProductStrategy`: target users, strategic priorities, positioning, and
  product constraints.
- `Roadmap`: milestone sequence and maturity path.
- `PRD`: product requirements, user journeys, acceptance criteria, goals, and
  non-goals.
- `RFC`: proposed architecture or product decisions that require review.
- `HLD`: approved high-level system or component architecture.
- `LLD`: implementation-level design for approved components.
- `API`: CLI, service, event, schema, CRD, and configuration contracts.
- `ADR`: durable records of approved decisions.
- `Templates`: required structure for repeatable documentation.

## Status Model

All substantive documents must declare one status:

- `Draft`: actively being written; not approved.
- `Proposed`: ready for human review.
- `In Review`: under active review.
- `Approved`: accepted as the current project direction.
- `Superseded`: replaced by a newer document or decision.
- `Rejected`: reviewed and intentionally not accepted.
- `Deprecated`: previously valid but no longer recommended.

## Numbering

Use stable numeric identifiers once a document becomes more than a note:

- `PRD-0001-Kavrynt-MVP.md`
- `RFC-0001-Documentation-Governance.md`
- `HLD-0001-System-Architecture.md`
- `LLD-0001-Gateway.md`
- `ADR-0001-Record-Architecture-Decision.md`
- `API-0001-CLI-Contract.md`

Do not reuse identifiers after a document is deleted, rejected, or superseded.

## Traceability

Every PRD requirement should have a stable requirement ID. Downstream documents
must reference upstream IDs:

- RFCs reference PRD requirement IDs.
- HLDs reference RFC IDs and requirement IDs.
- LLDs reference HLD and RFC IDs.
- API contracts reference PRD/RFC/HLD IDs.
- ADRs reference the proposal or design that produced the decision.

## Current Foundation Documents

- [Vision](docs/Vision.md)
- [Product Strategy](docs/ProductStrategy.md)
- [Roadmap](docs/Roadmap.md)
- [MVP PRD](docs/PRD/PRD-0001-Kavrynt-MVP.md)
- [Documentation Governance RFC](docs/RFC/RFC-0001-Documentation-Governance.md)
- [MVP System Architecture RFC](docs/RFC/RFC-0002-MVP-System-Architecture.md)
