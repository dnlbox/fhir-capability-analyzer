# Ecosystem

`fhir-capability-analyzer` is one of three complementary FHIR developer tools built to cover
the most common pain points in FHIR integration work.

## The fhir-toolkit

| Tool | Purpose | npm |
|------|---------|-----|
| [fhir-capability-analyzer](https://github.com/dnlbox/fhir-capability-analyzer) | Fetch, analyze, and compare FHIR server CapabilityStatements | [npm](https://www.npmjs.com/package/fhir-capability-analyzer) |
| [fhir-resource-diff](https://github.com/dnlbox/fhir-resource-diff) | Validate, diff, and compare individual FHIR JSON resources | [npm](https://www.npmjs.com/package/fhir-resource-diff) |
| [fhir-test-data](https://github.com/dnlbox/fhir-test-data) | Generate valid FHIR test data with country-aware identifiers | [npm](https://www.npmjs.com/package/fhir-test-data) |

Together they cover three of the most common tasks in FHIR integration work:
- Understanding what a server supports (`fhir-capability-analyzer`)
- Working with individual resources during development (`fhir-resource-diff`)
- Generating realistic test data (`fhir-test-data`)

## Related tools

These tools solve different but complementary problems:

| Tool | When to use instead |
|------|---------------------|
| [HL7 FHIR Validator](https://confluence.hl7.org/display/FHIR/Using+the+FHIR+Validator) | Full profile conformance validation (requires Java) |
| [@medplum/core](https://www.npmjs.com/package/@medplum/core) | FHIRPath evaluation, full FHIR client |
| [fhir](https://www.npmjs.com/package/fhir) | XML ↔ JSON conversion |

## Common workflow

```bash
# 1. Understand what the server supports
fhir-capability-analyzer analyze https://fhir.server.example.com

# 2. Generate test data matching the server's profiles
fhir-test-data generate patient --locale us --seed 42

# 3. Validate and diff resources during development
fhir-resource-diff validate patient.json --fhir-version R4
fhir-resource-diff compare expected.json actual.json

# 4. Assert server capabilities in CI
fhir-capability-analyzer compare ./fixtures/baseline.json https://staging.example.com --exit-on-diff
```
