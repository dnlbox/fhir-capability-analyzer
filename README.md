# fhir-capability-analyzer

> A TypeScript CLI and library for fetching, analyzing, and comparing FHIR server CapabilityStatements.

CapabilityStatements are the machine-readable metadata every FHIR server exposes at its `/metadata` endpoint — describing every resource, interaction, search parameter, operation, and security mechanism the server supports. These documents are routinely 1,000–3,000 lines of deeply nested JSON.

`fhir-capability-analyzer` answers the question: **"What does this FHIR server actually support?"**

- Fetch a CapabilityStatement from any FHIR server URL or local JSON file
- Parse it into a clean, ergonomic data model
- Detect conformance to international profiles: US Core, UK Core, AU Core, IPS, IPA, SMART App Launch, ISiK
- Generate a structured analysis report with warnings for common issues
- Compare two servers' capabilities side by side
- Output as human-readable text, JSON (CI-friendly), or Markdown

The browser-safe core works in Node.js, Deno, Cloudflare Workers, and browser bundles. The CLI wraps the same core with file I/O and exit codes.

## Quick start

```bash
# Analyze a live server
npx fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4

# Analyze a local file
npx fhir-capability-analyzer analyze ./capability.json

# JSON output (CI-friendly, stable schema)
npx fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4 --format json

# Markdown output
npx fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4 --format markdown

# Compare two servers
npx fhir-capability-analyzer compare https://server-a.example.com https://server-b.example.com

# Compare and fail CI if differences found
npx fhir-capability-analyzer compare ./baseline.json https://server.example.com --exit-on-diff
```

## Sample output

```
Server: HAPI FHIR R4 Test Server
FHIR Version: 4.0.1
Status: active
Formats: application/fhir+json, application/fhir+xml, json, xml

Resources (3)
-------------
Patient                        read, vread, update, patch, delete, history-instance, history-type, create, search-type [7 search params]
Observation                    read, create, update, delete, search-type [4 search params]
Condition                      read, create, update, search-type [3 search params]

Operations (2)
--------------
  $everything
  $validate

Profile Conformance
-------------------
  (No known profiles detected)

Security
--------
  CORS: enabled
  Auth: (none declared)
```

## Installation

```bash
# Global CLI
npm install -g fhir-capability-analyzer

# Project dependency (library use)
npm install fhir-capability-analyzer
```

## CLI reference

### `analyze <source>`

Analyze a CapabilityStatement from a URL or local JSON file.

```
Arguments:
  source              FHIR server URL or path to local JSON file

Options:
  -f, --format        Output format: text | json | markdown  (default: text)
  -v, --version       Print version
  -h, --help          Show help

Exit codes:
  0  Success, no warnings
  1  Success, but warnings were found (text and markdown modes only)
  2  Fetch or parse error
```

### `compare <sourceA> <sourceB>`

Compare two FHIR servers' capabilities.

```
Arguments:
  sourceA             FHIR server URL or local JSON file (baseline)
  sourceB             FHIR server URL or local JSON file (target)

Options:
  -f, --format        Output format: text | json | markdown  (default: text)
  --exit-on-diff      Exit with code 1 when differences are found
  -h, --help          Show help
```

## TypeScript library API

```typescript
import {
  fetchCapabilityStatement,
  parseFromJson,
  analyze,
  compare,
} from "fhir-capability-analyzer";

import { detectProfiles } from "fhir-capability-analyzer/registry";

// Fetch from a live server
const result = await fetchCapabilityStatement("https://hapi.fhir.org/baseR4");
if (!result.success) throw new Error(result.error);

// Analyze
const report = analyze(result.capability);
console.log(report.summary.resourceCount);      // number of resources
console.log(report.conformance.detectedProfiles); // ProfileConformance[]
console.log(report.warnings);                   // string[]

// Parse from local JSON (e.g., after fs.readFileSync)
const localResult = parseFromJson(JSON.parse(rawJson));

// Compare two capabilities
const diff = compare(capA, capB);
// diff.added, diff.removed, diff.changed — ComparisonDifference[]

// Profile detection only
const profiles = detectProfiles(["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]);
// [{ url, name, country, standard }]
```

