# Reporting vulnerabilities

Do not open a public issue for a security problem.

Report it privately through
[GitHub private vulnerability reporting](https://github.com/kavrynt/kavrynt/security/advisories/new).
Include:

- the affected version;
- the component (`gateway`, `operator`, `kavryctl`, or the Helm chart);
- reproduction steps;
- the impact you observed.

## What to expect

The maintainers aim to acknowledge a report within 3 business days, and to
share an assessment and a fix plan within 10 business days. Fixes ship in the
next prerelease, and the advisory is published once a fixed version is
available. Reporters are credited unless they ask not to be.

## Supported versions

Kavrynt is in beta. Only the latest prerelease (`1.0.0-beta.N`) receives
security fixes. Fixes are not backported.

## Known limitations

Documented gaps are not vulnerabilities. They are listed in the
[`SECURITY.md`](https://github.com/kavrynt/kavrynt/blob/develop/SECURITY.md)
of the runtime repository, and the controls that address them are described in
[Security](../security.md).

## Verifying releases

Release images and `SHA256SUMS` are signed with Cosign keyless signing from the
release workflow. See [Install on Kubernetes](../installation.md) for the
verification steps.
