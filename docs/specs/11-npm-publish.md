# Spec 11 — npm publish

**Status:** open

## Goal

Set up the package for publishing to npm. This includes package.json metadata, a publish
workflow, and verification that the published package works correctly as both a CLI tool
and a library import.

## Dependencies

- Spec 10 (CI) complete

## Deliverables

| File | Description |
|------|-------------|
| `package.json` | Updated with publish metadata (keywords, repository, license, files) |
| `.github/workflows/publish.yml` | GitHub Actions workflow for npm publish on release |
| `.npmignore` or `files` field | Ensure only dist/ and necessary files are published |

## Key interfaces / signatures

No new code interfaces.

## Implementation notes

### package.json metadata

Add or verify these fields:
- `license`: `"MIT"`
- `repository`: GitHub repository URL
- `homepage`: GitHub repository URL
- `bugs`: GitHub issues URL
- `keywords`: `["fhir", "hl7", "capability-statement", "health", "interoperability", "cli", "analysis"]`
- `files`: `["dist", "README.md", "LICENSE", "CHANGELOG.md"]`
- `engines`: `{ "node": ">=18" }`

### Publish workflow

Trigger: GitHub release created (tag push matching `v*`).

Steps:
1. Checkout code.
2. Set up Node.js.
3. Install pnpm.
4. Install dependencies.
5. Run full verification (`pnpm typecheck && pnpm lint && pnpm test && pnpm build`).
6. Publish to npm (`pnpm publish --no-git-checks`).

Requires `NPM_TOKEN` secret in GitHub repository settings.

### Pre-publish verification

Before first publish, manually verify:
- `pnpm pack` produces a tarball with the expected contents.
- The tarball does not include tests, examples, docs, or source files.
- The CLI binary works when installed from the tarball.
- The library exports work when imported from the tarball.

### LICENSE file

Create a `LICENSE` file with the MIT license.

## Acceptance criteria

- `pnpm pack` produces a clean tarball.
- Tarball contains: `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, `package.json`.
- Tarball does NOT contain: `src/`, `tests/`, `examples/`, `docs/`, `node_modules/`.
- `npm install ./fhir-capability-analyzer-0.1.0.tgz` works and the CLI is available.
- Publish workflow YAML is valid.

## Do not do

- Do not publish to npm as part of this spec — only set up the infrastructure.
- Do not add automatic version bumping or changelog generation.
- Do not add provenance attestation in v1 (can be added later).
