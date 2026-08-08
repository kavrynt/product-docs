# KAVRYNT --- MASTER PROJECT CONTEXT

**Document:** `KAVRYNT-MASTER-CONTEXT.md`\
**Purpose:** Portable project context for ChatGPT, Codex CLI, VS Code
Codex, and future contributors.\
**Status:** Master project context / product + architecture baseline\
**Last updated:** 2026-08-08

------------------------------------------------------------------------

## 2. IMPORTANT INSTRUCTIONS FOR ANY AI/AGENT READING THIS FILE

You are joining the **Kavrynt** project.

This document is the portable context for the project. Read it
completely before proposing architecture, creating documentation, or
writing implementation code.

### MVP
1. What Kavrynt is
Kavrynt is an open-source AI infrastructure platform for running and operating AI agents and MCP servers in production.
2. The problem
Organizations can build MCP servers and AI agents, but production operation becomes fragmented:

- deployment
- authentication/authorization
- discovery
- lifecycle management
- versioning
- observability
- governance
- tool-access policies
- GitOps
- security

Kavrynt is intended to provide the infrastructure/control-plane layer around those workloads.

3. Where we start
The MVP is deliberately constrained to:

             KAVRYNT MVP

        ┌─────────────────────┐
        │                     │
      kavryctl              Gateway
        │                     │
        └──────────┬──────────┘
                   │
          Kubernetes Operator
                   │
                Registry



The four MVP components are:
kavryctl
Gateway
Kubernetes Operator
Registry
And importantly, the document says their exact architecture is not yet approved.
4. The first real user experience
A developer should eventually be able to take an MCP server and have Kavrynt:

Register
   ↓
Deploy
   ↓
Secure
   ↓
Authenticate
   ↓
Authorize
   ↓
Apply policy
   ↓
Observe
   ↓
Version
   ↓
Upgrade / rollback

5. How Kavrynt evolves
I've now documented the strategic evolution:

MCP Infrastructure
       ↓
Production MCP Platform
       ↓
AI Infrastructure Platform
       ↓
Multi-Protocol AI Platform
       ↓
Enterprise AI Control Plane

6. Long-term goal
The central long-term idea is now explicitly documented:
Kavrynt aims to become a Kubernetes-like infrastructure/control plane for the AI era.
Not a Kubernetes replacement, and not an LLM framework.
Rather, something that provides a common operational model for AI agents, MCP servers, tools and eventually other AI infrastructure.

             WHAT WE KNOW
                  │
                  ▼
       Open-source AI infrastructure
       MCP is our starting protocol
       4-component MVP
                  │
                  ▼
          WHAT WE NEED TO DESIGN
                  │
                  ▼
       Exact product requirements
       Architecture
       Component boundaries
       APIs
       Security model
       Data model
                  │
                  ▼
             WHAT WE AIM FOR
                  │
                  ▼
      Enterprise AI Control Plane

### Core rules

1.  Treat this document as project context, not as an unquestionable
    specification.
2.  Distinguish clearly between:
    -   confirmed decisions
    -   current working assumptions
    -   proposals
    -   open questions
3.  Do not invent product requirements, architecture decisions, APIs,
    technologies, or implementation details.
4.  Before making major architectural decisions, inspect the existing
    documentation and repository state.
5.  Prefer documentation-first development: **Vision → Product Strategy
    → PRD → RFC → HLD → LLD → API/Data Contracts → Implementation →
    Tests → Security Review → Documentation Review**
6.  Do not start major implementation merely because a component name
    appears in this document. Component boundaries must be validated
    against the approved product requirements and architecture.
7.  Preserve existing user work. Never delete, reset, overwrite, or
    force-push changes without explicit approval.
8.  Keep changes focused and avoid modifying unrelated files.
9.  Before declaring a task complete, run appropriate validation/tests
    and review the final diff.
10. If information is missing or contradictory, stop and ask/identify
    the issue rather than silently guessing.

------------------------------------------------------------------------

