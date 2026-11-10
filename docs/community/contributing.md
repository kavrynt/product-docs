# Contributing to Kavrynt

This guide is for first-time contributors and regulars alike. It summarizes
[`CONTRIBUTING.md`](https://github.com/kavrynt/kavrynt/blob/develop/CONTRIBUTING.md)
in the runtime repository, which stays the authority when the two differ.

## Getting started

The runtime repository holds the Kubernetes-native MCP control plane. Every
component builds from one Go module and ships under one version in one Helm
chart.

| Component | Path | Description |
| --- | --- | --- |
| `kavryctl` | `cmd/kavryctl`, `internal/kavryctl` | CLI to validate, register, list, inspect, and remove `MCPServer` resources |
| Gateway | `cmd/gateway`, `internal/gateway` | Routes MCP traffic to `Ready` servers and serves the web console |
| Operator | `cmd/operator`, `internal/operator` | Validates `MCPServer` resources, sets conditions, discovers tools |
| `MCPServer` API | `api/v1alpha1`, `config/` | CRD Go types, CRD schema, and RBAC manifests |
| Helm chart | `charts/kavrynt` | Umbrella chart with the Gateway and Operator subcharts |
| Specs | `specs/` | Feature specifications with requirement IDs |

### Tools you need

| Tool | Minimum version | Purpose |
| --- | --- | --- |
| Go | 1.26 | Building and unit testing |
| Node.js | 22 | Web console unit tests (no npm packages are installed) |
| Docker | any recent | Building runtime images |
| Helm | 3.x or 4.x | Chart linting, templating, and installs |
| kubectl | any recent | Talking to clusters |
| Kind | any recent | Disposable clusters for end-to-end tests |

### Clone and build

Fork the repository on GitHub, then:

```bash
git clone https://github.com/<your-username>/kavrynt.git
cd kavrynt
git remote add upstream https://github.com/kavrynt/kavrynt.git

make help       # list every target
make build      # bin/kavryctl, bin/gateway, bin/operator
make test       # go test -race ./...
```

To see the whole product running, `make demo-up` creates a disposable Kind
cluster with Kavrynt and two demo MCP servers. Kavrynt's Kind workflows create
their own clusters and never touch your current Kubernetes context.

## Development workflow

### Before you start

- Search [issues](https://github.com/kavrynt/kavrynt/issues) first.
- For anything larger than a bug fix, open an issue that describes the problem
  and your proposed approach before you write code.
- **User-visible changes need a spec.** A change to the `MCPServer` API,
  Gateway endpoints or security behavior, the console, `kavryctl` commands, or
  Helm values starts as a reviewed specification in `specs/`.
- Changes to the architecture or security model also need an Architecture
  Decision Record in `docs/`.
- Report security vulnerabilities privately:
  [Reporting vulnerabilities](security-reporting.md).

### Branches

The project uses GitFlow. Branch from the latest `develop`, and name branches
`feature/<short-kebab-case-name>` or `fix/<short-kebab-case-name>`. `main`
holds released versions only.

```bash
git checkout develop
git pull --ff-only upstream develop
git checkout -b feature/my-change
```

### Specs

Kavrynt uses spec-driven development:

```bash
make spec-new NAME=console-tool-catalog   # creates specs/NNNN-console-tool-catalog/spec.md
```

1. Open a pull request with `spec.md` in status `Draft`. Review covers
   behavior only: requirements, acceptance criteria, non-goals, and security.
2. When a maintainer approves, the status becomes `Accepted` and you add
   `plan.md` (and `tasks.md` for multi-PR work).
3. Implement. Each test cites the requirements it verifies, for example
   `// Verifies SPEC-0007-R02.`
4. The final pull request sets the status to `Implemented` and updates the
   docs. `make spec-check` fails if any requirement has no test.

### Conventions

- Keep components separated: the Gateway contains no reconciliation logic, the
  Operator never proxies traffic, and `kavryctl` imports only shared API types.
- Prefer the standard library and simple Go. New dependencies must pass
  `govulncheck` and Trivy.
- Treat Kubernetes manifests, MCP payloads, tool metadata, and Gateway traffic
  as untrusted input.
- Never commit secrets, tokens, kubeconfigs, or private keys, and never log
  secret values.
- Write docs only for what the code does today. Do not describe unimplemented
  features as available.
- The repository is public: keep internal infrastructure, account details, and
  customer names out of code, docs, and commit messages.
- Do not bump versions. Maintainers set the release version at release time.

## Testing

CI runs the same checks as these commands, so running them first saves a
review cycle.

```bash
make test             # unit tests, race detector on
make console-test     # console logic, Node's built-in test runner
make qa               # format, vet, staticcheck, gosec, govulncheck, chart and spec checks
make e2e-kind         # full product loop on a disposable Kind cluster
```

Tests must run without network access: use fake `http.RoundTripper`s and
`t.TempDir()`. `make e2e-kind` is required unless the change cannot affect the
product loop.

## Submitting changes

### Commits and sign-off

Write a clear, imperative subject under about 72 characters, and reference the
spec or issue in the body (`Implements SPEC-0002-R04`, `Fixes #123`).

Every commit must be signed off under the
[Developer Certificate of Origin 1.1](https://developercertificate.org/):

```bash
git commit -s -m "Add a tool catalog to the console"
```

Kavrynt is licensed under the Apache License 2.0. By contributing, you agree
that your contribution is licensed under the same license.

### Pull requests

Open a pull request against `develop` in `kavrynt/kavrynt`. Explain what
changed and why, link the issue and spec, and complete the pull request
checklist. A pull request can merge when:

1. CI is green, including the Kind end-to-end job;
2. every automated review finding is verified, fixed when it holds, and
   replied to on its thread;
3. new behavior has tests that run without network access, citing their spec
   requirements;
4. the docs describe only what the code actually does;
5. every commit is signed off;
6. a maintainer has approved it.

Split large work into a sequence of small pull requests, each independently
reviewable and each leaving `develop` green. Push follow-up commits to the same
branch during review rather than force-pushing.

## Releases

Maintainers cut releases from `main`. Contributors do not bump versions or tag
releases. Published tags are never overwritten; fixes ship in the next
prerelease.

## Code of Conduct

Everyone taking part follows the [Code of Conduct](code-of-conduct.md).
