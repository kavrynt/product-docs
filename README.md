# Kavrynt Docs

This repository publishes the public Kavrynt documentation site at:

https://docs.kavrynt.com

The site is built with MkDocs Material and deployed to GitHub Pages from the
`gh-pages` branch.

## Local Preview

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

Open:

```text
http://127.0.0.1:8000
```

## Build

```bash
mkdocs build --strict
```

The generated site is written to `site/`.

## Deployment

Merging to `main` runs `.github/workflows/deploy-docs.yml`.

The workflow:

1. Installs MkDocs Material.
2. Runs `mkdocs build --strict`.
3. Publishes the generated static site to the `gh-pages` branch.

## GitHub Pages Setup

In the GitHub repository settings:

1. Open `Settings -> Pages`.
2. Set source to `Deploy from a branch`.
3. Select branch `gh-pages`.
4. Select folder `/ (root)`.
5. Set custom domain to `docs.kavrynt.com`.
6. Enable `Enforce HTTPS` after DNS validates.

## DNS Setup

In the DNS provider for `kavrynt.com`, create:

```text
Type:  CNAME
Name:  docs
Value: kavrynt.github.io
TTL:   Auto
```

The `docs/CNAME` file is copied into the published site so GitHub Pages keeps
the custom domain attached to the `gh-pages` branch.
