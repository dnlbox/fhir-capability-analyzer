# Getting started

## Requirements

- Node.js 20 or later
- No other dependencies required for CLI use

## One-time use with npx

No installation needed:

```bash
npx fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4
```

## Install globally

```bash
npm install -g fhir-capability-analyzer
fhir-capability-analyzer --version
```

## Install as a project dependency

```bash
npm install fhir-capability-analyzer
# or
pnpm add fhir-capability-analyzer
```

## Your first analysis

Analyze a live FHIR server:

```bash
fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4
```

Analyze a local CapabilityStatement file:

```bash
fhir-capability-analyzer analyze ./capability.json
```

Get structured JSON output (stable schema, suitable for CI and AI agents):

```bash
fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4 --format json
```

## Your first comparison

Compare two servers:

```bash
fhir-capability-analyzer compare https://server-a.example.com https://server-b.example.com
```

Compare a local baseline against a live server, failing CI if differences exist:

```bash
fhir-capability-analyzer compare ./fixtures/baseline.json https://staging.example.com --exit-on-diff
```

## Next steps

- [Analyze a server](./analyze) — understand the full output and what it tells you
- [Compare two servers](./compare) — CI assertions and diff output
- [Profile detection](./profile-detection) — how international profile conformance is detected
- [CI/CD integration](./ci-cd) — patterns for using this tool in CI pipelines
