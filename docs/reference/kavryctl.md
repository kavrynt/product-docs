# kavryctl CLI Reference

This reference documents the intended MVP command shape.

!!! note
    Command flags may change while Kavrynt is in early MVP development.

## Version

```bash
kavryctl version
```

## Register

```bash
kavryctl register \
  --registry http://127.0.0.1:18081 \
  --name example-mcp-server \
  --endpoint http://example-mcp-server.default.svc.cluster.local:8080
```

## Unregister

```bash
kavryctl unregister \
  --registry http://127.0.0.1:18081 \
  --name example-mcp-server
```

## List

```bash
kavryctl list --registry http://127.0.0.1:18081
```

## Inspect

```bash
kavryctl get example-mcp-server --registry http://127.0.0.1:18081
```