# 2. PROJECT IDENTITY

## Project name

**Kavrynt**

The exact final product positioning, naming, tagline, and public
definition are still being developed.

Do not invent a final marketing statement.

## Project intent

Kavrynt is being developed as a serious engineering/product project with
an emphasis on:

-   strong product architecture
-   cloud-native/platform engineering principles
-   Kubernetes-oriented infrastructure where appropriate
-   secure software delivery
-   extensibility
-   automation
-   operational reliability
-   high-quality developer experience
-   production-oriented engineering practices

The project is being designed **before implementation**, rather than
starting with code and retrofitting architecture later.

------------------------------------------------------------------------

# 3. CURRENT PROJECT STATE

The project is currently in the **architecture and documentation
bootstrap phase**.

There are multiple repositories/directories involved.

The current known working area includes:

``` text
GITHUB-CODE/
├── product-docs/
├── kavryctl/
└── website/
```

The repositories should eventually have clear responsibilities.

### `product-docs`

Canonical product and engineering documentation repository.

This is currently the most important repository because the project is
being designed documentation-first.

### `kavryctl`

Expected to contain the implementation of the Kavrynt CLI and/or related
tooling.

The exact architecture and implementation responsibilities are **not yet
finalized**.

### `website`

Expected to contain the public/product website.

The final relationship between the website, product documentation,
generated documentation, and product content is **not yet finalized**.

------------------------------------------------------------------------

# 4. CURRENT `product-docs` STATE

At the current starting point, `product-docs` is largely a scaffold.

The repository contains documentation-oriented folders and placeholder
README files rather than completed architecture.

The currently observed structure is approximately:

``` text
product-docs/
└── docs/
    ├── ADR/
    ├── API/
    ├── HLD/
    ├── LLD/
    ├── RFC/
    ├── ProductStrategy.md
    ├── Roadmap.md
    └── Vision.md
```

Important:

**Do not assume the empty README files represent completed design
decisions.**

They are placeholders.

The objective is to turn this scaffold into a coherent
product/architecture documentation system.

------------------------------------------------------------------------

# 5. WHAT WE ARE TRYING TO BUILD

The project should eventually have a complete chain of traceable
engineering decisions:

``` text
Product Vision
      ↓
Product Strategy
      ↓
PRD / Requirements
      ↓
Roadmap
      ↓
RFCs
      ↓
HLDs
      ↓
LLDs
      ↓
API / Data / CRD Contracts
      ↓
Implementation
      ↓
Tests
      ↓
Security Review
      ↓
Deployment / Operations
```

A major goal is traceability:

``` text
Requirement
    ↓
RFC
    ↓
HLD
    ↓
LLD
    ↓
Code
    ↓
Test
```

This should make it possible to answer:

-   Why does this component exist?
-   Which requirement created it?
-   Which RFC approved it?
-   Which HLD defines its architecture?
-   Which LLD defines its implementation?
-   Where is the implementation?
-   How is it tested?
-   What security/operational assumptions exist?

------------------------------------------------------------------------

# 6. DOCUMENTATION-FIRST PRINCIPLE

Do not begin by asking an agent:

> "Build Kavrynt."

Instead, work through controlled phases.

## Phase 0 --- Documentation governance

Define:

-   documentation categories
-   document purpose
-   naming conventions
-   numbering conventions
-   status/lifecycle
-   cross-referencing rules
-   review/approval process

## Phase 1 --- Product definition

Create/review:

-   Vision
-   Product Strategy
-   PRD
-   Roadmap
-   personas/use cases
-   goals/non-goals
-   success metrics
-   MVP boundaries

## Phase 2 --- System architecture

Determine:

-   major components
-   responsibilities
-   boundaries
-   interactions
-   data flows
-   control/data plane concepts if applicable
-   external dependencies
-   security boundaries
-   state management
-   observability
-   failure handling
-   scaling
-   upgrade strategy
-   extensibility

## Phase 3 --- RFCs

Capture major proposals and architectural decisions.

