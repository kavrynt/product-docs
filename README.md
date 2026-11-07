# Kavrynt Docs

This repository publishes the Kavrynt documentation site at:

https://docs.kavrynt.com

The site is built with MkDocs Material and published with GitHub Pages
deployments from GitHub Actions. No generated files are committed.

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
3. Uploads the site as a Pages artifact and deploys it (pull requests only
   build).

## Site Features

- Light, dark, and system themes from the header toggle.
- Top-level `nav` entries in `mkdocs.yml` are the header tabs.
- The header shows the `kavrynt/kavrynt` repository (latest release, stars,
  forks) from `repo_url`, then icon links from `extra.header_links`. A link
  with an empty `url` is hidden; `header: false` keeps a link in the footer's
  Community column only. Set the Discord invite URL there to show it.
- "Ask AI" (Kapa.ai) loads only when `extra.ask_ai.website_id` is set. Create
  a Kapa project, add the docs site as a source, allow the docs domain (and
  `127.0.0.1` for local preview), and paste the website ID.
- Moved pages keep their old URLs through `mkdocs-redirects`
  (`plugins.redirects.redirect_maps`).
- The navigation sidebar collapses on wide screens with the button at its
  bottom (`docs/assets/javascripts/sidebar.js`).
- `docs/overrides/partials/header.html` and `footer.html` are copies of the
  Material 9.7.7 partials with marked Kavrynt changes. Re-copy them when
  upgrading Material.

## GitHub Pages Setup

In the GitHub repository settings:

1. Open `Settings -> Pages`.
2. Set source to `GitHub Actions`.
3. Set custom domain to `docs.kavrynt.com`.
4. Enable `Enforce HTTPS` after DNS validates.

## DNS Setup

In the DNS provider for `kavrynt.com`, create:

```text
Type:  CNAME
Name:  docs
Value: kavrynt.github.io
TTL:   Auto
```

The `docs/CNAME` file is copied into the published site so GitHub Pages keeps
the custom domain attached.
