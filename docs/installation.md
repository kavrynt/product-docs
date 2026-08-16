# Installation

This page installs Kavrynt on a Kubernetes cluster.

Kind is useful for local testing, but Kavrynt is not limited to Kind. The same
Helm install pattern applies to EKS, AKS, GKE, OpenShift, and self-managed
clusters.

## Prerequisites

Install:

- `kubectl`
- `helm`
- Access to a Kubernetes cluster
- Docker and Kind only if you want local testing

Verify your tools:

```bash
kubectl version --client
helm version
kubectl config current-context
kubectl get nodes
```

## Install From Source Chart

The current MVP chart lives in the public Kavrynt monorepo.

```bash
git clone https://github.com/kavrynt/kavrynt.git
cd kavrynt

helm dependency build charts/kavrynt
helm upgrade --install kavrynt charts/kavrynt \
  --namespace kavrynt-system \
  --create-namespace
```

## Verify

```bash
kubectl rollout status deployment/kavrynt-registry -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-gateway -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-operator -n kavrynt-system --timeout=120s

kubectl get crd mcpservers.kavrynt.io
kubectl get pods -n kavrynt-system
kubectl get svc -n kavrynt-system
```

## Install kavryctl

Release install path:

```bash
curl -fsSL https://kavrynt.com/install.sh | sh
export PATH="$HOME/.kavrynt/bin:$PATH"
kavryctl version
```

MVP source fallback:

```bash
git clone https://github.com/kavrynt/kavrynt.git
cd kavrynt
go install ./cmd/kavryctl
kavryctl version
```

## Images

Early MVP images are published under Docker Hub:

```bash
docker pull kavrynt/registry:dev
docker pull kavrynt/gateway:dev
docker pull kavrynt/k8s-operator:dev
```

Use versioned tags once Kavrynt publishes the first stable release.

## Uninstall

```bash
helm uninstall kavrynt -n kavrynt-system
kubectl delete namespace kavrynt-system
```

Only delete a Kind cluster if you created one for local testing.

