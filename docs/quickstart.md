# Quickstart

Run Kavrynt `1.0.0-beta.5` on any Kubernetes cluster, register an MCP server,
call its tools through the Gateway, and open the console. Everything comes
from published, signed images and the Helm chart; you build nothing.

Time: about 15 minutes. To test more (policy, audit, your own server) and
send feedback, continue with [Test Kavrynt](testing.md).

!!! warning "A trial without authentication"
    MCP client authentication is on by default. This quickstart has no
    authorization server, so it installs with
    `--set gateway.auth.enabled=false`: every MCP route then accepts
    unauthenticated calls. Use a disposable or private cluster. For a real
    install, see [Install on Kubernetes](installation.md).

## 1. Get a cluster

You need `kubectl` 1.29+, [Helm](https://helm.sh/) 3.14+, and nodes that can
pull images from `docker.io`. Use any cluster where you can create CRDs and
ClusterRoles. If you have none, create a local one:

=== "Kind"

    ```bash
    kind create cluster --name kavrynt-try
    ```

=== "k3d"

    ```bash
    k3d cluster create kavrynt-try
    ```

=== "minikube"

    ```bash
    minikube start -p kavrynt-try
    ```

=== "Managed or existing"

    EKS, AKS, GKE, OpenShift, Docker Desktop, or your own cluster: use its
    kubeconfig.

Check that `kubectl` points at the cluster you mean:

```bash
kubectl config current-context
kubectl auth can-i create customresourcedefinitions   # expect: yes
```

## 2. Install Kavrynt

```bash
export KAVRYNT_VERSION=1.0.0-beta.5

helm upgrade --install kavrynt oci://registry-1.docker.io/kavrynt/kavrynt \
  --version "$KAVRYNT_VERSION" \
  --namespace kavrynt-system --create-namespace \
  --set gateway.auth.enabled=false \
  --wait --timeout 5m

kubectl get deployments -n kavrynt-system
```

Expected:

```text
NAME               READY   UP-TO-DATE   AVAILABLE
kavrynt-gateway    1/1     1            1
kavrynt-operator   1/1     1            1
```

## 3. Register an MCP server

The sample manifest runs a small MCP server in a new `kavrynt-try`
namespace and registers it as an `MCPServer`. The server has two tools,
`echo` and `admin_reset` (a harmless stand-in for a dangerous tool). It runs
on the public `python` image, so nothing needs building.

```bash
kubectl apply -f https://raw.githubusercontent.com/kavrynt/kavrynt/develop/examples/try/sample-mcp-server.yaml
kubectl -n kavrynt-try rollout status deployment/sample-mcp-server --timeout=180s
kubectl -n kavrynt-try wait mcpserver/sample --for=condition=ToolsDiscovered --timeout=120s
kubectl get mcpservers -A
```

Expected:

```text
NAMESPACE     NAME     TRANSPORT   VERSION   REPORTED   READY   AGE
kavrynt-try   sample   http        1.0.0     1.0.0      True    31s
```

The Operator validated the server, the Gateway routes it, and its tools are
in the status:

```bash
kubectl -n kavrynt-try get mcpserver sample -o jsonpath='{.status.tools[*].name}'; echo
```

Expected: `echo admin_reset`. On OpenShift, if the sample pod is refused,
delete the `runAsUser: 65532` line from the manifest and apply it again.

## 4. Call tools through the Gateway

Forward the Gateway to your machine. If port 18080 is in use, pick another
one.

```bash
kubectl -n kavrynt-system port-forward service/kavrynt-gateway 18080:8080 &
GW=http://127.0.0.1:18080/mcp/kavrynt-try.sample

curl -s -X POST "$GW" -H 'Content-Type: application/json' -H 'MCP-Protocol-Version: 2025-06-18' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

curl -s -X POST "$GW" -H 'Content-Type: application/json' -H 'MCP-Protocol-Version: 2025-06-18' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"echo","arguments":{"message":"hello from Kavrynt"}}}'
```

Expected for the call:
`{"jsonrpc": "2.0", "id": 2, "result": {"content": [{"type": "text", "text": "hello from Kavrynt"}]}}`.

Every server is routed at `/mcp/<namespace>.<name>`. To connect an MCP
client such as an agent framework or IDE, use the Streamable HTTP transport
with this URL.

## 5. Open the console

Open <http://127.0.0.1:18080/ui/> and sign in as `admin` with the password
the chart generated:

```bash
kubectl -n kavrynt-system get secret kavrynt-gateway-console-admin \
  -o jsonpath='{.data.password}' | base64 -d; echo
```

The console shows:

- the server and its tools;
- your calls, with their outcome and latency but never the arguments;
- a playground for calling tools from the browser.

It also warns that MCP routes are not authenticated.

## Clean up

```bash
kill %1 2>/dev/null                        # the port-forward
kubectl delete namespace kavrynt-try
helm uninstall kavrynt -n kavrynt-system
kubectl delete crd mcpservers.kavrynt.io   # Helm keeps it on purpose
kubectl delete namespace kavrynt-system
```

Or delete the whole local cluster.

## Next steps

- [Test Kavrynt](testing.md): policy, audit, your own MCP server, and feedback
- [Install on Kubernetes](installation.md), with client authentication
- [Security](security.md) and [Operations](operations.md)
- [Troubleshooting](troubleshooting.md)
