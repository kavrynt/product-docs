---
id: HLD-0002
title: Kavrynt MVP System Architecture
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
  - RFC-0002
  - CONCEPT-0001
  - HLD-0001
  - HLD-0003
  - HLD-0004
  - HLD-0005
---

# HLD-0002: Kavrynt MVP System Architecture

## Summary

This HLD defines a concrete draft architecture for the four Kavrynt MVP
components:

- `kavryctl`
- Gateway
- Kubernetes Operator
- Registry

The design solves a real MCP-world problem: teams can build MCP servers, but
they need a production operating model for registration, deployment, access,
policy, observability, versioning, and rollback.

## Real-World Scenario

A platform team wants to expose internal tools to AI applications through MCP:

- source-code search,
- incident lookup,
- deployment status,
- ticket creation,
- database metadata,
- internal documentation search.

Without Kavrynt, every team deploys MCP servers differently. Security teams do
not know which tools exist, operators do not have a standard lifecycle model,
and developers cannot reliably upgrade or roll back MCP server versions.

Kavrynt provides the infrastructure layer:

```text
MCP server definition
  -> register
  -> deploy
  -> expose through controlled Gateway
  -> observe
  -> version
  -> upgrade / rollback
```

## Important MCP Assumption

MCP has hosts, clients, and servers. A host creates a client connection to each
server. Servers expose tools, resources, and prompts. MCP supports stdio for
local process communication and streamable HTTP for remote communication.

Kavrynt is not an MCP host in this MVP. Kavrynt is infrastructure around MCP
servers.

## System Architecture

```text
          Developer / Platform Engineer
                    |
                    v
                kavryctl
                    |
          +---------+----------+
          |                    |
          v                    v
      Registry           Kubernetes API
          |                    |
          |                    v
          |             Kubernetes Operator
          |                    |
          +---------+----------+
                    |
                    v
                 Gateway
                    |
                    v
             MCP Server Workloads
                    ^
                    |
             MCP Hosts / Clients
```

## Control Plane

Control-plane responsibilities:

- store desired MCP server metadata,
- validate server definitions,
- manage versions,
- reconcile Kubernetes runtime state,
- configure Gateway routes,
- expose operational status.

Control-plane components:

- `kavryctl`
- Registry
- Kubernetes Operator
- Kubernetes API, where Kubernetes deployment is used.

## Data Plane

Data-plane responsibilities:

- receive MCP client traffic,
- route to approved MCP server workloads,
- enforce configured access decisions when policy is implemented,
- emit request and failure telemetry.

Data-plane component:

- Gateway

## Component Responsibilities

| Component | Primary Role | Owns | Does Not Own |
| --- | --- | --- | --- |
| `kavryctl` | CLI for developer/operator workflows | user commands, local validation, status presentation | long-running state, traffic proxying |
| Registry | Source of truth for MCP server metadata and versions | server records, versions, lifecycle metadata, policy references | Kubernetes reconciliation, runtime traffic |
| Operator | Kubernetes reconciliation loop | workloads, services, status, Gateway runtime config | product metadata source of truth |
| Gateway | MCP data-plane access point | routing, request telemetry, future policy enforcement | source-of-truth registry, workload deployment |

## Primary Workflow

### 1. Register

```text
Developer writes mcp-server.yaml
  -> kavryctl validate
  -> kavryctl register
  -> Registry stores MCP server metadata and version
```

### 2. Deploy

```text
kavryctl deploy <server>
  -> desired state is written to Kubernetes
  -> Operator reconciles Deployment/Service/GatewayRoute
  -> Operator writes status
  -> Registry reflects deployment state
```

### 3. Use

```text
MCP Host
  -> MCP Client
  -> Gateway endpoint
  -> MCP Server workload
```

### 4. Observe

```text
kavryctl status <server>
  -> Registry status
  -> Kubernetes status
  -> Gateway route health
```

### 5. Upgrade / Rollback

```text
kavryctl register new version
  -> Registry creates new version record
  -> kavryctl deploy version
  -> Operator rolls out workload
  -> Gateway routes to healthy version
  -> rollback selects prior version if needed
```

## Deployment Topology

MVP topology in Kubernetes:

```text
Namespace: kavrynt-system
  - Registry API service
  - Gateway service
  - Operator deployment

Namespace: team/application namespace
  - MCP server workloads
  - Services for MCP workloads
  - Optional Kavrynt custom resources
```

Local developer topology:

```text
kavryctl
  -> .kavrynt/registry.json
  -> example MCP manifest validation
```

## State Model

Registry source-of-truth state:

- server id,
- name,
- description,
- labels,
- owner/team,
- transport type,
- endpoint or runtime target,
- versions,
- desired lifecycle state,
- policy references,
- last observed status,
- audit metadata.

Operator observed state:

- workload ready,
- service ready,
- route configured,
- selected version,
- error conditions.

Gateway runtime state:

- route table,
- upstream health,
- request counts,
- error counts,
- future auth/policy decisions.

## Security Boundaries

Initial boundaries:

- `kavryctl` runs with user credentials.
- Registry authenticates control-plane writes in future remote mode.
- Operator uses Kubernetes RBAC with least privilege.
- Gateway is the external/runtime access boundary for remote MCP traffic.
- MCP server workloads run with isolated service accounts.

MVP security decisions still required:

- authentication model,
- authorization model,
- policy binding model,
- audit event schema,
- secret storage,
- Gateway TLS and identity model.

## Observability

Each component should expose:

- structured logs,
- health/readiness semantics where long-running,
- metrics,
- error conditions,
- version/build metadata.

MVP minimum:

- `kavryctl status`,
- Registry health endpoint,
- Operator reconciliation metrics,
- Gateway request/error metrics,
- Kubernetes events for reconciliation failures.

## Failure Handling

Important failures:

- invalid manifest,
- Registry unavailable,
- Operator cannot reconcile,
- Gateway route missing,
- MCP server unhealthy,
- rollout fails,
- rollback requested.

The MVP should make these failures visible through `kavryctl status` and
component logs before adding advanced automation.

## Why This Architecture

This architecture separates concerns:

- developers get a clear CLI,
- platform teams get a source of truth,
- Kubernetes runtime logic stays in the Operator,
- MCP traffic stays in the Gateway,
- future security and policy have clear enforcement points.

## Open Questions

- Should Registry be required before Kubernetes deployment, or can CRDs be the
  source of truth in Kubernetes-only mode?
- Does Gateway terminate and understand MCP messages, or initially route HTTP
  traffic transparently?
- Which MCP capability metadata should Registry store?
- What is the first authentication and authorization model?
- What is the first policy language?
- What is the first audit event schema?
