# Showcase

`fhir-capability-analyzer` is a CLI and library for analyzing and comparing FHIR server
CapabilityStatements. It answers the question: "What does this FHIR server actually support?"

This showcase runs it against the bundled example files to demonstrate what it surfaces.

---

## The examples

Three CapabilityStatement fixtures are included in [`examples/`](examples/):

| File | What it represents |
|------|--------------------|
| `hapi-r4.json` | HAPI FHIR R4 test server — generic R4 server, no profile declarations |
| `us-core-server.json` | Example US Core server — declares US Core profiles and SMART security |
| `ips-server.json` | Example IPS server — declares IPS profiles and $summary operation |

---

## Analyzing a generic FHIR server

```bash
fhir-capability-analyzer analyze examples/hapi-r4.json
```

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

Warnings (1)
------------
  - No security configuration declared — CORS disabled and no authentication services
```

---

## Analyzing a US Core server

```bash
fhir-capability-analyzer analyze examples/us-core-server.json
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

---

## Comparing two servers

```bash
fhir-capability-analyzer compare examples/hapi-r4.json examples/us-core-server.json
```

Shows which resources, interactions, search parameters, and profiles were added or removed
when moving from the generic HAPI server to the US Core server.

---

## JSON output for CI pipelines and AI agents

```bash
fhir-capability-analyzer analyze examples/us-core-server.json --format json
```

The `--format json` flag produces a stable, machine-consumable `AnalysisReport` object:

```json
{
  "server": { "fhirVersion": "4.0.1", "name": "Example US Core FHIR Server", ... },
  "summary": {
    "resourceCount": 2,
    "operationCount": 0,
    "profileCount": 4,
    "searchParamCount": 9,
    "interactionCount": 4
  },
  "conformance": {
    "detectedProfiles": [
      { "url": "http://hl7.org/fhir/us/core/CapabilityStatement/us-core-server", "standard": "US Core", "country": "us" },
      ...
    ]
  },
  "warnings": []
}
```

---

## CI assertion pattern

```bash
# Fail the build if the server does not expose the same capabilities as baseline
fhir-capability-analyzer compare ./fixtures/baseline.json https://staging.example.com --exit-on-diff
```

Exit code 1 when differences are found; exit code 0 when capabilities match.
