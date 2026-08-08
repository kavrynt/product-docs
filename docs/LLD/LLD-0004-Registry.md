---
id: LLD-0004
title: Registry Low-Level Design
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - HLD-0002
  - HLD-0005
---

# LLD-0004: Registry Low-Level Design

## Summary

Registry is the control-plane source of truth for MCP server records, versions,
desired lifecycle state, policy references, and observed status.

The first shared Registry implementation should be a small API service with a
simple persistence layer. The exact database is not approved yet.

## Runtime Modules

```text
registry/
  cmd/registry
  internal/api
  internal/store
  internal/model
  internal/validation
  internal/auth      future
  internal/audit     future
  internal/metrics
```

## API Surface

Proposed initial operations:

- create/update server,
- list servers,
- inspect server,
- create version,
- set desired deployment state,
- update observed status,
- read route configuration.

## Data Model

### Server

- id,
- name,
- description,
- labels,
- owner,
- created at,
- updated at.

### Version

- id,
- server id,
- version,
- manifest digest,
- transport,
- endpoint or image,
- created at.

### Deployment State

- server id,
- version id,
- target namespace,
- desired state,
- observed state,
- conditions.

### Policy Reference

- server id,
- policy name,
- scope,
- created at.

## Persistence Options

MVP candidates:

- SQLite for local/single-node Registry,
- Postgres for production-like shared Registry,
- Kubernetes CRDs for Kubernetes-native source of truth.

Recommended design path:

1. Keep local file-backed registry for `kavryctl`.
2. Define Registry API contract.
3. Implement SQLite-backed Registry service for local integration tests.
4. Add Postgres only when multi-user/shared deployment requirements justify it.

## Validation

Registry should reject:

- duplicate server names in same scope,
- invalid transport,
- invalid version,
- invalid endpoint/image reference,
- unknown lifecycle state,
- policy reference to missing policy.

## Observability

- `/healthz`
- `/readyz`
- `/metrics`
- structured request logs,
- version/build endpoint.

## Security

Initial:

- no secrets in records,
- policy references only,
- authenticated writes once remote API exists.

Future:

- RBAC by organization/project/team,
- immutable version records,
- audit log for all writes,
- signed manifests/provenance.

## Tests

- API contract tests,
- store tests,
- validation tests,
- duplicate handling,
- status update tests,
- migration tests once database exists,
- container smoke tests.

## Open Questions

- Is SQLite acceptable for first shared Registry?
- What is the API protocol: REST, gRPC, or both?
- How does Registry integrate with Kubernetes CRDs?
- Does Registry store MCP primitive discovery results?
