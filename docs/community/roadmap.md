# Roadmap

What the runtime does today and what comes next. Items are in priority order
and have no committed dates. An item is marked done only once it is implemented
and covered by the Kind end-to-end tests. The source is
[`ROADMAP.md`](https://github.com/kavrynt/kavrynt/blob/develop/ROADMAP.md).

## Available today

For the full feature list, see [Overview](../overview.md) and
[Release notes](../release-notes.md). In short:

- the `MCPServer` resource, validated by the Operator, with tool discovery;
- Gateway routing at `/mcp/<namespace>.<name>`, with MCP Streamable HTTP
  checks and a request size limit;
- MCP client authentication (OAuth 2.1), on by default;
- opt-in tool authorization policy (Rego) and hash-chained audit events;
- upstream credentials and token exchange (RFC 8693);
- endpoint scope and NetworkPolicies that keep traffic on the Gateway;
- a web console, metrics, Grafana dashboards, and alerts with runbooks;
- a tested high-availability profile with MCP session affinity;
- signed multi-architecture images, an OCI Helm chart, and checked upgrades
  and rollbacks with `kavryctl`.

## Next

1. Approvals for sensitive tool calls.
2. Audit delivery to Kavrynt Cloud, and usage events.
3. More installation checks in `kavryctl doctor` (policy, audit, and
   NetworkPolicy settings).

## Project and community

- Apply to the CNCF Sandbox once the project has outside maintainers and
  adopters.
- Grow the maintainer group beyond one organization.
- Publish an adopters list once there are production or evaluation users who
  agree to be named.

Propose roadmap changes by
[opening an issue](https://github.com/kavrynt/kavrynt/issues/new/choose).