## Phase 4 --- HLDs

Describe system and component architecture.

## Phase 5 --- LLDs

Describe implementation-level design.

## Phase 6 --- Contracts

Define:

-   APIs
-   CLI contracts
-   events
-   schemas
-   Kubernetes CRDs if actually required
-   data contracts

## Phase 7 --- Implementation

Only after the relevant design is approved.

## Phase 8 --- Verification

-   unit tests
-   integration tests
-   end-to-end tests
-   security testing
-   static analysis
-   deployment validation
-   documentation consistency

------------------------------------------------------------------------

# 7. PROPOSED DOCUMENTATION TAXONOMY

The current scaffold contains:

``` text
ADR/
API/
HLD/
LLD/
RFC/
Vision.md
ProductStrategy.md
Roadmap.md
```

This is only a starting point.

The final structure should be proposed and reviewed before mass
creation.

A possible target structure is:

``` text
product-docs/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
│
└── docs/
    ├── Vision.md
    ├── ProductStrategy.md
    ├── Roadmap.md
    │
    ├── PRD/
    │   └── PRD-*.md
    │
    ├── RFC/
    │   └── RFC-*.md
    │
    ├── HLD/
    │   └── HLD-*.md
    │
    ├── LLD/
    │   └── LLD-*.md
    │
    ├── ADR/
    │   └── ADR-*.md
    │
    ├── API/
    │   └── API-*.md
    │
    ├── Security/
    ├── Operations/
    ├── Testing/
    ├── Deployment/
    ├── Observability/
    ├── Diagrams/
    └── Templates/
```

This is a **proposal**, not an approved final structure.

The agent must inspect the repository and help determine the final
organization before creating everything.

------------------------------------------------------------------------

# 8. DOCUMENT TYPES --- EXPECTED RESPONSIBILITIES

## Vision

Answers:

> Why should Kavrynt exist?

Contains:

-   problem
-   opportunity
-   broad product direction
-   target users
-   desired outcome
-   long-term intent

It should not contain detailed implementation decisions.

## Product Strategy

Answers:

> Where are we going and why?

Contains:

-   strategic goals
-   target segments/personas
-   differentiation
-   priorities
-   product principles
-   success metrics
-   strategic constraints

## PRD

Answers:

> What product should we build?

Contains:

-   requirements
-   user journeys
-   functional requirements
-   non-functional requirements
-   acceptance criteria
-   non-goals
-   MVP boundaries

## RFC

Answers:

> What are we proposing and why?

Contains:

-   problem
-   context
-   proposal
-   alternatives
-   tradeoffs
-   consequences
-   rollout considerations
-   open questions

## HLD

Answers:

> How is the system structurally designed?

Contains:

-   components
-   boundaries
-   interactions
-   deployment topology
-   data flows
-   dependencies
-   availability
-   scaling
-   security boundaries
-   failure domains

## LLD

Answers:

> How exactly will this component be implemented?

Contains:

-   modules
-   interfaces
-   algorithms
-   data models
-   configuration
-   error handling
-   state transitions
-   test strategy

## ADR

Answers:

> What important decision did we make?

Contains:

-   context
-   decision
-   alternatives
-   consequences
-   status

Do not create ADRs merely to populate a folder. ADRs should record
actual meaningful decisions.

## API

Defines external/internal contracts.

## CRD

Only create CRD specifications if Kubernetes custom resources are
genuinely part of the product architecture.

------------------------------------------------------------------------

# 9. KNOWN / DISCUSSED COMPONENT DIRECTION

Earlier planning has discussed potential Kavrynt components such as:

``` text
Kavrynt
├── Gateway
├── Operator
├── Registry
└── CLI
```

Potential relationships and exact boundaries are **NOT approved yet**.

Do not treat this list as final architecture.

The correct process is:

``` text
PRD
 ↓
Architecture analysis
 ↓
Component identification
 ↓
Component boundary review
 ↓
RFC
 ↓
HLD
 ↓
LLD
```

