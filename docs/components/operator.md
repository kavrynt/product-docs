# Operator

Operator makes Kavrynt Kubernetes-native.

It watches `MCPServer` custom resources and syncs the desired state into
Registry.

## Responsibilities

- Watch `MCPServer` resources.
- Reconcile desired state.
- Register or update records in Registry.
- Report status back to Kubernetes resources.

## Runtime

Operator runs in Kubernetes as:

```text
deployment/kavrynt-operator
```

The CRD is:

```text
mcpservers.kavrynt.io
```

## Example Flow

```text
kubectl apply -f mcpserver.yaml
  -> Operator receives event
  -> Operator validates desired state
  -> Operator writes record to Registry
  -> Gateway can route traffic
```

## Future Work

- Better status conditions
- Retry backoff
- Finalizers for cleanup
- Admission validation
- Policy checks before registration

