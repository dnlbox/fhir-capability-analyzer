# Contributing to fhir-capability-analyzer

Thank you for your interest in contributing. This document explains what kind of project this is,
what contributions are welcome, and what is intentionally out of scope.

---

## What kind of project this is

Two principles shape every decision.

### Browser-safe functional core

The project is split into distinct layers:

```
src/core/        browser-safe functional core — no I/O, no side effects
src/registry/    browser-safe profile registry — pure data
src/formatters/  output renderers — browser-safe
src/cli/         thin Node.js adapter — file I/O, flags, exit codes only
```

No code under `src/core/`, `src/registry/`, or `src/formatters/` imports Node.js APIs.
This is what makes the library usable in browsers, Cloudflare Workers, and Deno without
configuration. A contribution that introduces `fs`, `path`, `process`, or any Node built-in
into those directories will be declined regardless of how useful the feature is.

### Curated, not exhaustive

This tool does not aim to be a full FHIR validator. The
[HL7 FHIR Validator](https://confluence.hl7.org/display/FHIR/Using+the+FHIR+Validator)
already does that. What this tool does: analyze what a server *declares* it supports,
detect known profile families, and surface common configuration issues — all without
StructureDefinition parsing, package downloads, or a Java runtime.

---

## What contributions are welcome

**Genuinely welcome:**
- New profile families in the registry (`src/registry/profiles.ts`) — add a data entry
- New warning rules in `analyze.ts` that catch real configuration issues
- New CLI flags or output format improvements
- Bug fixes in parse, compare, or formatter logic
- Additional test coverage for edge cases

**Welcome, but open an issue first:**
- New commands — align on scope before building
- Changes to core type interfaces — these affect library consumers
- New output formats

**Out of scope — will not be accepted:**
| Contribution | Why |
|---|---|
| StructureDefinition loading or parsing | Changes the fundamental character of the tool |
| Authentication against secured FHIR servers (v1) | Significant scope increase; planned for post-0.1.0 |
| XML ↔ JSON conversion | Use the [`fhir`](https://www.npmjs.com/package/fhir) package |
| FHIRPath evaluation | Use [`@medplum/core`](https://www.npmjs.com/package/@medplum/core) |
| Full terminology validation | Requires live terminology server |

---

## Setup

```bash
git clone https://github.com/dnlbox/fhir-capability-analyzer.git
cd fhir-capability-analyzer
pnpm install
```

Run the CLI from source:
```bash
pnpm cli -- analyze examples/hapi-r4.json
pnpm cli -- compare examples/hapi-r4.json examples/us-core-server.json
```

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm cli -- <args>` | Run CLI from source (no build needed) |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm build` | Production build |

## Before submitting

All four checks must pass:
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Tests in `src/core/` should be pure unit tests — no network calls, no file I/O.
Use the fixtures in `examples/` for integration-style tests, not live servers.

---

## Code style

**Pure functions over classes.** State is passed as parameters. `src/core/` has no classes.

**Guard clauses over nesting.** Handle edge cases first, return early, keep happy path at lowest indent.

**Named constants for patterns.** Regex and opaque literals become named constants before use.

**No `any`.** The ESLint rule is set to `error`. If you genuinely need to escape the type system,
add a comment explaining why.

**Explicit return types** on all exported functions.

---

## The scope test

When unsure whether a contribution fits, ask:

> *Does this help a developer understand what a FHIR server supports, without requiring
> a running server, a package download, or a Java runtime?*

If yes — open an issue or PR. If no — it's probably out of scope.