Additional components may be required.

Some of these components may also be unnecessary after architecture
analysis.

------------------------------------------------------------------------

# 10. ARCHITECTURAL PRINCIPLES TO EVALUATE

The project should strongly consider the following principles during
design:

## Simplicity

Prefer the smallest architecture that satisfies the requirements.

## Security by design

Security should not be added after implementation.

Consider:

-   least privilege
-   identity
-   authentication
-   authorization
-   secrets
-   supply-chain security
-   secure defaults
-   isolation
-   auditability

## Cloud-native where justified

Use Kubernetes/cloud-native patterns when they provide clear value.

Do not introduce Kubernetes, service meshes, databases, queues, or other
infrastructure merely because they are fashionable.

## Extensibility

Design stable interfaces where future extensions are expected.

Avoid premature abstraction.

## Observability

Important components should have:

-   structured logs
-   metrics
-   traces where appropriate
-   health/readiness semantics
-   useful diagnostics

## Reliability

Consider:

-   retries
-   timeouts
-   idempotency
-   graceful failure
-   backpressure
-   recovery
-   upgrade/rollback
-   failure domains

## Developer experience

CLI/API/configuration should be predictable, documented, and testable.

## Operability

A production system must be diagnosable and maintainable.

------------------------------------------------------------------------

# 11. SECURITY EXPECTATIONS

Security is a first-class architectural concern.

Future designs should evaluate:

-   authentication
-   authorization
-   identity boundaries
-   RBAC
-   secret handling
-   network boundaries
-   encryption
-   audit logging
-   dependency security
-   container/image security
-   software supply-chain security
-   provenance/signing where appropriate
-   vulnerability scanning
-   SBOM
-   secure CI/CD
-   least privilege
-   Kubernetes security context where applicable

Do not claim a security control exists until it is actually designed or
implemented.

------------------------------------------------------------------------

# 12. KUBERNETES / CLOUD-NATIVE EXPECTATIONS

The project has strong Kubernetes/cloud-native engineering context.

Where Kubernetes is part of the actual architecture, designs should
consider:

-   workload types
-   namespaces
-   RBAC
-   service accounts
-   network policies
-   resource requests/limits
-   probes
-   graceful shutdown
-   topology/spread/affinity
-   PodDisruptionBudgets where relevant
-   securityContext
-   secrets/configuration
-   upgrade strategy
-   observability
-   failure behavior
-   image provenance
-   deployment strategy

However:

**Do not introduce Kubernetes constructs unless the product requirements
justify them.**

------------------------------------------------------------------------

# 13. OBSERVABILITY

The final design should explicitly address:

``` text
Logs
Metrics
Traces
Health
Alerts
Diagnostics
Audit events
```

For each major component, the HLD/LLD should eventually explain:

-   what is observable
-   what operators need to know
-   failure signals
-   important metrics
-   diagnostic workflows

------------------------------------------------------------------------

# 14. API / CONTRACT-FIRST THINKING

Where interfaces are involved, contracts should be designed before
implementation.

Potential contract types:

``` text
CLI
REST
gRPC
Events
Webhooks
Kubernetes CRDs
Configuration schemas
Data schemas
```

Do not choose a protocol simply because it is familiar.

Choose based on requirements and document the decision.

------------------------------------------------------------------------

# 15. CODEx / AI DEVELOPMENT WORKFLOW

The project will use Codex heavily.

The intended role of Codex is:

-   repository analyst
-   architecture assistant
-   technical writer
-   implementation engineer
-   test engineer
-   debugging assistant
-   security reviewer
-   documentation consistency reviewer

The human/project owner remains responsible for:

-   product direction
-   final architectural decisions
-   acceptance criteria
-   approving major changes
-   reviewing important implementation changes

------------------------------------------------------------------------

# 16. CODEx WORKFLOW

For major tasks, use this sequence.

## 16.1 Explore

``` text
Explore this repository.

Do not modify anything.

Understand:
- architecture
- documentation
- dependencies
- current implementation
- tests
- deployment

Return findings and open questions.
```

