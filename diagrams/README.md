# Diagrams

Kavrynt architecture diagrams are maintained in two forms:

- `source/`: editable draw.io / diagrams.net source files.
- `exported/`: SVG exports embedded by Markdown documents.

Rules:

1. Keep each `.drawio` source file and `.svg` export together.
2. Name files with the owning document ID first.
3. Use generic infrastructure shapes unless a diagram is explicitly cloud-specific.
4. Use official cloud provider icons only for cloud-specific deployment designs.
5. Update the owning HLD or LLD when a diagram changes.

Current diagrams:

- `HLD-0002-System-Architecture`
- `LLD-0003-Operator-Reconcile`
