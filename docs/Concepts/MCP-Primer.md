---
id: CONCEPT-0001
title: Model Context Protocol Primer
status: Draft
owner: Kavrynt Maintainers
created: 2026-08-08
updated: 2026-08-08
reviewers: []
related:
  - PRD-0001
  - RFC-0002
---

# CONCEPT-0001: Model Context Protocol Primer

## Purpose

This document explains the Model Context Protocol concepts Kavrynt must
understand before designing Gateway, Registry, Kubernetes Operator, policy, or
runtime behavior.

It is intentionally educational. It should help the founder and future
contributors explain MCP clearly before Kavrynt builds infrastructure around
it.

## What MCP Is

Model Context Protocol is a protocol for connecting AI applications to external
context and capabilities.

MCP does not define how an AI application chooses an LLM, how it reasons, or how
it manages its full context. It defines how MCP clients and MCP servers exchange
context and capabilities through a protocol.

For Kavrynt, MCP is the starting protocol because it gives us a concrete model
for:

- servers that expose capabilities,
- clients that connect to those servers,
- hosts that coordinate AI application behavior,
- transports that carry protocol messages,
- primitives such as tools, resources, and prompts.

## Core Participants

### MCP Host

The host is the AI application or runtime environment. Examples include an AI
IDE, desktop AI assistant, or agent platform.

The host coordinates user interaction, LLM use, authorization decisions, and
one or more MCP clients.

### MCP Client

The client is the protocol participant that maintains a connection to one MCP
server.

In common MCP architecture, a host creates one client per server connection.
This gives each server an isolated session and keeps boundaries clearer.

### MCP Server

The server exposes context and capabilities to clients.

An MCP server can be:

- a local process using stdio transport,
- a remote service using streamable HTTP transport,
- focused on one domain such as files, source control, databases, observability,
  search, or internal business systems.

## Layers

MCP can be understood in two layers.

### Data Layer

The data layer defines JSON-RPC based messages and protocol semantics,
including:

- initialization,
- capability negotiation,
- server primitives,
- client primitives,
- notifications,
- progress,
- errors.

### Transport Layer

The transport layer defines how messages move between client and server.

Important transports:

- `stdio`: local process communication through standard input and output.
- streamable HTTP: remote communication over HTTP, with streaming support where
  needed.

## Server Primitives

MCP servers commonly expose three core primitive types.

### Tools

Tools are executable functions an AI application can call through MCP.

Examples:

- query a database,
- create a ticket,
- read a repository,
- call an internal API,
- run a search.

Kavrynt implication: tools are high-risk because they perform actions. Kavrynt
policy, authorization, audit, and observability should eventually understand
tool-level access.

### Resources

Resources are data sources that provide context.

Examples:

- file contents,
- database schemas,
- issue metadata,
- deployment state,
- API responses.

Kavrynt implication: resources may expose sensitive data. Kavrynt must
eventually reason about data boundaries, user consent, and least privilege.

### Prompts

Prompts are reusable interaction templates.

Examples:

- standard investigation flows,
- few-shot examples,
- task-specific prompt templates,
- operational workflows.

Kavrynt implication: prompts can shape agent behavior, so versioning and
governance may matter later.

## Client Primitives

MCP also includes client-side capabilities. One important example is sampling,
where a server can ask the client/host to request an LLM completion.

Kavrynt implication: client-side capabilities create governance questions. A
server asking for sampling may need policy, audit, rate limits, and user
consent.

## Lifecycle

A typical MCP session includes:

1. Connection establishment.
2. Initialization.
3. Protocol version negotiation.
4. Capability negotiation.
5. Identity exchange.
6. Primitive discovery, such as `tools/list`.
7. Primitive use, such as `tools/call`.
8. Notifications, progress, or logging as needed.
9. Session termination.

Kavrynt implication: Gateway and Registry designs must decide which lifecycle
parts they understand directly and which parts they treat as opaque traffic.

## Security Model To Understand

MCP enables access to data and actions. That makes security central, not
optional.

Important security questions:

- Who is the user?
- Which host is connecting?
- Which MCP server is being used?
- Which tools/resources/prompts does the server expose?
- Which tool calls are allowed?
- What data can flow to the server?
- What action requires explicit approval?
- What should be audited?
- Where are credentials stored?
- What is local-only versus remote?

Kavrynt must not claim MCP security controls until those controls are designed,
implemented, and tested.

## Kavrynt's Current Relationship To MCP

The current `kavryctl` implementation does not run the MCP protocol yet.

It provides an initial product slice:

```text
MCP server manifest
  -> validate manifest
  -> register metadata locally
  -> list registered servers
  -> inspect registered server metadata
```

This is useful because Kavrynt needs a source of truth for MCP server metadata
before Gateway, Operator, policy, and observability can be designed well.

## Kavrynt Infrastructure Questions

Before building Gateway, Registry service, or Operator, Kavrynt must answer:

- Is Kavrynt acting as an MCP host, an MCP client, a gateway/proxy, or an
  infrastructure control plane around existing hosts and servers?
- Does Gateway terminate MCP protocol sessions or pass them through?
- Does Gateway understand tool/resource/prompt metadata?
- Does Registry store only deployment metadata, or also discovered MCP
  primitives?
- Does Operator deploy MCP servers, Gateway, Registry, or all of them?
- Where does authentication happen?
- Where does authorization happen?
- Where does tool policy enforcement happen?
- What is the first auditable event model?

## Sources

- Model Context Protocol architecture: https://modelcontextprotocol.io/specification/2025-06-18/architecture
- MCP architecture overview: https://modelcontextprotocol.io/docs/learn/architecture
