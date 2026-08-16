# Quickstart

Use this path when you want to test Kavrynt locally.

## Create A Local Cluster

```bash
kind create cluster --name kavrynt-dev
kubectl cluster-info --context kind-kavrynt-dev
kubectl get nodes
```

## Install Kavrynt

```bash
git clone https://github.com/kavrynt/kavrynt.git
cd kavrynt

helm dependency build charts/kavrynt
helm upgrade --install kavrynt charts/kavrynt \
  --namespace kavrynt-system \
  --create-namespace
```

## Check Pods

```bash
kubectl get pods -n kavrynt-system
kubectl get svc -n kavrynt-system
```

Expected result:

```text
kavrynt-registry   Running
kavrynt-gateway    Running
kavrynt-operator   Running
```

## Deploy A Sample MCP Server

```bash
kubectl create deployment example-mcp-server \
  --image=hashicorp/http-echo:1.0 \
  -- -listen=:8080 -text='{"mock":true,"service":"example-mcp-server"}'

kubectl expose deployment example-mcp-server \
  --port=8080 \
  --target-port=8080
```

## Register With MCPServer

```bash
kubectl apply -f operator/config/samples/kavrynt_v1alpha1_mcpserver.yaml
kubectl get mcpservers
kubectl describe mcpserver example-mcp-server
```

## Test Registry And Gateway

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-registry 18081:8080 >/tmp/kavrynt-registry.log 2>&1 &
registry_pf=$!

kubectl port-forward -n kavrynt-system svc/kavrynt-gateway 18080:8080 >/tmp/kavrynt-gateway.log 2>&1 &
gateway_pf=$!

sleep 3

curl -fsS http://127.0.0.1:18081/v1/servers/example-mcp-server
curl -fsS http://127.0.0.1:18080/v1/routes
curl -fsS http://127.0.0.1:18080/mcp/example-mcp-server

kill "$registry_pf" "$gateway_pf"
```

## Clean Up

```bash
kubectl delete -f operator/config/samples/kavrynt_v1alpha1_mcpserver.yaml
kubectl delete service example-mcp-server
kubectl delete deployment example-mcp-server
helm uninstall kavrynt -n kavrynt-system
kubectl delete namespace kavrynt-system
kind delete cluster --name kavrynt-dev
```

