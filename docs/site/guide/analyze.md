# Analyze a server

The `analyze` command fetches a CapabilityStatement and produces a structured report.

## Basic usage

```bash
# From a live server (appends /metadata automatically)
fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4

# From a local JSON file
fhir-capability-analyzer analyze ./capability.json
```

## Output formats

### Text (default)

Human-readable terminal output with sections for resources, operations, profile conformance, security, and warnings.

```bash
fhir-capability-analyzer analyze ./examples/us-core-server.json
```

```
Server: Example US Core FHIR Server
FHIR Version: 4.0.1
Status: active
Formats: json

Resources (2)
-------------
  Patient                        read, search-type [5 search params]
  Observation                    read, search-type [4 search params]

Profile Conformance
-------------------
  US Core (3 profile URL(s))

Security
--------
  CORS: enabled
  Auth: SMART-on-FHIR
```

### JSON

Produces a stable `AnalysisReport` object — suitable for CI pipelines, AI agents, and downstream processing.

```bash
fhir-capability-analyzer analyze ./examples/us-core-server.json --format json
```

The JSON schema is the `AnalysisReport` TypeScript type — see [Library API](../reference/library-api).

### Markdown

Produces a Markdown document with tables for resources, profile conformance, and security.

```bash
fhir-capability-analyzer analyze ./examples/us-core-server.json --format markdown
```

## Warnings

The analyzer generates warnings for common CapabilityStatement issues:

| Warning | What it means |
|---------|---------------|
| `No security configuration declared` | CORS disabled and no auth services |
| `status is 'draft'` | May not reflect production capabilities |
| `declares search-type but has no search parameters` | Likely a misconfiguration |
| `has search parameters but does not declare search-type` | Likely a misconfiguration |
| `FHIR version is missing or unrecognized` | Version field missing or non-standard |
| `Server declares no resources` | Empty REST capabilities |

When warnings are found, the command exits with code 1 (text and markdown modes).
In JSON mode, warnings are included in the output but the exit code is always 0.

## Exit codes

See [Exit codes](../reference/exit-codes).
