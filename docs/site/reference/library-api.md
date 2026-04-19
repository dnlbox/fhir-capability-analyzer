# Library API

## Installation

```bash
npm install fhir-capability-analyzer
```

## Core functions

### `fetchCapabilityStatement(url)`

Fetch and parse a CapabilityStatement from a FHIR server URL.
Appends `/metadata` if not present. Uses the standard `fetch()` API (browser-safe).

```typescript
import { fetchCapabilityStatement } from "fhir-capability-analyzer";

const result = await fetchCapabilityStatement("https://hapi.fhir.org/baseR4");
if (!result.success) {
  console.error(result.error);
  process.exit(1);
}
const { capability } = result;
```

**Returns:** `Promise<FetchResult>`

### `parseFromJson(raw)`

Parse a CapabilityStatement from an already-loaded JSON value.
Use this when reading from a local file or when you already have the JSON.

```typescript
import { parseFromJson } from "fhir-capability-analyzer";
import { readFileSync } from "node:fs";

const raw = JSON.parse(readFileSync("./capability.json", "utf-8"));
const result = parseFromJson(raw);
if (!result.success) throw new Error(result.error);
```

**Returns:** `FetchResult`

### `analyze(capability)`

Analyze a parsed `ServerCapability` and produce an `AnalysisReport`.
Pure function — no side effects, no network calls, browser-safe.

```typescript
import { analyze } from "fhir-capability-analyzer";

const report = analyze(capability);

console.log(report.summary.resourceCount);
console.log(report.conformance.detectedProfiles);
console.log(report.warnings);
```

**Returns:** `AnalysisReport`

### `compare(a, b)`

Compare two `ServerCapability` objects and produce a `ComparisonReport`.
Pure function — browser-safe.

```typescript
import { compare } from "fhir-capability-analyzer";

const diff = compare(capabilityA, capabilityB);

console.log(diff.added);    // ComparisonDifference[]
console.log(diff.removed);  // ComparisonDifference[]
console.log(diff.changed);  // ComparisonDifference[]
```

**Returns:** `ComparisonReport`

## Registry

### `detectProfiles(urls)`

Detect known profile conformance from a list of profile URLs.

```typescript
import { detectProfiles } from "fhir-capability-analyzer/registry";

const profiles = detectProfiles([
  "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
]);
// [{ url, name: "US Core", country: "us", standard: "US Core" }]
```

**Returns:** `ProfileConformance[]`

## Key types

```typescript
type FetchResult =
  | { success: true; capability: ServerCapability; raw: unknown }
  | { success: false; error: string };

interface AnalysisReport {
  server: ServerCapability;
  summary: AnalysisSummary;
  conformance: { detectedProfiles: ProfileConformance[] };
  warnings: string[];
}

interface AnalysisSummary {
  resourceCount: number;
  operationCount: number;
  profileCount: number;
  searchParamCount: number;
  interactionCount: number;
}

interface ComparisonReport {
  added: ComparisonDifference[];
  removed: ComparisonDifference[];
  changed: ComparisonDifference[];
}

interface ComparisonDifference {
  category: "resource" | "interaction" | "search-param" | "operation" | "profile" | "security" | "format" | "fhir-version";
  path: string;
  description: string;
  left?: unknown;
  right?: unknown;
}

interface ProfileConformance {
  url: string;
  name: string;
  country: string;
  standard: string;
  version?: string;
}
```
