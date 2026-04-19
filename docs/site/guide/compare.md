# Compare two servers

The `compare` command fetches two CapabilityStatements and produces a diff report.

## Basic usage

```bash
fhir-capability-analyzer compare <sourceA> <sourceB>
```

Each source can be a URL or a local JSON file path, independently:

```bash
# Two live servers
fhir-capability-analyzer compare https://server-a.example.com https://server-b.example.com

# Local baseline vs live server
fhir-capability-analyzer compare ./fixtures/baseline.json https://staging.example.com

# Two local files
fhir-capability-analyzer compare ./capability-v1.json ./capability-v2.json
```

## Output formats

### Text (default)

```bash
fhir-capability-analyzer compare ./examples/hapi-r4.json ./examples/us-core-server.json
```

```
Comparison: ./examples/hapi-r4.json → ./examples/us-core-server.json
N difference(s) found

Added in B (N)
...
Removed in B (N)
...
Changed (N)
...
```

### JSON

```bash
fhir-capability-analyzer compare a.json b.json --format json
```

Produces a stable `ComparisonReport` JSON object with `added`, `removed`, and `changed` arrays.

### Markdown

```bash
fhir-capability-analyzer compare a.json b.json --format markdown
```

## CI assertion: fail on any difference

```bash
fhir-capability-analyzer compare ./baseline.json https://staging.example.com --exit-on-diff
```

Exit code 1 when any difference is found. Exit code 0 when capabilities match exactly.

## What is compared

| Category | What is checked |
|----------|----------------|
| `fhir-version` | Top-level fhirVersion field |
| `format` | Declared content formats (json, xml, etc.) |
| `resource` | Which resource types are declared |
| `interaction` | Per-resource interactions (read, create, search-type, etc.) |
| `search-param` | Per-resource search parameter names |
| `operation` | Per-resource and system-level operations |
| `profile` | Per-resource profile and supportedProfile URLs |
| `security` | CORS and authentication services |

## Exit codes

See [Exit codes](../reference/exit-codes).
