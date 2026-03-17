# ORCHESTRATOR.md — fhir-capability-analyzer build guide

## What this is

This file is the entry point for any AI session tasked with building or extending `fhir-capability-analyzer`.
Read this first. Then read the spec for the specific deliverable you are implementing.

## Project in one paragraph

`fhir-capability-analyzer` is a TypeScript CLI and reusable library for fetching FHIR CapabilityStatements,
analyzing server capabilities, detecting international profile conformance, and producing human-readable
reports. The core logic is **browser-safe** so it can be shared between the CLI and a future browser-based
tool. The CLI is a thin Node.js adapter on top of that shared core.
See `docs/PROJECT.md` for the full project spec. See `AGENTS.md` for coding conventions.

## Mandatory reading before any session

1. `AGENTS.md` (root) — conventions, constraints, quality bar
2. The relevant `src/*/AGENTS.md` for the module you are working in
3. The spec file for your assigned deliverable (`docs/specs/NN-name.md`)

---

## Build order and dependency graph

Specs must be executed in order. Each spec lists its own dependencies, but the canonical order is:

### Phase 1 — Foundation

```
00-project-setup           (no dependencies)
       │
01-core-types              (depends on: 00)
       │
       ├──── 02-fetch-parse        (depends on: 01)
       │
       ├──── 03-profile-registry   (depends on: 01)
       │
       └──── 04-analyze            (depends on: 01, 02, 03)
```

### Phase 2 — Output and comparison

```
       04-analyze
           │
    ┌──────┴──────┐
05-formatters   06-compare       (05 depends on: 01, 04; 06 depends on: 01, 04)
    │               │
    └──────┬────────┘
        07-cli                   (depends on: 02, 04, 05, 06)
```

### Phase 3 — Publishing

```
        07-cli
           │
    ┌──────┴──────────┐
08-examples-fixtures  09-readme  (both depend on: 07)
           │
        10-ci                    (depends on: 08)
           │
        11-npm-publish           (depends on: 10)
```

**Rule:** Do not start a spec until all specs above it in the graph are complete and verified.

**Parallelization guide:**
- Specs 02, 03 depend only on 01 and can run in parallel with each other.
- Spec 04 depends on 01, 02, and 03 — must wait for all three.
- Specs 05 and 06 both depend on 04 and can run in parallel with each other.
- Spec 07 depends on 02, 04, 05, and 06.
- Specs 08 and 09 both depend on 07 and can run in parallel with each other.

---

## Spec file template

Every spec in `docs/specs/` follows this structure so sessions can parse them reliably:

- **Goal** — what this deliverable produces
- **Dependencies** — what must already exist
- **Deliverables** — exact files to create or modify
- **Key interfaces / signatures** — TypeScript types or function signatures to implement
- **Implementation notes** — constraints, design decisions, FHIR-specific guidance
- **Acceptance criteria** — verifiable checks (commands to run, output to expect)
- **Do not do** — explicit out-of-scope items

---

## Handoff protocol

### Before starting a session

1. Run `pnpm build` and `pnpm test` — confirm the baseline is clean (or note any pre-existing failures).
2. Read the spec you are implementing top to bottom.
3. Check `git status` — confirm you are starting from a clean working tree.

### During a session

- Implement one spec at a time. Do not combine multiple specs in one session unless they are trivially small.
- Write or update tests alongside the implementation, not after.
- Commit when a meaningful unit of work is complete and tests pass.
- Commit messages: imperative, concise. Example: `add core analysis engine with profile detection`.

### Before ending a session

Run these checks and confirm all pass before stopping:

```bash
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm test          # vitest
pnpm build         # tsup
```

If any check fails, fix it before ending the session. Do not leave failing checks as a known issue
unless it is genuinely blocked by an upstream dependency that hasn't been implemented yet — in that
case, document it explicitly in a `TODO` comment with the blocking spec number.

---

## What "done" means for the whole project (v1)

The project is considered v1-complete when:

- [ ] `pnpm build` succeeds and produces a working CLI binary
- [ ] `pnpm test` passes with coverage of all core modules
- [ ] `fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4` produces a readable capability report
- [ ] `fhir-capability-analyzer analyze ./examples/hapi-r4.json` works with a local file
- [ ] `fhir-capability-analyzer analyze URL --format json` produces stable JSON output
- [ ] `fhir-capability-analyzer analyze URL --format markdown` produces markdown output
- [ ] `fhir-capability-analyzer compare URL1 URL2` produces a comparison report
- [ ] Profile detection correctly identifies US Core, UK Core, AU Core, IPS, and ISiK profiles
- [ ] README accurately describes the tool and includes working examples
- [ ] No TypeScript errors, no lint errors
- [ ] No Node-specific imports in `src/core/`, `src/registry/`, or `src/formatters/`

---

## Spec index

### Phase 1 — Foundation

| # | Spec | Key deliverable | Status |
|---|------|----------------|--------|
| 00 | `00-project-setup.md` | package.json, tsconfig, eslint, prettier, vitest | open |
| 01 | `01-core-types.md` | All shared TypeScript types and interfaces | open |
| 02 | `02-fetch-parse.md` | Fetch and parse CapabilityStatement from URL or JSON | open |
| 03 | `03-profile-registry.md` | Known profile URL → name/country registry | open |
| 04 | `04-analyze.md` | Core analysis engine producing AnalysisReport | open |

### Phase 2 — Output and comparison

| # | Spec | Key deliverable | Status |
|---|------|----------------|--------|
| 05 | `05-formatters.md` | Text, JSON, and markdown output renderers | open |
| 06 | `06-compare.md` | Compare two CapabilityStatements | open |
| 07 | `07-cli.md` | CLI commands: analyze, compare | open |

### Phase 3 — Publishing

| # | Spec | Key deliverable | Status |
|---|------|----------------|--------|
| 08 | `08-examples-fixtures.md` | Sample CapabilityStatements and test fixtures | open |
| 09 | `09-readme.md` | Root README.md | open |
| 10 | `10-ci.md` | GitHub Actions CI workflow | open |
| 11 | `11-npm-publish.md` | npm publishing setup | open |