## 16.2 Plan

``` text
Create an implementation/design plan.

Do not modify files.

Inspect the existing architecture and documentation first.

Include:
- files affected
- architectural impact
- dependencies
- security
- testing
- rollout
- rollback
- open questions
```

## 16.3 Implement

``` text
Implement the approved plan.

Follow AGENTS.md.

Keep changes focused.

Do not modify unrelated files.

Add/update tests.

Run validation.

Fix failures.

Review the final git diff.

Do not commit unless explicitly requested.
```

## 16.4 Review

``` text
Review the current git diff as a principal engineer.

Check:
- correctness
- security
- reliability
- performance
- maintainability
- compatibility
- test coverage
- documentation consistency

Do not modify anything.

Rank findings by severity.
```

------------------------------------------------------------------------

# 17. PRODUCT-DOCS INITIAL CODEx WORKFLOW

The first task in the current project state is NOT to create all
documents.

### Step 1 --- repository analysis

Codex must inspect the current scaffold.

Prompt:

``` text
You are joining the Kavrynt project as a principal software architect.

This repository is the canonical product documentation repository for Kavrynt.

IMPORTANT:
- Do not modify anything.
- Do not create files.
- Do not assume empty README files contain decisions.
- Inspect the entire repository first.

Analyze:
1. repository structure
2. existing documentation
3. current placeholders
4. missing documentation categories
5. proposed documentation lifecycle
6. naming conventions
7. relationships between Vision, PRD, RFC, HLD, LLD, ADR, API
8. questions that must be resolved

Return a proposed documentation architecture.

Do not modify files.
```

### Step 2 --- review the proposal

Human review happens here.

### Step 3 --- create AGENTS.md

Codex should create repository-specific instructions.

### Step 4 --- product foundation

Create/review:

``` text
Vision.md
ProductStrategy.md
PRD-0001-Product.md
Roadmap.md
```

### Step 5 --- architecture

Only after product foundation is reviewed:

``` text
System architecture
Component map
Data flows
Security boundaries
Deployment model
Operational model
```

### Step 6 --- RFCs

Create RFCs for major architectural proposals.

### Step 7 --- HLDs

Create high-level component designs.

### Step 8 --- LLDs

Create implementation-level designs.

### Step 9 --- implementation

Move to the appropriate code repository.

------------------------------------------------------------------------

# 18. IMPORTANT PRODUCT STRATEGY RULE

Product strategy must not be invented blindly by an AI agent.

Codex may:

-   research
-   organize
-   identify gaps
-   propose alternatives
-   draft
-   challenge assumptions

But the project owner must approve:

-   product problem
-   target user
-   product scope
-   positioning
-   goals
-   non-goals
-   MVP
-   strategic priorities

If the information is insufficient, the agent must explicitly say so.

------------------------------------------------------------------------

# 19. GIT WORKFLOW

Use feature branches.

Examples:

``` text
docs/bootstrap
docs/product-strategy
docs/rfc-system-architecture
docs/hld-gateway
feature/gateway
feature/operator
feature/cli
```

Before/after significant work:

``` bash
git status
git diff --stat
git diff
```

Do not force push.

Do not reset user changes.

Do not delete branches without explicit instruction.

------------------------------------------------------------------------

# 20. REPOSITORY RESPONSIBILITY MODEL

Current intended direction:

``` text
product-docs
    │
    ├── Product
    ├── Architecture
    ├── RFC
    ├── HLD
    ├── LLD
    ├── API contracts
    └── Engineering standards
             │
             ▼
        Implementation
             │
       ┌─────┴─────┐
       ▼           ▼
   kavryctl      website
```

This is a working model, not a final repository architecture.

The exact repository boundaries should be confirmed as the product
architecture develops.

------------------------------------------------------------------------

# 21. DO NOT DO THESE THINGS

Do not:

