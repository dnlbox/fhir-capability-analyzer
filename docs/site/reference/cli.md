# CLI reference

## Global options

```
-v, --version    Print version number
-h, --help       Show help
```

## analyze

```
fhir-capability-analyzer analyze <source> [options]
```

Analyze a FHIR server's CapabilityStatement.

**Arguments:**

| Argument | Description |
|----------|-------------|
| `source` | FHIR server URL (appends `/metadata` if not present) or path to a local JSON file |

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `-f, --format <format>` | `text` | Output format: `text`, `json`, or `markdown` |

**Examples:**

```bash
fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4
fhir-capability-analyzer analyze ./capability.json --format json
fhir-capability-analyzer analyze ./capability.json --format markdown
```

## compare

```
fhir-capability-analyzer compare <sourceA> <sourceB> [options]
```

Compare two FHIR servers' CapabilityStatements.

**Arguments:**

| Argument | Description |
|----------|-------------|
| `sourceA` | Baseline — FHIR server URL or local JSON file |
| `sourceB` | Target — FHIR server URL or local JSON file |

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `-f, --format <format>` | `text` | Output format: `text`, `json`, or `markdown` |
| `--exit-on-diff` | `false` | Exit with code 1 when differences are found |

**Examples:**

```bash
fhir-capability-analyzer compare https://server-a.example.com https://server-b.example.com
fhir-capability-analyzer compare ./baseline.json https://staging.example.com --exit-on-diff
fhir-capability-analyzer compare a.json b.json --format json
```
