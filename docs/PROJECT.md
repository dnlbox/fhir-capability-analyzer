You are helping me design and implement a serious open-source developer tool.

Project goal:
Build a public GitHub repository that showcases strong engineering in healthtech interoperability, TypeScript architecture, and developer tooling. The tool must be useful, credible, and independent from any employer or client IP.

Repository name:
fhir-capability-analyzer

Primary purpose:
A TypeScript-first CLI and reusable library for:
1. fetching FHIR CapabilityStatements from any server endpoint (/metadata)
2. parsing the deeply nested JSON into an ergonomic data model
3. analyzing what the server supports: resources, operations, search parameters, profiles, security
4. detecting conformance to known international profiles (US Core, UK Core, AU Core, IPS, ISiK, etc.)
5. producing human-readable analysis reports
6. comparing two servers' capabilities side by side
7. enabling CI assertions like "this server declares support for US Core Patient"

Answers the question: "What does this FHIR server actually support?"

Why it exists:
No tooling exists for this. CapabilityStatements are the machine-readable metadata that every FHIR server
exposes at its /metadata endpoint, describing everything the server supports. These documents are routinely
1000+ lines of deeply nested JSON. Today, developers manually curl the endpoint and scroll through raw JSON
to understand server capabilities. During integration planning, comparing two servers' capabilities requires
eyeballing two massive JSON files side by side. CI pipelines have no way to assert "this server declares
support for US Core Patient" without custom scripts. This tool fills that gap.

Target audience:
- Integration engineers planning FHIR API integrations
- DevOps teams validating server deployments match expected capability declarations
- QA teams verifying conformance claims against known profiles
- Architects evaluating FHIR platforms and comparing vendor capabilities
- Anyone who has ever stared at a 2000-line CapabilityStatement JSON and wanted a summary

High-level positioning:
This is one of three complementary FHIR developer tools:
- **fhir-resource-diff** — validate, compare, and diff individual FHIR JSON resources
- **fhir-fixtures** — curated test fixtures for FHIR development
- **fhir-capability-analyzer** — fetch, analyze, and compare FHIR server capabilities

Together they cover the three most common pain points in FHIR integration work: understanding what
a server supports, working with realistic test data, and comparing resources during development.

API surface (v1):
The library exposes three core functions:
- `fetch(url)` — fetch and parse a CapabilityStatement from a FHIR server endpoint
- `analyze(capabilityStatement)` — produce an AnalysisReport with resource summary, profile conformance, warnings
- `compare(a, b)` — compare two CapabilityStatements and produce a ComparisonReport

The CLI exposes matching commands:
- `fhir-capability-analyzer analyze <url-or-file>`
- `fhir-capability-analyzer compare <url-or-file-a> <url-or-file-b>`

Key product constraints:
- Must be open source safe and generic
- Must not depend on proprietary schemas or private health data
- Must work against any FHIR R4/R4B/R5 server or local JSON file
- Must prioritize clean architecture, maintainability, and developer experience
- Must be written in TypeScript
- Must avoid overengineering the first version
- Core analysis logic must be browser-safe

Recommended stack:
- TypeScript (strict)
- Node.js
- pnpm
- zod for internal config/schema validation where helpful
- commander for CLI
- vitest for tests
- eslint + prettier
- tsup for packaging
- picocolors for terminal output (CLI only)

Architecture goals:
Design the codebase as layers:
1. core library (src/core/)
   - fetch and parse CapabilityStatements
   - analyze capabilities into structured reports
   - browser-safe shared logic
2. registry (src/registry/)
   - known profile URL patterns and metadata
   - browser-safe data module
3. formatters (src/formatters/)
   - text, JSON, markdown renderers
   - browser-safe
4. CLI adapter (src/cli/)
   - commands, flags, file I/O, exit codes
   - Node.js only

Repository structure:
/src
  /core
    fetch.ts
    parse.ts
    analyze.ts
    compare.ts
    types.ts
  /registry
    profiles.ts
    types.ts
  /formatters
    text.ts
    json.ts
    markdown.ts
  /cli
    index.ts
    commands/
/tests
/examples
/docs

Feature scope for v1:
1. Fetch CapabilityStatement from any FHIR server URL or local file
2. Parse into ergonomic TypeScript types
3. Analyze: resource inventory, operation inventory, search parameter inventory
4. Detect conformance to known international profiles
5. Security analysis (CORS, SMART, auth methods)
6. Generate warnings for common issues
7. Compare two servers' capabilities
8. Output formats: text, JSON, markdown
9. CLI with analyze and compare commands
10. Good README and examples
11. Good tests

Do not attempt in v1:
- Full FHIR specification validation
- Profile validation beyond URL pattern matching
- Web frontend
- Database or persistence
- Authentication against secured FHIR servers
- Automatic IG package resolution
- Real-time monitoring or polling

Suggested CLI UX:
- fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4
- fhir-capability-analyzer analyze ./capability.json
- fhir-capability-analyzer analyze URL --format json
- fhir-capability-analyzer analyze URL --format markdown
- fhir-capability-analyzer compare URL1 URL2
- fhir-capability-analyzer compare URL1 URL2 --format json

International profile awareness:
A key differentiator. The analyzer detects conformance to country-specific and international profiles:
- US Core (HL7 US)
- UK Core (HL7 UK / NHS Digital)
- AU Core / AU Base (HL7 Australia)
- CA Baseline (HL7 Canada)
- ISiK Stufe 1/2/3 (Germany, gematik)
- FR Core (France, Interop-Sante)
- nictiz (Netherlands)
- ABDM (India, NRCeS)
- IPS (International Patient Summary)
- IPA (International Patient Access)
- SMART App Launch

The registry is designed to be easily extensible — adding a new country profile is adding a data entry.

Output expectations:
For text mode, output should be clean and useful:

Server: HAPI FHIR R4
FHIR Version: 4.0.1
Format: json, xml

Resources (47):
  Patient       read, search, create, update, delete  [12 search params]
  Observation   read, search, create, update           [8 search params]
  ...

Operations (3):
  $everything   Patient
  $validate     *
  ...

Profile Conformance:
  US Core 6.1.0   Patient, Observation, Condition (12 resources)

Security:
  CORS: enabled
  Auth: SMART App Launch

Warnings:
  - Patient declares no search parameters
  - No security configuration declared

For JSON mode, output should be machine-consumable and stable (the AnalysisReport type).

Developer experience requirements:
- Clean pnpm setup
- Strict TypeScript
- No use of any unless clearly unavoidable
- Small focused modules
- Explicit types
- Tests for core analysis behavior
- Tests for profile detection
- Tests for comparison logic
- Sample CapabilityStatement files in /examples
- README with practical examples
- Package scripts for build, test, lint, dev

README expectations:
The README should make the repo look like a serious public engineering project.
Include:
- Project purpose and the problem it solves
- Quick start (npx one-liner)
- Sample output
- Profile detection table
- API reference
- CLI reference
- Architecture overview
- Comparison with alternatives (none exist)
- Roadmap

Additional instruction:
Whenever there is a choice between "more features" and "clearer architecture", choose clearer architecture.
Whenever there is a choice between "cleverness" and "maintainability", choose maintainability.
Whenever there is a choice between "UI polish" and "core analysis correctness", choose core analysis correctness.

Tone:
Write code and docs like an experienced engineer building a public utility for other engineers.
