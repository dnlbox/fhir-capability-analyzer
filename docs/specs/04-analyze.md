# Spec 04 — Analyze

**Status:** open

## Goal

Implement the core analysis engine that takes a parsed `ServerCapability` and produces an
`AnalysisReport` — the main value proposition of the tool. This is where raw capability data
becomes actionable insight.

## Dependencies

- Spec 01 (core types) complete
- Spec 02 (fetch-parse) complete
- Spec 03 (profile-registry) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/core/analyze.ts` | Core analysis engine |
| `tests/analyze.test.ts` | Tests for analysis logic |

## Key interfaces / signatures

```typescript
/**
 * Analyze a parsed ServerCapability and produce an AnalysisReport.
 * Pure function — no side effects, no network calls.
 */
export function analyze(capability: ServerCapability): AnalysisReport;
```

## Implementation notes

### Analysis pipeline

The `analyze` function performs these steps:

1. **Summary counts**: Count resources, operations, search parameters, profiles, interactions.

2. **Profile conformance detection**: Collect all profile URLs from:
   - `capability.instantiates`
   - `capability.implementationGuide`
   - Each resource's `profile` and `supportedProfiles`
   Pass the collected URLs to `detectProfiles()` from the registry module.

3. **Security analysis**: Summarize CORS status and authentication services.

4. **Warning generation**: Flag common issues:
   - Resource declares interactions but has zero search parameters
   - Resource has `search-type` interaction but zero search parameters
   - No security configuration declared (CORS false, no services)
   - CapabilityStatement has `status: draft`
   - Server declares no resources
   - FHIR version is missing or unrecognized

### Warning rules

Warnings are strings. Each warning should be concise and actionable. Examples:
- `"Patient: declares search-type interaction but has no search parameters"`
- `"No security configuration declared — CORS disabled and no authentication services"`
- `"CapabilityStatement status is 'draft' — may not reflect production capabilities"`
- `"Server declares no resources in its REST capabilities"`
- `"Observation: has 15 search parameters but does not declare search-type interaction"`

### Browser safety

- No Node imports. The analysis engine is pure computation over data.
- Import `detectProfiles` from the registry module.

### Separation of concerns

- The analyze function produces an `AnalysisReport` data structure. It does NOT format output.
  Formatting is spec 05's responsibility.
- The analyze function does NOT fetch data. It operates on an already-parsed `ServerCapability`.
- The analyze function does NOT compare two capabilities. That is spec 06's responsibility.

## Acceptance criteria

```bash
pnpm typecheck    # passes
pnpm test         # analyze tests pass
```

Tests should cover:
- Minimal ServerCapability (one resource, no profiles) produces a valid AnalysisReport.
- Summary counts are correct for a multi-resource capability.
- Profile conformance detection works end-to-end: a capability with US Core profile URLs
  produces detected US Core conformance in the report.
- Warnings are generated for:
  - Resource with search-type but no search params.
  - No security configuration.
  - Draft status.
  - No resources declared.
- A well-configured server (good security, search params, profiles) produces zero warnings.

## Do not do

- Do not format output — that is spec 05.
- Do not fetch from network — that is spec 02.
- Do not compare two capabilities — that is spec 06.
- Do not validate the CapabilityStatement against the FHIR schema — only analyze what is present.
- Do not import Node-specific modules.
