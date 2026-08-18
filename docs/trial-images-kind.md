# Trial Images On Kind

This runbook lets a developer try Kavrynt without source access. It uses a
disposable Kind cluster and approved alpha or beta trial images.

Kavrynt is a private commercial product. Trial images are for evaluation only.
Use the exact registry and tag provided with your trial access.

## Set Trial Image Inputs

```bash
export KAVRYNT_IMAGE_REGISTRY=docker.io/kavrynt
export KAVRYNT_TRIAL_TAG=0.1.0-beta
```

## Create A Local Cluster

```bash
kind create cluster --name kavrynt-dev
kubectl cluster-info --context kind-kavrynt-dev
kubectl get nodes
```

## Confirm Image Pulls

```bash
docker pull "$KAVRYNT_IMAGE_REGISTRY/registry:$KAVRYNT_TRIAL_TAG"
docker pull "$KAVRYNT_IMAGE_REGISTRY/gateway:$KAVRYNT_TRIAL_TAG"
docker pull "$KAVRYNT_IMAGE_REGISTRY/k8s-operator:$KAVRYNT_TRIAL_TAG"
```

If the registry requires authentication, log in before running the pull checks.

## Deploy Registry And Gateway

```bash
kubectl create namespace kavrynt-system

kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kavrynt-registry
  namespace: kavrynt-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kavrynt-registry
  template:
    metadata:
      labels:
        app: kavrynt-registry
    spec:
      containers:
        - name: registry
          image: ${KAVRYNT_IMAGE_REGISTRY}/registry:${KAVRYNT_TRIAL_TAG}
          imagePullPolicy: IfNotPresent
          args: ["--addr", ":8080", "--data", "/data/registry.json"]
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: kavrynt-registry
  namespace: kavrynt-system
spec:
  selector:
    app: kavrynt-registry
  ports:
    - port: 8080
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kavrynt-gateway
  namespace: kavrynt-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kavrynt-gateway
  template:
    metadata:
      labels:
        app: kavrynt-gateway
    spec:
      containers:
        - name: gateway
          image: ${KAVRYNT_IMAGE_REGISTRY}/gateway:${KAVRYNT_TRIAL_TAG}
          imagePullPolicy: IfNotPresent
          args:
            - --addr
            - :8080
            - --registry-url
            - http://kavrynt-registry.kavrynt-system.svc.cluster.local:8080
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: kavrynt-gateway
  namespace: kavrynt-system
spec:
  selector:
    app: kavrynt-gateway
  ports:
    - port: 8080
      targetPort: 8080
EOF
```

## Verify The Control Plane

```bash
kubectl rollout status deployment/kavrynt-registry -n kavrynt-system --timeout=120s
kubectl rollout status deployment/kavrynt-gateway -n kavrynt-system --timeout=120s
kubectl get pods -n kavrynt-system
kubectl get svc -n kavrynt-system
```

## Deploy A Sample MCP Endpoint

```bash
kubectl create deployment example-mcp-server \
  --image=hashicorp/http-echo:1.0 \
  -- -listen=:8080 -text='{"mock":true,"service":"example-mcp-server"}'

kubectl expose deployment example-mcp-server \
  --port=8080 \
  --target-port=8080
```

## Register The Sample Server

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-registry 18081:8080 >/tmp/kavrynt-registry.log 2>&1 &
registry_pf=$!

sleep 3

curl -fsS -X POST http://127.0.0.1:18081/v1/servers \
  -H 'Content-Type: application/json' \
  --data '{
    "apiVersion":"kavrynt.io/v1alpha1",
    "kind":"MCPServer",
    "metadata":{"name":"example-mcp-server"},
    "spec":{
      "version":"0.1.0",
      "transport":"http",
      "endpoint":"http://example-mcp-server.default.svc.cluster.local:8080"
    }
  }'

kill "$registry_pf"
```

## Test The Gateway Route

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-registry 18081:8080 >/tmp/kavrynt-registry.log 2>&1 &
registry_pf=$!

kubectl port-forward -n kavrynt-system svc/kavrynt-gateway 18080:8080 >/tmp/kavrynt-gateway.log 2>&1 &
gateway_pf=$!

sleep 12

curl -fsS http://127.0.0.1:18081/v1/servers/example-mcp-server
curl -fsS http://127.0.0.1:18080/v1/routes
curl -fsS -X POST http://127.0.0.1:18080/mcp/example-mcp-server \
  -H 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

kill "$registry_pf" "$gateway_pf"
```

Expected proxy response:

```json
{"mock":true,"service":"example-mcp-server"}
```

## Clean Up

```bash
kubectl delete service example-mcp-server
kubectl delete deployment example-mcp-server
kubectl delete namespace kavrynt-system
kind delete cluster --name kavrynt-dev
```
