# Spec 02 — Fetch and parse

**Status:** open

## Goal

Implement fetching a FHIR CapabilityStatement from a server URL and parsing the raw JSON into the
`ServerCapability` type. This is the ingestion layer — raw FHIR JSON in, ergonomic types out.

## Dependencies

- Spec 01 (core types) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/core/fetch.ts` | Fetch CapabilityStatement from URL |
| `src/core/parse.ts` | Parse raw CapabilityStatement JSON into ServerCapability |
| `tests/fetch.test.ts` | Tests for fetch logic |
| `tests/parse.test.ts` | Tests for parse logic |

## Key interfaces / signatures

```typescript
/**
 * Fetch a CapabilityStatement from a FHIR server.
 * Appends /metadata to the URL if not already present.
 * Uses the standard fetch() API — browser-safe.
 */
export function fetchCapabilityStatement(
  baseUrl: string,
  options?: FetchOptions,
): Promise<FetchResult>;

export interface FetchOptions {
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Parse raw CapabilityStatement JSON into ServerCapability.
 * Accepts either a parsed object or a JSON string.
 */
export function parseCapabilityStatement(
  input: unknown,
): ParseResult;

export type ParseResult =
  | { success: true; capability: ServerCapability }
  | { success: false; error: string };
```

## Implementation notes

### URL handling
- If the input URL does not end with `/metadata`, append it.
- Strip trailing slashes before appending.
- Example: `https://hapi.fhir.org/baseR4` becomes `https://hapi.fhir.org/baseR4/metadata`.
- Example: `https://hapi.fhir.org/baseR4/metadata` stays unchanged.

### Fetch behavior
- Set `Accept: application/fhir+json` header.
- Use the standard `fetch()` API — do NOT use `node-fetch` or any Node-specific HTTP library.
  This keeps the function browser-safe.
- Support an optional timeout via `AbortController`.
- Return `FetchResult` discriminated union — never throw for expected error conditions.

### Error handling
Return `{ success: false, error: string }` for:
- Network errors (unreachable server)
- Non-2xx HTTP responses (include status code in error message)
- Response is not valid JSON
- Response JSON is not a CapabilityStatement (missing `resourceType: "CapabilityStatement"`)

### Parsing
The parse function maps deeply nested FHIR CapabilityStatement JSON into the flat `ServerCapability` type:

- Extract `rest[0]` where `mode === "server"` (or the first `rest` entry if none has mode server).
- Map `rest[].resource[]` into `ResourceCapability[]`.
- Map `rest[].resource[].interaction[].code` into `string[]`.
- Map `rest[].resource[].searchParam[]` into `SearchParamCapability[]`.
- Map `rest[].resource[].operation[]` into `OperationCapability[]`.
- Extract `rest[].security` into `SecurityCapability`.
- Collect all profile URLs from `profile`, `supportedProfile[]`, `instantiates[]`, `implementationGuide[]`.
- Handle missing fields gracefully — default to empty arrays and sensible defaults.

### Browser safety
- No `node:fs`, `node:path`, or any Node built-in imports.
- The `fetch()` API is available in both Node 18+ and browsers.

## Acceptance criteria

```bash
pnpm typecheck    # passes
pnpm test         # parse tests pass
```

Tests should cover:
- Parsing a minimal valid CapabilityStatement (only required fields).
- Parsing a full CapabilityStatement with multiple resources, search params, and operations.
- Parsing a CapabilityStatement with security configuration.
- Error case: input is not a CapabilityStatement (missing resourceType).
- Error case: input is not valid JSON (string input).
- URL normalization: trailing slash handling, /metadata appending.

Fetch tests should mock the `fetch()` API (do not make real network calls in tests):
- Successful fetch returns parsed ServerCapability.
- Non-2xx response returns error.
- Non-JSON response returns error.

## Do not do

- Do not use `node-fetch`, `axios`, or any HTTP library — standard `fetch()` only.
- Do not validate the CapabilityStatement against the FHIR schema — only validate enough to
  parse it (resourceType check, basic shape).
- Do not read from the filesystem — file reading is the CLI adapter's responsibility (spec 07).
- Do not parse messaging or document sections in detail for v1 — extract them if present but
  they are not the focus.
