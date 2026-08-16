# Troubleshooting

## Pods Are Not Running

Check pod status:

```bash
kubectl get pods -n kavrynt-system
kubectl describe pod -n kavrynt-system <pod-name>
kubectl logs -n kavrynt-system <pod-name>
```

## Wrong Kubernetes Cluster

Confirm your active context:

```bash
kubectl config current-context
kubectl get nodes
```

If the context is wrong, switch it before installing Kavrynt.

## Cannot Reach Registry

Use port-forwarding:

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-registry 18081:8080
curl -fsS http://127.0.0.1:18081/v1/servers
```

## Cannot Reach Gateway

Use port-forwarding:

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-gateway 18080:8080
curl -fsS http://127.0.0.1:18080/v1/routes
```

## Helm Install Failed

Render the chart locally:

```bash
helm dependency build charts/kavrynt
helm template kavrynt charts/kavrynt --namespace kavrynt-system
```

Then retry:

```bash
helm upgrade --install kavrynt charts/kavrynt \
  --namespace kavrynt-system \
  --create-namespace
```

## DNS For docs.kavrynt.com Does Not Work

Check the DNS record:

```text
Type:  CNAME
Name:  docs
Value: kavrynt.github.io
```

After DNS is configured, set the GitHub Pages custom domain to:

```text
docs.kavrynt.com
```

