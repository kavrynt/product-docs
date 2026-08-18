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

## Trial Image Pull Failed

Check the image registry and tag from your trial access:

```bash
echo "$KAVRYNT_IMAGE_REGISTRY"
echo "$KAVRYNT_TRIAL_TAG"
docker pull "$KAVRYNT_IMAGE_REGISTRY/registry:$KAVRYNT_TRIAL_TAG"
docker pull "$KAVRYNT_IMAGE_REGISTRY/gateway:$KAVRYNT_TRIAL_TAG"
```

If your trial registry requires authentication, log in with the credentials
provided for the trial before retrying the pull.

## Trial Deployment Failed

Check the workload rollout and recent events:

```bash
kubectl rollout status deployment/kavrynt-registry -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-gateway -n kavrynt-system --timeout=120s
kubectl get events -n kavrynt-system --sort-by=.lastTimestamp
```

## DNS For docs.kavrynt.com Does Not Work

Check the DNS record:

```text
Type:  CNAME
Name:  docs
Value: <hosting-provider-target>
```

After DNS is configured, set the hosting custom domain to:

```text
docs.kavrynt.com
```
