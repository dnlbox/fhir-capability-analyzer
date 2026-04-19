# Output formats

All commands support three output formats via `--format`.

## text (default)

Human-readable terminal output. Sections for resources, operations, profile conformance, security, and warnings.

Best for: interactive use, quick checks, reading in a terminal.

```bash
fhir-capability-analyzer analyze ./capability.json
fhir-capability-analyzer compare a.json b.json
```

## json

Stable, machine-consumable JSON matching the `AnalysisReport` or `ComparisonReport` TypeScript types.

Best for: CI pipelines, AI agents, downstream processing, `jq` queries.

```bash
fhir-capability-analyzer analyze ./capability.json --format json
fhir-capability-analyzer compare a.json b.json --format json
```

The JSON schema is stable across patch versions within a major version.
Breaking changes to the JSON structure will be communicated in CHANGELOG.md.

## markdown

Markdown document with tables for resources, profile conformance, and security.

Best for: documentation, GitHub issues, reports, Slack or Notion pastes.

```bash
fhir-capability-analyzer analyze ./capability.json --format markdown
fhir-capability-analyzer compare a.json b.json --format markdown
```
