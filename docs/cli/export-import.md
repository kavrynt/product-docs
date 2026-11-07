# kavryctl export and import

Move `MCPServer` registrations to a new or rebuilt cluster:

```bash
kavryctl export -A -o mcpservers.yaml      # file mode 0600
# new cluster: install the chart with your values, create the namespaces,
# and fill the upstream credentials Secret with the keys the file names
kavryctl import --dry-run mcpservers.yaml
kavryctl import mcpservers.yaml
```

## export

```bash
kavryctl export -A -o mcpservers.yaml
```

- Writes only names, namespaces, labels, annotations, and `spec`. It never
  reads Secrets; the file's header names the credential keys to provide.
- `spec.environment` values and `spec.args` are written empty and listed in
  annotations, since either can hold a key. Fill them in and remove the
  annotations before importing, or export with `--include-environment` and
  `--include-args` and store the file like a secret.
- An endpoint with a query string is exported as stored, with a warning.

| Flag | Purpose |
| --- | --- |
| `-A` | Export every namespace |
| `-o FILE` | Write to a file, with mode `0600` |
| `--include-environment` | Write `spec.environment` values instead of leaving them empty |
| `--include-args` | Write `spec.args` instead of leaving them empty |

## import

```bash
kavryctl import --dry-run mcpservers.yaml
kavryctl import mcpservers.yaml
```

Checks every document before writing any: validation, duplicates, values
still redacted, missing namespaces, and a server-side dry run. A refused file
changes nothing. Then it creates the servers and reports any that are not
`Ready`.

| Flag | Purpose |
| --- | --- |
| `--dry-run` | Run the checks only |
| `--overwrite` | Update servers that already exist (by default they are skipped) |
| `--wait` | How long to wait for servers to become `Ready` (default `60s`) |

See also [Operations](../operations.md).
