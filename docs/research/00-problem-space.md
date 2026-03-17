# Research: Problem space

## What is a CapabilityStatement?

A [CapabilityStatement](https://hl7.org/fhir/R4/capabilitystatement.html) is a FHIR resource that
describes the complete set of capabilities a FHIR server (or client) supports. Every conformant FHIR
server exposes its CapabilityStatement at the `/metadata` endpoint. It is the machine-readable answer
to "what does this server do?"

A CapabilityStatement declares:
- Which FHIR version the server runs (R4, R4B, R5)
- Which resource types are supported (Patient, Observation, etc.)
- Which interactions each resource supports (read, search, create, update, delete)
- Which search parameters are available per resource
- Which operations are supported ($everything, $validate, $summary, etc.)
- Which profiles the server claims to conform to (US Core, UK Core, etc.)
- Security configuration (CORS, SMART App Launch, OAuth)
- Supported formats (JSON, XML, etc.)

## Why it is hard to read

A typical production CapabilityStatement is **1000 to 5000+ lines** of deeply nested JSON.

The structure is verbose by design — FHIR aims for machine readability, not human readability.
A single resource entry (e.g., Patient) contains nested arrays for interactions, search parameters,
supported profiles, conditional operations, versioning mode, search includes, and search rev-includes.
Multiply that by 40-100 resource types and add server-level operations, security blocks, and
messaging configuration.

Key pain points:
- **Depth**: 4-6 levels of nesting is common. `rest[0].resource[12].searchParam[3].type` is a
  real path you need to navigate.
- **Volume**: Even a moderate server declares 30-50 resource types, each with 5-15 search parameters.
- **No summary view**: The format has no built-in summary or overview. You get everything or nothing.
- **Repetitive structure**: The same patterns repeat across resource types, making it hard to spot
  what is different or notable about a specific resource.

## Current developer workflow

Today, when a developer needs to understand what a FHIR server supports:

1. `curl https://server.example.com/metadata -H "Accept: application/fhir+json"` — fetch raw JSON
2. Pipe through `jq` or paste into a JSON viewer — try to make it readable
3. Manually search for specific resource types — "does this server support Observation?"
4. Manually check interactions — "can I search for Patients by name?"
5. Manually look for profiles — "does this declare US Core conformance?"
6. Repeat for a second server when comparing — open two terminal windows, eyeball both

This process takes 15-30 minutes per server and is error-prone. Important details are routinely
missed because they are buried in the volume of JSON.

For **server comparison** (common during vendor evaluation or migration planning), the situation
is worse. There is no way to systematically compare two CapabilityStatements. Developers create
ad-hoc spreadsheets or simply compare notes from separate manual reviews.

## Existing tooling — confirmed gap

As of the research date, **zero npm packages** exist for this specific use case:
- `fhir-capability-statement` — does not exist
- `capability-statement-analyzer` — does not exist
- No packages on npm combine fetching, parsing, and reporting on CapabilityStatements

Related but insufficient tools:
- **FHIR validators** (e.g., the official Java validator) validate resources against profiles but
  do not analyze or summarize CapabilityStatements
- **Simplifier.net** renders CapabilityStatements in a web UI but is not a CLI tool, not
  programmable, and not available for CI pipelines
- **SMART Health IT** provides a test suite for SMART-on-FHIR but does not analyze general
  capability declarations

## Use cases

### Integration planning
"We are integrating with Hospital X's FHIR server. What resources and search parameters does it
support? Does it support the operations we need?"

### Conformance checking
"Our server claims US Core conformance. Does the CapabilityStatement actually declare the required
profiles? Are the required interactions present?"

### Server comparison
"We are evaluating two EHR vendors. How do their FHIR capabilities differ? Which one supports more
of what we need?"

### CI assertions
"In our deployment pipeline, verify that the server's CapabilityStatement declares support for
Patient read, search, and the $everything operation."

### Documentation generation
"Generate a markdown summary of our server's capabilities for our developer portal."

### Migration validation
"We upgraded our FHIR server. Did the CapabilityStatement change? Did we lose any capabilities?"

## The international angle

FHIR is deployed globally, and different countries define their own profiles and implementation
guides. A server's CapabilityStatement may reference profiles from:

- **US Core** (United States) — the dominant North American profile set
- **UK Core** (United Kingdom) — NHS Digital profiles
- **AU Core / AU Base** (Australia) — HL7 Australia profiles
- **CA Baseline** (Canada) — HL7 Canada profiles
- **ISiK** (Germany) — gematik's interoperability standards
- **FR Core** (France) — Interop-Sante profiles
- **nictiz** (Netherlands) — Dutch national profiles
- **ABDM** (India) — National Resource Centre for EHR Standards profiles
- **IPS** (International Patient Summary) — cross-border patient summary
- **IPA** (International Patient Access) — HL7 international access profiles
- **SMART App Launch** — authorization framework (global)

Detecting which profiles a server conforms to is valuable for integration planning and compliance
verification. Today this detection requires knowing the URL patterns for each country's profiles
and manually searching the CapabilityStatement JSON.
