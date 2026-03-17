# Spec 05 — Formatters

**Status:** open

## Goal

Implement output renderers that transform an `AnalysisReport` (and later a `ComparisonReport`)
into human-readable text, structured JSON, and markdown. These are the presentation layer —
they take data structures and produce strings.

## Dependencies

- Spec 01 (core types) complete
- Spec 04 (analyze) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/formatters/text.ts` | Plain text formatter for terminal output |
| `src/formatters/json.ts` | JSON formatter (structured, stable output) |
| `src/formatters/markdown.ts` | Markdown formatter for documentation generation |
| `src/formatters/index.ts` | Re-exports and format dispatcher |
| `tests/formatters.test.ts` | Tests for all formatters |

## Key interfaces / signatures

```typescript
export type OutputFormat = "text" | "json" | "markdown";

/** Format an AnalysisReport as plain text for terminal display. */
export function formatAnalysisText(report: AnalysisReport): string;

/** Format an AnalysisReport as JSON. */
export function formatAnalysisJson(report: AnalysisReport): string;

/** Format an AnalysisReport as markdown. */
export function formatAnalysisMarkdown(report: AnalysisReport): string;

/** Format a ComparisonReport as plain text. */
export function formatComparisonText(report: ComparisonReport): string;

/** Format a ComparisonReport as JSON. */
export function formatComparisonJson(report: ComparisonReport): string;

/** Format a ComparisonReport as markdown. */
export function formatComparisonMarkdown(report: ComparisonReport): string;

/** Dispatch to the correct formatter based on format string. */
export function formatAnalysis(report: AnalysisReport, format: OutputFormat): string;
export function formatComparison(report: ComparisonReport, format: OutputFormat): string;
```

## Implementation notes

### Text formatter (terminal output)

The text formatter produces clean, sectioned output suitable for terminal display:

```
Server: HAPI FHIR R4
FHIR Version: 4.0.1
Status: active
Formats: json, xml

--- Resources (47) ---

  Patient         read, search, create, update, delete   [12 search params]
  Observation     read, search, create, update            [8 search params]
  Condition       read, search, create                    [5 search params]
  ...

--- Operations (3) ---

  $everything     (Patient)
  $validate       (system)
  $meta           (system)

--- Profile Conformance ---

  US Core 6.1.0     Patient, Observation, Condition (+9 more)
  IPS               Patient, AllergyIntolerance, Medication

--- Security ---

  CORS: enabled
  Services: SMART-on-FHIR

--- Warnings (2) ---

  - Encounter: declares search-type but has no search parameters
  - No security description provided
```

Design notes:
- Use consistent indentation and alignment.
- Truncate long lists with "+N more" notation.
- Group resources with their interactions and search param counts.
- No color in the formatter itself — the CLI layer (spec 07) may add color using picocolors.

### JSON formatter

- Output the `AnalysisReport` object as pretty-printed JSON (`JSON.stringify(report, null, 2)`).
- This should be stable and machine-consumable.
- No transformation needed — the `AnalysisReport` type IS the JSON output schema.

### Markdown formatter

Output a markdown document with headers and tables:

```markdown
# FHIR Server Capability Report

**Server:** HAPI FHIR R4
**FHIR Version:** 4.0.1
**Status:** active
**Formats:** json, xml

## Resources (47)

| Resource | Interactions | Search Params |
|----------|-------------|---------------|
| Patient | read, search, create, update, delete | 12 |
| Observation | read, search, create, update | 8 |
...

## Operations

| Operation | Scope |
|-----------|-------|
| $everything | Patient |
...

## Profile Conformance

| Standard | Country | Matching Resources |
|----------|---------|-------------------|
| US Core | US | Patient, Observation, Condition (+9 more) |
...

## Warnings

- Encounter: declares search-type but has no search parameters
```

### Comparison formatters

Comparison output (for `ComparisonReport`) follows the same three format patterns:
- Text: sections for Added, Removed, Changed
- JSON: the ComparisonReport object
- Markdown: tables for each difference category

### Browser safety

- No Node imports in any formatter.
- Formatters are pure functions: data in, string out.
- No terminal escape codes or ANSI colors in the formatters themselves.

## Acceptance criteria

```bash
pnpm typecheck    # passes
pnpm test         # formatter tests pass
```

Tests should cover:
- Text formatter produces expected section headers and structure for a sample report.
- JSON formatter produces valid JSON that can be parsed back into an AnalysisReport.
- Markdown formatter produces valid markdown with expected headers and tables.
- Empty report (no resources, no warnings) produces sensible output, not errors.
- Report with warnings produces a warnings section.
- Report with profile conformance produces a conformance section.
- Format dispatcher routes to correct formatter.

## Do not do

- Do not add terminal colors (ANSI codes) — that is the CLI's responsibility.
- Do not import Node-specific modules.
- Do not add interactive formatting (progress bars, spinners).
- Do not add HTML output format in v1.
