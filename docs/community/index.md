# Community

Where to talk to the Kavrynt project, how to take part, and where decisions
are recorded.

Kavrynt is an open source project under the Apache License 2.0. The
[Code of Conduct](code-of-conduct.md) governs every channel. If you are new to
the project, start at [Contributing](contributing.md).

## Channels

| Channel | Use it for |
| --- | --- |
| [GitHub Issues](https://github.com/kavrynt/kavrynt/issues) | Reproducible bugs, feature requests, and tester feedback, filed through the issue forms |
| [Pull requests](https://github.com/kavrynt/kavrynt/pulls) | Code, spec, and documentation changes. See [Contributing](contributing.md) |
| [Security advisories](https://github.com/kavrynt/kavrynt/security/advisories/new) | Vulnerabilities, reported privately. See [Reporting vulnerabilities](security-reporting.md) |
| [Email](mailto:support@kavrynt.com) | Code of Conduct reports and questions that do not fit a public channel |

!!! note "Never report a vulnerability in a public issue"
    Use [private vulnerability reporting](security-reporting.md) instead.

## Issue forms

Pick the form that matches what you have:

- **Bug report:** something does not work as documented.
- **Feature request:** a capability you need, with the problem it solves.
- **Tester feedback:** you tried Kavrynt, for example with the
  [Test Kavrynt runbook](../testing.md), and want to say what worked, what did
  not, and what you need. Short answers are fine.

Remove secrets, tokens, and internal hostnames from anything you paste.

## Decision records

Decisions are written down where the code lives, in
[`kavrynt/kavrynt`](https://github.com/kavrynt/kavrynt):

| Record | What it holds |
| --- | --- |
| `specs/` | Feature specifications with requirement IDs. Every user-visible change starts as a reviewed spec |
| `docs/ADR-*.md` | Architecture Decision Records for the API, the security model, and the architecture |
| [`ROADMAP.md`](roadmap.md) | What the runtime does today and what comes next |
| [`GOVERNANCE.md`](governance.md) | Roles, how decisions are made, and how maintainers are added |

## Where to go next

<div class="grid cards" markdown>

-   :material-source-pull:{ .lg .middle } __Contributing__

    ---

    Set up your environment, make a change, test it, and open a pull request.

    [:octicons-arrow-right-24: Contributing](contributing.md)

-   :material-account-group-outline:{ .lg .middle } __Governance__

    ---

    Roles, decision making, and how to become a maintainer.

    [:octicons-arrow-right-24: Governance](governance.md)

-   :material-map-outline:{ .lg .middle } __Roadmap__

    ---

    What is available today and what comes next.

    [:octicons-arrow-right-24: Roadmap](roadmap.md)

</div>
