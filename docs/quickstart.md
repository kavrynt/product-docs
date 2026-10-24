# Quickstart on Kind

Run Kavrynt `1.0.0-beta.1` in a disposable local Kind cluster, register an MCP
server, route a request through the Gateway, and open the console. No source
access is needed: everything comes from published container images and the
Helm chart.

Time: about 10 minutes.

!!! warning "A trial without authentication"
    MCP client authentication is on by default. This trial has no
    authorization server, so it installs with
    `--set gateway.auth.enabled=false`: every MCP route then accepts
    unauthenticated calls. Do this only in a disposable cluster. For a real
    install, see [Install on Kubernetes](installation.md).

## Prerequisites

- Docker
- [Kind](https://kind.sigs.k8s.io/) 0.20 or newer
- `kubectl` 1.29 or newer
- [Helm](https://helm.sh/) 3.14 or newer
- `curl`

```bash
docker version --format '{{.Server.Version}}'
kind version
kubectl version --client
helm version --short
```

## 1. Create a cluster

```bash
kind create cluster --name kavrynt-trial
kubectl config current-context
```

Expected: `kind-kavrynt-trial`.

## 2. Install Kavrynt

```bash
export KAVRYNT_VERSION=1.0.0-beta.1

helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
  --version "$KAVRYNT_VERSION" \
  --namespace kavrynt-system \
  --create-namespace \
  --set gateway.auth.enabled=false \
  --wait --timeout 3m
```

The chart installs the `MCPServer` CRD, the Operator, and the Gateway, pulling
`docker.io/kavrynt/gateway` and `docker.io/kavrynt/operator` at the same
version. Without `gateway.auth.enabled=false` or your authorization server's
settings, the install stops with a message naming both.

Check the runtime:

```bash
kubectl get deployments -n kavrynt-system
kubectl get crd mcpservers.kavrynt.io
```

Expected:

```text
NAME               READY   UP-TO-DATE   AVAILABLE
kavrynt-gateway    1/1     1            1
kavrynt-operator   1/1     1            1
```

## 3. Deploy a test backend

This echo server proves routing. It is not an MCP implementation; any MCP
server that speaks Streamable HTTP works the same way, and the Operator then
lists its tools.

```bash
kubectl create deployment example-mcp-server \
  --image=hashicorp/http-echo:1.0 \
  -- /http-echo -listen=:8080 -text='{"mock":true,"service":"example-mcp-server"}'

kubectl expose deployment example-mcp-server --port=8080 --target-port=8080
kubectl rollout status deployment/example-mcp-server --timeout=120s
```

## 4. Register it as an MCPServer

```bash
kubectl apply -f - <<'EOF'
apiVersion: kavrynt.io/v1alpha1
kind: MCPServer
metadata:
  name: example-mcp-server
  namespace: default
spec:
  version: 0.1.0
  transport: http
  endpoint: http://example-mcp-server.default.svc.cluster.local:8080
EOF

kubectl wait mcpserver/example-mcp-server --for=condition=Ready --timeout=60s
kubectl get mcpservers
```

Expected:

```text
NAME                 TRANSPORT   VERSION   REPORTED   READY   AGE
example-mcp-server   http        0.1.0                True    5s
```

`REPORTED` stays empty and `ToolsDiscovered` is `False` because the echo
server does not speak MCP. A real MCP server shows its reported version, and
its tools appear in `status.tools`.

## 5. Route a request through the Gateway

```bash
kubectl port-forward -n kavrynt-system svc/kavrynt-gateway 18080:8080 >/tmp/kavrynt-gateway.log 2>&1 &
GATEWAY_PF=$!
sleep 3

curl -fsS http://127.0.0.1:18080/v1/routes
curl -fsS -X POST http://127.0.0.1:18080/mcp/default.example-mcp-server \
  -H 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected route list (abridged) and proxied response:

```text
{"routes":[{"name":"default.example-mcp-server","version":"0.1.0","transport":"http",...}]}
{"mock":true,"service":"example-mcp-server"}
```

Routes are namespace-qualified: `/mcp/<namespace>.<name>`.

## 6. Open the console

Open <http://127.0.0.1:18080/ui/> and sign in as `admin` with the password
the chart generated:

```bash
kubectl -n kavrynt-system get secret kavrynt-gateway-console-admin \
  -o jsonpath='{.data.password}' | base64 -d; echo
```

The console shows the server, its conditions, and the call you just made. It
also warns that MCP routes are not authenticated.

## 7. Remove the server

```bash
kubectl delete mcpserver example-mcp-server
sleep 2
curl -fsS http://127.0.0.1:18080/v1/routes
kill "$GATEWAY_PF"
```

Expected: `{"routes":[]}`.

## Clean up

```bash
kind delete cluster --name kavrynt-trial
```

## Next steps

- [Install on any Kubernetes cluster](installation.md), with client
  authentication
- [Security](security.md): authentication, policy, audit, and credentials
- [MCPServer reference](reference/mcpserver.md)
- [Troubleshooting](troubleshooting.md)