-   invent missing product requirements
-   generate hundreds of empty/meaningless documents
-   create ADRs just to fill a directory
-   create HLD/LLD before the relevant architecture is understood
-   start implementation before the required design is approved
-   introduce technologies without a reason
-   create microservices just because they are common
-   introduce Kubernetes resources without a product need
-   overwrite user changes
-   commit secrets
-   hardcode credentials
-   silently change approved architecture
-   treat an AI-generated design as automatically correct

------------------------------------------------------------------------

# 22. CURRENT OPEN QUESTIONS

These are intentionally unresolved and should be handled through
product/architecture work.

At minimum, determine:

1.  What exactly is Kavrynt's core problem?
2.  Who is the primary user?
3.  What is the first compelling use case?
4.  What is the MVP?
5.  What is explicitly out of scope?
6.  What makes Kavrynt differentiated?
7.  What are the primary workflows?
8.  Which components are actually required?
9.  Which execution environment(s) are required?
10. Which cloud/Kubernetes dependencies are required?
11. What APIs are needed?
12. What state must be persisted?
13. What is the security model?
14. What is the upgrade model?
15. What is the extensibility model?
16. What is the operational model?
17. What should be implemented in `kavryctl`?
18. What belongs in other implementation repositories?
19. What should the website expose?
20. What should be open-source versus potentially hosted/commercial, if
    applicable?

Do not answer these by guessing.

Turn important answers into documented decisions.

------------------------------------------------------------------------

# 23. DEFINITION OF DONE FOR ARCHITECTURE

Before implementation of a major component, we should be able to answer:

-   What problem does it solve?
-   Which requirement requires it?
-   What are its responsibilities?
-   What are its boundaries?
-   What are its interfaces?
-   What data does it own?
-   How does it authenticate?
-   How does it authorize?
-   How does it fail?
-   How does it scale?
-   How is it observed?
-   How is it tested?
-   How is it deployed?
-   How is it upgraded?
-   How is it secured?
-   What are the alternatives?
-   Why was the selected design chosen?

And the relevant documents should exist:

``` text
PRD
 ↓
RFC
 ↓
HLD
 ↓
LLD
 ↓
API/Contracts
```

------------------------------------------------------------------------

# 24. CODEx MODEL / INTERFACE GUIDANCE

The current preferred working model is to use the strongest generally
available Codex-capable model exposed by the account.

For major architecture and difficult engineering work, use high
reasoning.

For routine coding, medium reasoning is generally sufficient.

For trivial changes, lower reasoning may be appropriate.

## VS Code Codex

Use VS Code as the primary interface for:

-   product documentation
-   RFC/HLD/LLD
-   code changes
-   reviewing diffs
-   file-aware discussions
-   repository navigation
-   design-to-code workflows

## Codex CLI

Use the CLI heavily for:

-   terminal work
-   Git
-   Terraform
-   Docker
-   Kubernetes
-   CI/CD
-   debugging
-   scripting
-   command-heavy workflows
-   environments where VS Code is not the primary interface

The two interfaces are complementary.

------------------------------------------------------------------------

# 25. IDE WORKING PRINCIPLE

For the documentation phase:

``` text
VS Code
  ↓
Open product-docs directly
  ↓
Open Codex
  ↓
Explore
  ↓
Plan
  ↓
Review
  ↓
Implement
  ↓
Review diff
```

Do not start by opening only the parent folder containing multiple
unrelated repositories if a task is specific to one repository.

For documentation work, open:

``` text
product-docs/
```

directly.

For CLI implementation work, open:

``` text
kavryctl/
```

directly.

------------------------------------------------------------------------

# 26. FIRST MILESTONE

The first milestone is:

## M001 --- Kavrynt Product & Architecture Foundation

Expected outcome:

``` text
product-docs/
│
├── AGENTS.md
│
└── docs/
    ├── Vision.md
    ├── ProductStrategy.md
    ├── Roadmap.md
    ├── PRD/
    │   └── PRD-0001-Product.md
    │
    ├── RFC/
    │   └── ...
    │
    ├── HLD/
    │   └── ...
    │
    ├── LLD/
    │   └── ...
    │
    ├── ADR/
    │   └── ...
    │
    └── API/
        └── ...
```

