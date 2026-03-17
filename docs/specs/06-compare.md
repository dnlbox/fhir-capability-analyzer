# Spec 06 — Compare

**Status:** open

## Goal

Implement comparison logic that takes two `AnalysisReport` objects (or two `ServerCapability` objects)
and produces a `ComparisonReport` detailing the differences. This enables the "how do these two servers
differ?" use case.

## Dependencies

- Spec 01 (core types) complete
- Spec 04 (analyze) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/core/compare.ts` | Comparison engine |
| `tests/compare.test.ts` | Tests for comparison logic |

## Key interfaces / signatures

```typescript
/**
 * Compare two AnalysisReports and produce a ComparisonReport.
 * Uses report A as the baseline and report B as the target.
 * "Added" means present in B but not A. "Removed" means present in A but not B.
 */
export function compare(a: AnalysisReport, b: AnalysisReport): ComparisonReport;
```

## Implementation notes

### Comparison dimensions

The comparison checks these aspects:

1. **FHIR version**: If different, produce a `fhir-version` changed entry.

2. **Formats**: Detect added/removed format support.

3. **Resources**: Compare resource types present in each server.
   - Resource in B but not A → `added` with category `resource`.
   - Resource in A but not B → `removed` with category `resource`.
   - Resource in both → compare their interactions, search params, operations, and profiles.

4. **Interactions per resource**: For resources present in both, compare interaction lists.
   - Interaction in B but not A → `added` with category `interaction`, path includes resource type.
   - Interaction in A but not B → `removed` with category `interaction`.

5. **Search parameters per resource**: For resources present in both, compare search param lists.
   - Search param in B but not A → `added` with category `search-param`.
   - Search param in A but not B → `removed` with category `search-param`.

6. **Operations**: Compare system-level and resource-level operations.
   - Same added/removed pattern.

7. **Profiles**: Compare detected profile conformance.
   - Profile standard in B but not A → `added` with category `profile`.
   - Profile standard in A but not B → `removed` with category `profile`.

8. **Security**: Compare CORS and security services.

### Path notation

The `path` field in `ComparisonDifference` uses dot notation to describe where the difference is:
- `"Patient"` — the Patient resource itself
- `"Patient.interactions.delete"` — the delete interaction on Patient
- `"Patient.searchParams.birthdate"` — the birthdate search parameter on Patient
- `"operations.$everything"` — system-level $everything operation
- `"security.cors"` — CORS setting
- `"fhirVersion"` — top-level FHIR version

### Comparison is symmetric in structure, not direction

The function always treats `a` as the baseline and `b` as the target. The caller is responsible
for knowing which is which. The CLI (spec 07) will label them in its output.

### Browser safety

- No Node imports. Pure function over data structures.

## Acceptance criteria

```bash
pnpm typecheck    # passes
pnpm test         # compare tests pass
```

Tests should cover:
- Two identical reports produce an empty ComparisonReport (no added, removed, or changed).
- Server B has an extra resource → appears in `added`.
- Server A has a resource that B lacks → appears in `removed`.
- Same resource in both but B has an extra interaction → appears in `added`.
- Same resource in both but A has a search param that B lacks → appears in `removed`.
- Different FHIR versions → appears in `changed`.
- Different CORS settings → appears in `changed`.
- Different profile conformance → appropriate added/removed entries.
- Real-world-ish scenario: two servers with overlapping but different capabilities produce a
  report with entries in all three arrays.

## Do not do

- Do not fetch or parse CapabilityStatements — this function operates on already-analyzed reports.
- Do not format output — that is spec 05.
- Do not produce a "score" or "compatibility percentage" — just list the differences.
- Do not import Node-specific modules.
- Do not try to detect semantic equivalence (e.g., "Patient.read" vs "Patient.vread") — compare literally.
