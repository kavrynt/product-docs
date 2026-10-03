# Operator

The Operator is the Kubernetes controller for `MCPServer` resources.

## Responsibilities

- Validate each `MCPServer` (the API server enforces the same core rules at
  admission).
- Set `Accepted` and `Ready` conditions and `observedGeneration`.

It does not deploy MCP server workloads or manage their secrets: you run your
MCP servers as normal Kubernetes workloads and describe them with an
`MCPServer`.

See the [MCPServer reference](../reference/mcpserver.md).
