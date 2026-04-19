# AGENTS.md — fhir-capability-analyzer

## Project overview

A TypeScript-first CLI **and** reusable library for fetching FHIR CapabilityStatements, analyzing
server capabilities, detecting international profile conformance, and producing human-readable reports.
The core logic is designed to be **shared** between the CLI (Node.js) and a future browser-based tool
where analysis happens entirely on the client side.

## Architecture (four layers)

```
src/core/        → shared, browser-safe logic (fetch, parse, analyze, compare, types)
src/registry/    → known profile URL registry — also browser-safe
src/formatters/  → output renderers (text, JSON, markdown) — also browser-safe
src/cli/         → Node-only CLI adapter (file I/O, flags, exit codes)
```

**Rule:** All code under `src/core/`, `src/registry/`, and `src/formatters/` MUST be browser-safe.
Do not import `node:fs`, `node:path`, `node:process`, or any Node-built-in there.
The CLI adapter is the only place that may use Node-specific APIs.

## Stack

| Tool | Purpose |
|------|---------|
| TypeScript (strict) | Language |
| pnpm | Package manager |
| tsup | Build / bundling |
| vitest | Tests |
| eslint + prettier | Linting / formatting |
| zod | Config and schema validation where helpful |
| commander | CLI framework |
| picocolors | Terminal colors (CLI only) |

## Coding conventions

- **No `any`** unless clearly unavoidable and commented with a reason.
- **Explicit return types** on all exported functions.
- **Small, focused modules** — one concept per file.
- **Types-first design** — define the type/interface, then implement.
- **No side effects at import time** — a module should do nothing just by being imported.
- **Pure functions preferred** — especially in `src/core/` and `src/registry/`.
- **Named exports only** — no default exports.
- **Comments** only for non-obvious intent, trade-offs, or constraints. Never narrate what the code does.

## Quality bar

- Code should look like it was written by a senior engineer for a public open-source utility.
- Prefer **clearer architecture** over more features.
- Prefer **maintainability** over cleverness.
- Prefer **core correctness** over UI polish.
- Every exported function should have at least one corresponding test.

## Maintainer operating mode

- Follow root workspace governance in `../AGENTS.md` for role, skills, and communication expectations.
- Operate with an open-source maintainer mindset: protect API behavior, keep scope focused, and preserve long-term maintainability.
- Prefer `git` + `gh` CLI for GitHub interactions (`git` for repo operations, `gh` for issues/PRs/releases/auth).
- Log maintainer sessions to `../SESSION_LOG.md` with actor `dnlbox`.

## Commit and PR discipline

- Small, focused commits — one logical change per commit.
- Commit messages: imperative mood, concise summary line, optional body for "why".
- Do not commit generated files, secrets, or proprietary data.

## Changelog discipline

**Every user-facing change must be recorded in `CHANGELOG.md` under `[Unreleased]`
in the same commit that introduces the change.** This applies to any agent or
contributor, not just humans.

User-facing changes include: new features, bug fixes, behaviour changes, new CLI
flags, new analysis rules, output format changes, and performance improvements
visible to users.

Does NOT require a changelog entry: internal refactors with no observable
behaviour change, test-only changes, documentation-only changes, dependency
bumps with no user impact.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):
use `### Added`, `### Changed`, `### Fixed`, or `### Removed` under
`## [Unreleased]`. When a release is cut, the maintainer moves `[Unreleased]`
items into a versioned section.

If you are implementing a spec and are unsure whether something is user-facing:
err on the side of adding it.

## What NOT to do

- Do not add full FHIR specification validation in v1.
- Do not add authentication against secured FHIR servers.
- Do not add a web frontend until the CLI and core are solid.
- Do not create placeholder directories or files with no real implementation.
- Do not use Node-specific APIs in `src/core/`, `src/registry/`, or `src/formatters/`.
- Do not attempt to resolve or download Implementation Guide packages.
