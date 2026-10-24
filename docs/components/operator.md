# Operator

The Operator is the Kubernetes controller for `MCPServer` resources.

## Responsibilities

- Validate each `MCPServer` (the API server enforces the same core rules at
  admission).
- Set `Accepted` and `Ready` conditions and `observedGeneration`. A server in
  a namespace outside `global.watchNamespaces` is not `Ready`
  (`NamespaceNotWatched`), because the Gateway does not route it.
- Discover the tools of `Ready` servers with MCP `tools/list` and record them
  in `status.tools`. It also records the name and version each server reports
  in `status.serverInfo`.
    - Discovery sets the `ToolsDiscovered` condition and never changes
      `Ready`.
    - A server that needs a stored credential is discovered with it.
    - A server that needs the caller's token (`spec.tokenExchange`) is not
      discovered (`CallerTokenRequired`).
- Export `kavrynt_operator_mcpserver_ready` per server on its metrics
  Service.
- With `operator.replicaCount` above 1, run a standby that takes over
  through leader election.

It does not deploy MCP server workloads or manage their secrets: you run your
MCP servers as normal Kubernetes workloads and describe them with an
`MCPServer`.

See the [MCPServer reference](../reference/mcpserver.md).
