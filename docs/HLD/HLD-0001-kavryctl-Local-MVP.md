---
id: HLD-0001
title: kavryctl Component High-Level Design
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
  - RFC-0002
  - CONCEPT-0001
---

# HLD-0001: kavryctl Component High-Level Design

## Summary

This HLD describes `kavryctl`, the developer and operator CLI for Kavrynt.

`kavryctl` is the first Kavrynt implementation artifact. Its current role is to
validate and manage local MCP server metadata. In the full four-component MVP,
it becomes the entrypoint for registering, validating, deploying, inspecting,
and operating MCP server definitions through Registry, Gateway, and Kubernetes
Operator workflows.

The current slice is intentionally small:

```text
MCP server manifest
  -> kavryctl validate
  -> kavryctl register
  -> local file-backed registry
  -> kavryctl list / inspect
```

## Status

Draft.

The implementation exists, but this HLD is still draft until reviewed and
aligned with the future CLI API contract.

## Requirements Traceability

| Source | IDs |
| --- | --- |
| PRD | REQ-MVP-001, REQ-MVP-002, REQ-MVP-004, REQ-MVP-005, REQ-MVP-006, REQ-MVP-011 |
| RFC | RFC-0002 |
| Concept | CONCEPT-0001 |

## Role In The Four-Component MVP

```text
Developer / Platform Engineer
        |
        v
    kavryctl
        |
        +--> Registry: register, list, inspect, version metadata
        |
        +--> Kubernetes API: apply generated resources for Operator workflows
        |
        +--> Gateway: status and diagnostics, not direct traffic proxying
```

`kavryctl` should not become a long-running control plane. It should remain a
thin, predictable CLI over documented contracts.

## Goals

- Provide a working local CLI foundation.
- Validate an initial MCP server manifest format.
- Store registered MCP server metadata locally.
- Support list and inspect workflows.
- Keep the architecture simple and dependency-light.
- Avoid premature Gateway, Operator, auth, or remote Registry complexity.
- Provide a future path to remote Registry and Kubernetes deployment workflows.

## Non-Goals

- Running MCP protocol sessions.
- Acting as an MCP host.
- Acting as an MCP client.
- Proxying MCP traffic.
- Deploying MCP servers to Kubernetes.
- Enforcing authentication, authorization, or policy.
- Managing production upgrades or rollback.
- Acting as the source of truth for shared team state.

## Architecture Overview

```text
User / Developer
      |
      v
  kavryctl CLI
      |
      +--> Manifest Loader / Validator
      |
      +--> Local Registry Store
                |
                v
        .kavrynt/registry.json
```

## Component Responsibilities

| Component | Responsibilities | Non-Responsibilities |
| --- | --- | --- |
| CLI command layer | Parse commands, flags, inputs, and output user-facing results | Store registry data directly, execute MCP tools, run servers |
| Manifest package | Load and validate MCP server manifest JSON | Fetch remote manifests, validate full MCP protocol compatibility |
| Registry package | Initialize, load, save, register, list, and inspect local metadata | Remote API, concurrency locking, network service behavior |
| Example manifest | Provide a first known-good MCP server declaration | Serve as a complete MCP specification |

## Current CLI Commands

```text
kavryctl version
kavryctl init [--home DIR]
kavryctl validate <manifest.json>
kavryctl register [--home DIR] <manifest.json>
kavryctl list [--home DIR]
kavryctl inspect [--home DIR] <name>
```

## Data Flow

### Validate

```text
manifest.json
  -> read file
  -> parse JSON
  -> validate apiVersion, kind, metadata.name, version, transport
  -> print valid/invalid result
```

### Register

```text
manifest.json
  -> validate
  -> initialize .kavrynt/registry.json if needed
  -> insert or update server entry by metadata.name
  -> persist registry
  -> print registered/updated result
```

### List

```text
.kavrynt/registry.json
  -> load registry
  -> sort entries by name
  -> print table
```

### Inspect

```text
.kavrynt/registry.json
  -> load registry
  -> find server by name
  -> print JSON details
```

## Registry State

The local registry is a JSON file:

```text
.kavrynt/registry.json
```

Current high-level fields:

- registry version,
- registered server list,
- original manifest content,
- manifest source path,
- registration timestamp,
- update timestamp.

## Security Boundaries

The current implementation treats manifests and registry files as local
developer input.

Security properties:

- no network calls,
- no credential storage,
- no MCP tool execution,
- no Kubernetes access,
- no shell execution from manifest content.

Important limitations:

- registry writes are local file writes,
- registry file locking is not implemented,
- unknown manifest fields are not rejected yet,
- no policy, auth, or audit model exists yet.

## Observability

Current observability is CLI output only.

Future observability should include structured logs, machine-readable output,
and audit events once Gateway, Registry service, or Operator exist.

## Reliability

Current reliability design:

- validation happens before registration,
- registry initialization is idempotent,
- repeated registration updates existing entries by name,
- tests use temporary directories.

Future improvements:

- atomic registry writes,
- file locking,
- stricter schema validation,
- machine-readable errors,
- JSON/YAML output options.

## Deployment Model

Current deployment artifacts:

- local Go CLI,
- Docker image for CLI execution,
- Helm chart that runs `kavryctl version` as a Kubernetes Job smoke test.

The Helm chart does not deploy a long-running service. This is deliberate
because Gateway, Registry service, and Operator are not part of this slice.

## Future Four-Component Workflows

### Register

```text
kavryctl register mcp-server.yaml
  -> validates manifest
  -> creates or updates Registry record
  -> returns server id, version, status
```

### Deploy

```text
kavryctl deploy <server>
  -> resolves Registry record
  -> generates or applies Kubernetes custom resource
  -> Operator reconciles workload and Gateway route
  -> kavryctl reports status
```

### Observe

```text
kavryctl status <server>
  -> reads Registry and/or Kubernetes status
  -> displays deployment, route, health, version, and policy summary
```

## Open Questions

- Should the manifest format support YAML in the next slice?
- Should unknown JSON fields be rejected immediately?
- Should local registry writes become atomic before more commands are added?
- Should `kavryctl` support JSON output for automation?
- What is the future CLI/API contract for Gateway and Registry integration?
- Is `.kavrynt/registry.json` only a local developer artifact, or can it become
  an import/export format?
