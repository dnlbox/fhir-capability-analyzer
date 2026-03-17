# Spec 01 — Core types

**Status:** open

## Goal

Define all shared TypeScript types and interfaces in `src/core/types.ts` and `src/core/index.ts`.
This is the load-bearing spec — every other module depends on these types.
Get them right before anything else is implemented.

## Dependencies

- Spec 00 (project setup) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/core/types.ts` | All shared types for capabilities, analysis, and comparison |
| `src/core/index.ts` | Re-exports everything public from src/core |
| `src/registry/types.ts` | Profile registry types |
| `src/registry/index.ts` | Re-exports from src/registry |

## Key interfaces and types

Design the following types. Exact field names are specified; add JSDoc comments on non-obvious fields.

### ServerCapability (parsed CapabilityStatement)

```typescript
/** Ergonomic representation of a parsed CapabilityStatement. */
export interface ServerCapability {
  /** Raw FHIR version string (e.g., "4.0.1") */
  fhirVersion: string;
  /** Server name / title from the CapabilityStatement */
  name?: string;
  /** Server description */
  description?: string;
  /** Publisher */
  publisher?: string;
  /** CapabilityStatement status */
  status: string;
  /** instance | capability | requirements */
  kind: string;
  /** Supported formats (e.g., ["json", "xml"]) */
  format: string[];
  /** Supported patch formats */
  patchFormat: string[];
  /** Implementation guides this server implements */
  implementationGuide: string[];
  /** CapabilityStatements this server conforms to */
  instantiates: string[];
  /** CapabilityStatements imported */
  imports: string[];
  /** RESTful capabilities per resource type */
  resources: ResourceCapability[];
  /** System-level operations */
  operations: OperationCapability[];
  /** System-level search parameters */
  searchParams: SearchParamCapability[];
  /** System-level interactions (transaction, batch, etc.) */
  interactions: string[];
  /** Security configuration */
  security: SecurityCapability;
  /** Messaging capabilities (if declared) */
  messaging: MessagingCapability[];
  /** Document capabilities (if declared) */
  documents: DocumentCapability[];
}
```

### ResourceCapability

```typescript
export interface ResourceCapability {
  /** Resource type (e.g., "Patient") */
  type: string;
  /** Base profile URL */
  profile?: string;
  /** Additional supported profile URLs */
  supportedProfiles: string[];
  /** Supported interactions (read, search-type, create, etc.) */
  interactions: string[];
  /** Supported search parameters */
  searchParams: SearchParamCapability[];
  /** Resource-level operations */
  operations: OperationCapability[];
  /** Versioning mode */
  versioning?: string;
  /** Conditional operations support */
  conditionalCreate: boolean;
  conditionalUpdate: boolean;
  conditionalDelete?: string;
  conditionalRead?: string;
  /** _include values supported */
  searchInclude: string[];
  /** _revinclude values supported */
  searchRevInclude: string[];
  /** Reference handling policies */
  referencePolicy: string[];
}
```

### SearchParamCapability

```typescript
export interface SearchParamCapability {
  name: string;
  type: string;
  definition?: string;
  documentation?: string;
}
```

### OperationCapability

```typescript
export interface OperationCapability {
  name: string;
  definition?: string;
  documentation?: string;
}
```

### SecurityCapability

```typescript
export interface SecurityCapability {
  cors: boolean;
  /** Security service codes (e.g., "SMART-on-FHIR", "OAuth") */
  services: string[];
  description?: string;
}
```

### MessagingCapability

```typescript
export interface MessagingCapability {
  endpoint?: string;
  reliableCache?: number;
  documentation?: string;
  supportedMessages: Array<{
    mode: string;
    definition: string;
  }>;
}
```

### DocumentCapability

```typescript
export interface DocumentCapability {
  mode: string;
  documentation?: string;
  profile: string;
}
```

### ProfileConformance (from registry)

```typescript
/** Detected profile conformance for a specific URL. */
export interface ProfileConformance {
  /** The matched profile URL */
  url: string;
  /** Human-readable name (e.g., "US Core Patient") */
  name: string;
  /** Country code or "international" */
  country: string;
  /** Standard family name (e.g., "US Core") */
  standard: string;
  /** Version if detectable from URL */
  version?: string;
}
```

### AnalysisReport

```typescript
export interface AnalysisReport {
  /** Parsed server capability */
  server: ServerCapability;
  /** Summary counts */
  summary: AnalysisSummary;
  /** Detected profile conformance */
  conformance: {
    detectedProfiles: ProfileConformance[];
  };
  /** Warnings about the CapabilityStatement */
  warnings: string[];
}

export interface AnalysisSummary {
  resourceCount: number;
  operationCount: number;
  /** Total distinct profile URLs across all resources */
  profileCount: number;
  /** Total search parameters across all resources */
  searchParamCount: number;
  /** Total interactions across all resources */
  interactionCount: number;
}
```

### ComparisonReport

```typescript
export interface ComparisonReport {
  /** Differences: things present in B but not A */
  added: ComparisonDifference[];
  /** Differences: things present in A but not B */
  removed: ComparisonDifference[];
  /** Differences: things present in both but different */
  changed: ComparisonDifference[];
}

export type ComparisonCategory =
  | "resource"
  | "interaction"
  | "search-param"
  | "operation"
  | "profile"
  | "security"
  | "format"
  | "fhir-version";

export interface ComparisonDifference {
  category: ComparisonCategory;
  /** Dot-notation path describing where the difference is */
  path: string;
  description: string;
  /** Value in A (for changed/removed) */
  left?: unknown;
  /** Value in B (for changed/added) */
  right?: unknown;
}
```

### FetchResult

```typescript
export type FetchResult =
  | { success: true; capability: ServerCapability; raw: unknown }
  | { success: false; error: string };
```

## Implementation notes

- All types must be plain interfaces or type aliases — no classes.
- No imports from any external package in `types.ts`. Types must have zero runtime cost.
- `ServerCapability` is an **ergonomic parsed representation**, not a 1:1 mirror of the FHIR
  CapabilityStatement resource. It flattens and simplifies the deeply nested FHIR structure
  into something TypeScript consumers can work with directly.
- `ProfileConformance` lives in `src/registry/types.ts` but is re-exported from `src/core/index.ts`
  since it is used in `AnalysisReport`.
- `src/core/index.ts` should re-export all public types and all public functions from the core
  modules (once they are implemented in later specs). For this spec, it only needs to export types.

## Acceptance criteria

```bash
pnpm typecheck    # passes — no errors in types files
pnpm lint         # passes
```

Manually verify:
- `ServerCapability` can represent a server with 50 resources, each with interactions and search params.
- `AnalysisReport` with empty warnings and zero detected profiles is valid.
- `ComparisonReport` with entries in all three arrays (added, removed, changed) is valid.
- `FetchResult` discriminated union works correctly with type narrowing.

## Do not do

- Do not implement any functions yet — only types and interfaces.
- Do not import zod or any runtime library in types files.
- Do not use FHIR-specific type packages (e.g., `@types/fhir`) — we define our own ergonomic types.
- Do not add generics or type parameters unless there is a clear, immediate need.
