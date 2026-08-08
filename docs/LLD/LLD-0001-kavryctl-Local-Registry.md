---
id: LLD-0001
title: kavryctl Low-Level Design
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
  - RFC-0002
  - HLD-0001
---

# LLD-0001: kavryctl Low-Level Design

## Summary

This LLD describes the current implementation-level design for `kavryctl`.

The implementation is in the `kavryctl` repository and is organized as a small
Go CLI with internal packages for command handling, manifest validation, and
registry persistence. Future slices add Registry API, Kubernetes deployment,
Gateway diagnostics, and status workflows.

## Requirements Traceability

| Source | IDs |
| --- | --- |
| PRD | REQ-MVP-001, REQ-MVP-002, REQ-MVP-004, REQ-MVP-005, REQ-MVP-006, REQ-MVP-011 |
| RFC | RFC-0002 |
| HLD | HLD-0001 |

## Repository Layout

```text
kavryctl/
├── main.go
├── internal/
│   ├── cli/
│   ├── manifest/
│   └── registry/
├── examples/
│   └── mcp-server.json
├── Dockerfile
├── charts/kavryctl/
├── .github/workflows/qa.yml
├── AGENTS.md
└── docs/RUNBOOK.md
```

## Module Design

### `main.go`

Responsibilities:

- pass process arguments to the CLI package,
- connect stdout/stderr,
- exit with the CLI return code.

### `internal/cli`

Responsibilities:

- parse top-level commands,
- parse command flags,
- call manifest and registry packages,
- format user-facing output,
- return stable process exit codes.

Future command groups:

- `registry`: configure local or remote Registry target,
- `deploy`: create Kubernetes desired state,
- `status`: read Registry, Operator, and Gateway status,
- `rollback`: select a prior version,
- `gateway`: inspect route and upstream health.

Current exit code convention:

- `0`: success,
- `1`: runtime or validation failure,
- `2`: command usage error.

### `internal/manifest`

Responsibilities:

- load manifest JSON from disk,
- parse into typed Go structs,
- validate required fields,
- validate supported transport-specific requirements.

Current manifest constants:

- `apiVersion`: `kavrynt.io/v1alpha1`
- `kind`: `MCPServer`

Supported transports:

- `stdio`: requires `spec.command`,
- `http`: requires `spec.endpoint`.

### `internal/registry`

Responsibilities:

- resolve Kavrynt home directory,
- initialize local registry file,
- load registry JSON,
- save registry JSON,
- register or update server metadata,
- list registered servers,
- inspect one server by name.

Current home resolution order:

1. explicit `--home`,
2. `KAVRYNT_HOME`,
3. `.kavrynt`.

## Data Models

### Manifest

```text
Manifest
  apiVersion string
  kind string
  metadata Metadata
  spec Spec
```

### Metadata

```text
Metadata
  name string
  description string
  labels map[string]string
```

### Spec

```text
Spec
  version string
  transport string
  command string
  args []string
  endpoint string
  environment map[string]string
```

### Registry

```text
Registry
  version int
  servers []Server
```

### Server

```text
Server
  manifest Manifest
  source string
  registeredAt time
  updatedAt time
```

## Validation Rules

Current manifest validation checks:

- `apiVersion` is present and equals `kavrynt.io/v1alpha1`,
- `kind` is present and equals `MCPServer`,
- `metadata.name` is present,
- `metadata.name` follows lowercase DNS-label syntax,
- `spec.version` is present,
- `spec.transport` is present,
- `stdio` transport includes `spec.command`,
- `http` transport includes a URI-shaped `spec.endpoint`,
- unsupported transports are rejected.

## Registry Write Path

Current write path:

```text
Registry struct
  -> json.MarshalIndent
  -> append newline
  -> os.WriteFile(registry.json, 0644)
```

Known limitation:

- writes are not atomic yet.

Recommended next improvement:

```text
marshal registry
  -> write registry.json.tmp
  -> fsync if needed
  -> rename tmp to registry.json
```

## Error Handling

The CLI prints contextual errors to stderr.

Examples:

- `validation failed: ...`
- `registration failed: ...`
- `list failed: ...`
- `inspect failed: ...`

Future contract work should define stable machine-readable errors.

## Testing Strategy

Current tests cover:

- successful stdio manifest validation,
- missing command rejection,
- invalid name rejection,
- register create/update behavior,
- list behavior,
- inspect behavior through CLI workflow.

Required future tests:

- unknown field rejection if strict JSON parsing is added,
- HTTP endpoint valid/invalid cases,
- registry corruption handling,
- atomic write failure handling,
- CLI usage errors,
- JSON output mode if added,
- Docker image smoke in CI,
- Helm render/lint in CI.

## Build and Release Design

Current hardening:

- Go tests,
- Go vet,
- GitHub Actions QA,
- Docker build,
- non-root distroless runtime image,
- pinned Docker base images by digest,
- OCI image labels,
- version/commit/build-date injection,
- Helm lint/template validation,
- Helm Job disables service account token mounting.

## Future Integration Design

### Registry Integration

`kavryctl` should use a client interface so local file-backed registry and
remote Registry API can share command behavior.

```text
type RegistryClient interface {
  Register(manifest) result
  List(filter) []server
  Inspect(name) server
  UpdateStatus(...)
}
```

### Kubernetes Integration

Kubernetes deployment should live behind a deployer interface.

```text
type Deployer interface {
  Apply(server, version) result
  Status(name) status
  Rollback(name, version) result
}
```

This prevents CLI command logic from depending directly on Kubernetes APIs.

## Security Considerations

Current implementation does not execute manifest commands. It only stores
metadata.

Security controls currently in place:

- non-root container runtime,
- read-only root filesystem in Helm chart,
- dropped Linux capabilities in Helm chart,
- service account token automount disabled in Helm chart,
- no committed secrets expected,
- local `.kavrynt/` ignored by Git.

Future security work:

- strict manifest schema,
- policy model,
- audit event model,
- registry trust model,
- signature/provenance model,
- SBOM and image signing,
- threat model for Gateway and Operator.

## Open Questions

- Should local registry writes be atomic before adding `unregister`?
- Should the local registry use one JSON file or a directory of server records?
- Should the CLI support YAML before Gateway work begins?
- Should transport be modeled as an enum type?
- Should timestamps be test-injected everywhere for deterministic CLI tests?
- Should `inspect` support table, JSON, and YAML output modes?
