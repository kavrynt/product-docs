---
id: HLD-0005
title: Registry High-Level Design
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

# HLD-0005: Registry High-Level Design

## Summary

Registry is the Kavrynt source of truth for MCP server metadata, versions,
lifecycle state, and policy references.

The current `kavryctl` implementation has a local file-backed Registry. The
full MVP design evolves that into a shared Registry service or Kubernetes-backed
source of truth.

## Responsibilities

- Store MCP server records.
- Store version metadata.
- Store lifecycle state.
- Store ownership and labels.
- Store route/deployment references.
- Store policy references.
- Expose query APIs for `kavryctl`, Gateway, and Operator.

## Non-Responsibilities

- Proxying MCP traffic.
- Reconciling Kubernetes workloads.
- Executing MCP tools.
- Acting as an MCP host/client.

## Architecture

```text
            kavryctl
               |
               v
          Registry API
               |
       +-------+--------+
       |                |
   Metadata Store   Status Store
       |                |
       v                v
   Gateway config   Operator status
```

## Core Records

Proposed high-level records:

- server,
- server version,
- deployment target,
- capability snapshot,
- policy binding,
- observed status,
- audit metadata.

## Interactions

| Component | Interaction |
| --- | --- |
| `kavryctl` | Creates, updates, lists, inspects, versions, deploys |
| Gateway | Reads route and policy config, emits future runtime status |
| Operator | Reads desired state, writes observed deployment status |
| MCP server | Not directly required; capability discovery may be added later |

## Capability Metadata

Registry may eventually store discovered MCP capabilities:

- tools,
- resources,
- prompts,
- server protocol version,
- transport type.

This is a design decision. Storing capability metadata improves governance but
requires Gateway or another component to perform MCP discovery.

## Security Boundaries

Registry is a control-plane trust boundary.

Future controls:

- authenticated API access,
- authorization by user/team/project,
- immutable version records,
- audit log for changes,
- secret references rather than stored secret values.

## Open Questions

- Is the first shared Registry a service, a CRD-backed model, or both?
- What database is justified for MVP?
- Does Registry store discovered MCP primitives?
- How are records versioned and migrated?
- What is the first audit event format?
