# kavryctl doctor

```bash
kavryctl doctor
kavryctl doctor --anonymize        # safe to paste into a public issue
kavryctl doctor --output json
```

Checks the installation read-only:

- the `MCPServer` CRD;
- the Gateway and Operator Deployments and their versions;
- MCP client authentication;
- every `MCPServer`'s readiness and tool discovery.

Each `warn` or `fail` says what to do and links a runbook. Checks your
credentials may not run are `skipped`. Start here when something is wrong;
see [Troubleshooting](../troubleshooting.md).

## Flags

| Flag | Purpose |
| --- | --- |
| `-n` | Namespace of the Kavrynt release (default `kavrynt-system`) |
| `--release` | Release name (default `kavrynt`) |
| `--output json` | A JSON report (`"type":"kavrynt.doctor.v1"`) |
| `--anonymize` | Replace namespaces and names with per-report hashes and leave out error details, for public issues |

The report never includes condition messages, endpoints, or Secret data.
Attach `kavryctl doctor --anonymize` to bug reports.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Every check passed |
| `1` | A check failed |
| `2` | `doctor` could not start or reach the cluster |