But the exact final structure must be agreed after Phase 0 analysis.

M001 is complete only when:

-   product problem is defined
-   target users are defined
-   MVP boundaries are defined
-   major requirements are documented
-   architecture principles are documented
-   major components are identified
-   important architectural questions are tracked
-   major decisions are documented
-   documentation relationships are clear
-   no major design contradiction remains unresolved

------------------------------------------------------------------------

# 27. SECOND MILESTONE

## M002 --- First Implementable Component

After M001:

``` text
RFC
 ↓
HLD
 ↓
LLD
 ↓
Implementation repository
 ↓
Tests
 ↓
Security review
 ↓
Documentation verification
```

Only then should we begin substantial production code.

------------------------------------------------------------------------

# 28. LONG-TERM DEVELOPMENT MODEL

The intended development loop is:

``` text
          PRODUCT OWNER / ARCHITECT
                    │
                    ▼
              Define problem
                    │
                    ▼
                  Codex
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Explore     Plan     Challenge
          │         │         │
          └─────────┼─────────┘
                    ▼
               Human review
                    │
                    ▼
                Codex build
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
        Code      Tests     Docs
          │         │         │
          └─────────┼─────────┘
                    ▼
                Codex review
                    │
                    ▼
              Human approval
                    │
                    ▼
                  Git
                    │
                    ▼
                 Release
```

------------------------------------------------------------------------

# 29. HOW TO CONTINUE FROM THIS DOCUMENT

When this file is loaded into a new ChatGPT account or Codex session, do
NOT restart the project from scratch.

Start by saying:

``` text
You are joining the Kavrynt project.

Read KAVRYNT-MASTER-CONTEXT.md completely.

Treat it as the current project context.

Do not immediately create files or code.

First:
1. summarize your understanding
2. identify confirmed facts
3. identify assumptions
4. identify open questions
5. inspect the current repository
6. propose the next smallest useful step

We are currently in the documentation and architecture bootstrap phase.

Do not skip directly to implementation.
```

------------------------------------------------------------------------

# 30. IMMEDIATE NEXT ACTION

The immediate next task is:

### Phase 0 --- Documentation Architecture Analysis

In the `product-docs` repository, ask Codex:

``` text
Read KAVRYNT-MASTER-CONTEXT.md completely.

You are joining Kavrynt as a principal product architect and software architect.

Do not modify any files.

Inspect the entire product-docs repository.

The repository is currently mostly a scaffold with folders and placeholder README files.

Analyze the current documentation architecture and propose:

1. final documentation categories
2. directory structure
3. document naming conventions
4. document numbering conventions
5. lifecycle/status model
6. relationships between Vision, Product Strategy, PRD, RFC, HLD, LLD, ADR and API documents
7. templates we should establish
8. traceability model
9. review/approval model
10. missing categories
11. risks in the current scaffold
12. open product/architecture questions

Do not create or modify documents yet.

Return a proposal for human review.
```

After that proposal is reviewed, proceed to product definition.

------------------------------------------------------------------------

# 31. FINAL OPERATING PRINCIPLE

Kavrynt should be built deliberately.

The objective is not:

> Generate as much code as possible.

The objective is:

> Build a coherent product whose requirements, architecture,
> implementation, security, testing, and operations can all be traced
> back to explicit engineering decisions.

Use Codex aggressively for execution, analysis, implementation, testing,
debugging, and review.

Use human judgment for product direction and important architectural
decisions.

The desired end state is:

``` text
Clear Product
     ↓
Clear Architecture
     ↓
Clear Contracts
     ↓
Clean Implementation
     ↓
Automated Tests
     ↓
Strong Security
     ↓
Observable Operations
     ↓
Repeatable Releases
```

**Kavrynt should be treated as a real product and engineering system,
not as an AI-generated demo.**
