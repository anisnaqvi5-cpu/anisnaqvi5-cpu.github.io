# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This is `anisnaqvi5-cpu/anisnaqvi5-cpu.github.io` — a GitHub Pages **user site** repository. Because the repo name matches `<username>.github.io`, GitHub Pages serves its contents directly at `https://anisnaqvi5-cpu.github.io/` from the `main` branch, with no build step required unless one is added later.

The repository is currently just scaffolding — there is no site content (no `index.html`, no static site generator, no framework, no package manifest) and no build/lint/test tooling. There is nothing to build, lint, or test yet. When adding the first real content, keep this in mind: any HTML/CSS/JS placed at the repo root will be served as-is by GitHub Pages.

## Current contents

- `.nojekyll` — empty marker file that tells GitHub Pages to skip Jekyll processing and serve files (including any starting with `_`) as-is. Keep this file if you add non-Jekyll static content (e.g. a plain HTML/JS site, or a build output that includes underscore-prefixed asset folders).
- `.well-known/assetlinks.json` — a Digital Asset Links file for Android App Links verification. It declares that the Android app `pk.noorsaba.app` (identified by its signing certificate SHA-256 fingerprint) is permitted to handle URLs for this domain. This file must remain served at exactly `/.well-known/assetlinks.json` for Android App Links to verify — don't move or rename it, and don't change the `package_name`/fingerprint values without confirming with the user, since a mismatch breaks app-link verification for a real published app.

## Working in this repo

- Since Pages serves `main` directly (no Actions workflow currently configured), any file committed to `main` at a path becomes live at that path on the site. Treat commits to `main` as publishing.
- If a static site generator, framework, or build pipeline is introduced later, update this file with the actual build/dev/test commands at that time — do not invent them now.
