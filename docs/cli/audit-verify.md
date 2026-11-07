# kavryctl audit verify

```bash
kavryctl audit verify gateway.log
```

Or read the Gateway's logs from standard input:

```bash
kubectl -n kavrynt-system logs -l app.kubernetes.io/name=gateway --prefix=false --tail=-1 \
  | kavryctl audit verify
```

When nothing is wrong, the output ends with `every chain verifies`.

Reads Gateway logs (other lines are skipped), checks every Gateway instance's
SHA-256 chain, and prints each gap, reordering, or altered event. It exits
`1` when it finds one.

Events from a newer Gateway with fields this version does not know verify as
written; the count of such fields is printed. Unknown or repeated fields
count as altered unless the line verifies exactly as written.

See [Audit events](../security.md#audit-events) for what each event records.