## Profile detection

Detects conformance to known international and national FHIR profiles by matching profile URLs declared in `instantiates`, `implementationGuide`, and per-resource `profile`/`supportedProfile` fields.

| Standard | Country | URL prefix |
|----------|---------|------------|
| US Core | 🇺🇸 us | `http://hl7.org/fhir/us/core/` |
| UK Core | 🇬🇧 uk | `https://fhir.hl7.org.uk/`, `https://fhir.nhs.uk/` |
| AU Core | 🇦🇺 au | `http://hl7.org/fhir/au/core/` |
| AU Base | 🇦🇺 au | `http://hl7.org.au/fhir/` |
| CA Baseline | 🇨🇦 ca | `http://hl7.org/fhir/ca/baseline/` |
| IPS | 🌍 international | `http://hl7.org/fhir/uv/ips/` |
| IPA | 🌍 international | `http://hl7.org/fhir/uv/ipa/` |
| SMART App Launch | 🌍 international | `http://fhir-registry.smarthealthit.org/`, `http://hl7.org/fhir/smart-app-launch/` |
| ISiK | 🇩🇪 de | `https://gematik.de/fhir/isik/`, `https://gematik.de/fhir/ISiK/` |

## Architecture

```
src/core/        browser-safe functional core
  types.ts       all shared TypeScript interfaces
  parse.ts       CapabilityStatement → ServerCapability
  fetch.ts       fetch from URL, parse from JSON
  analyze.ts     ServerCapability → AnalysisReport
  compare.ts     ServerCapability × ServerCapability → ComparisonReport

src/registry/    browser-safe profile registry
  profiles.ts    known profile URL patterns
  detect.ts      detectProfiles(urls[]) → ProfileConformance[]

src/formatters/  browser-safe output renderers
  text.ts        human-readable text
  json.ts        stable JSON
  markdown.ts    Markdown tables

src/cli/         Node.js adapter (thin shell over core)
  commands/      analyze.ts, compare.ts
```

No code under `src/core/`, `src/registry/`, or `src/formatters/` imports Node.js APIs. This is enforced by TypeScript and tested.

## What this tool does NOT do

- Full StructureDefinition / profile conformance validation — use the [HL7 FHIR Validator](https://confluence.hl7.org/display/FHIR/Using+the+FHIR+Validator)
- Profile evaluation beyond URL pattern matching
- Authentication against secured FHIR servers
- IG package resolution or download
- XML ↔ JSON conversion — use the [`fhir`](https://www.npmjs.com/package/fhir) package

## Supported FHIR versions

R4 (4.0.1), R4B (4.3.0), R5 (5.0.0) — auto-detected from the `fhirVersion` field.

## Related tools

| Tool | Purpose |
|------|---------|
| [fhir-resource-diff](https://github.com/dnlbox/fhir-resource-diff) | Validate, diff, and compare individual FHIR JSON resources |
| [fhir-test-data](https://github.com/dnlbox/fhir-test-data) | Generate valid FHIR test data with country-aware identifiers |

## Roadmap

- [ ] CA Baseline, FR Core, NL Nictiz, IHE profile detection
- [ ] Authentication support for secured FHIR servers (OAuth 2.0 token injection)
- [ ] Browser-based UI using the same core library
- [ ] `--assert` flag for CI: fail if a specific profile is not detected

## Links

- [Documentation](https://dnlbox.github.io/fhir-capability-analyzer/)
- [npm](https://www.npmjs.com/package/fhir-capability-analyzer)
- [GitHub](https://github.com/dnlbox/fhir-capability-analyzer)
- [FHIR specification](https://hl7.org/fhir/)
