# kavryctl

`kavryctl` is the Kavrynt CLI for developers and platform teams. It:

- validates `MCPServer` manifests offline;
- registers, lists, inspects, and removes them in a cluster, using your
  kubeconfig and RBAC;
- checks an installation read-only (`kavryctl doctor`);
- exports registrations as manifests and imports them into a new or rebuilt
  cluster;
- verifies Gateway audit chains;
- upgrades and rolls back the Kavrynt release, with checks before and after.

Helm installs Kavrynt. See the [CLI reference](../reference/kavryctl.md).
