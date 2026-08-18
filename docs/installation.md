# Installation

This page explains the supported Kavrynt evaluation path.

Kavrynt is a private commercial product. The source repository is not the
developer distribution surface. Early developers evaluate Kavrynt by running
approved alpha or beta trial images in Kubernetes.

Kind is useful for local testing, but Kavrynt is not limited to Kind. The same
image-pull model applies to EKS, AKS, GKE, OpenShift, and self-managed clusters.

## Prerequisites

Install:

- `kubectl`
- Access to a Kubernetes cluster
- Docker and Kind only if you want local testing
- A Kavrynt trial image registry and tag

Verify your tools:

```bash
kubectl version --client
kubectl config current-context
kubectl get nodes
```

## Trial Images

Kavrynt publishes only approved trial images for developer evaluation:

```bash
export KAVRYNT_IMAGE_REGISTRY=docker.io/kavrynt
export KAVRYNT_TRIAL_TAG=0.1.0-beta

docker pull "$KAVRYNT_IMAGE_REGISTRY/registry:$KAVRYNT_TRIAL_TAG"
docker pull "$KAVRYNT_IMAGE_REGISTRY/gateway:$KAVRYNT_TRIAL_TAG"
docker pull "$KAVRYNT_IMAGE_REGISTRY/k8s-operator:$KAVRYNT_TRIAL_TAG"
```

Use the exact registry and tag provided with your trial access.

## Local Kind Runbook

Use [Trial Images on Kind](trial-images-kind.md) for the end-to-end local
runbook. It creates a disposable Kind cluster, pulls the trial images into the
cluster, deploys Registry and Gateway, registers a sample MCP server, validates
the route, and cleans up.

## Verify

```bash
kubectl rollout status deployment/kavrynt-registry -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-gateway -n kavrynt-system --timeout=120s

kubectl get pods -n kavrynt-system
kubectl get svc -n kavrynt-system
```

## Uninstall

```bash
kubectl delete namespace kavrynt-system
```

Only delete a Kind cluster if you created one for local testing.
