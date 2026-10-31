# Operator

The Operator is the Kubernetes controller for `MCPServer` resources.

## Responsibilities

- Validate each `MCPServer` (the API server enforces the same core rules at
  admission).
- Set `Accepted` and `Ready` conditions and `observedGeneration`. A server in
  a namespace outside `global.watchNamespaces` is not `Ready`
  (`NamespaceNotWatched`), because the Gateway does not route it.
- Check [endpoint scope](../security.md#endpoint-scope): a server whose
  endpoint reaches another namespace is not `Ready` (`EndpointNotAllowed`),
  and neither is one whose token exchange audience is not allowed for its
  namespace (`AudienceNotAllowed`).
- Discover the tools of `Ready` servers with MCP `tools/list` and record them
  in `status.tools`, with their MCP behavior hints. It also records the name
  and version each server reports in `status.serverInfo`.
    - Discovery sets the `ToolsDiscovered` condition and never changes
      `Ready`. A failed discovery shows in the `Discovery` column of
      `kubectl get mcpservers` and in `kavryctl list`, with a message that
      names the cause.
    - A server that needs a stored credential is discovered with it.
    - A server that needs the caller's token (`spec.tokenExchange`) is not
      discovered (`CallerTokenRequired`).
    - A server with `spec.sessionAffinity: MCPSession` is discovered from
      one of its pods.
- Export `kavrynt_operator_mcpserver_ready` and
  `kavrynt_operator_mcpserver_tools_discovered` per server on its metrics
  Service.
- With `operator.replicaCount` above 1, run a standby that takes over
  through leader election.

It does not deploy MCP server workloads or manage their secrets: you run your
MCP servers as normal Kubernetes workloads and describe them with an
`MCPServer`.

See the [MCPServer reference](../reference/mcpserver.md).
