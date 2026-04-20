---
layout: home
hero:
  name: fhir-capability-analyzer
  text: What does this server actually support?
  tagline: Fetch, analyze, and compare FHIR server capabilities. Profile detection. CI-ready.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/dnlbox/fhir-capability-analyzer
features:
  - title: Instant capability analysis
    details: Fetch any FHIR server's /metadata endpoint and get a structured report — resources, interactions, search parameters, operations, and security — in seconds. No server-side dependencies, no Java runtime.
  - title: International profile detection
    details: Automatically detects conformance to US Core, UK Core, AU Core, CA Baseline, IPS, IPA, SMART App Launch, ISiK, and more — by matching profile URLs declared in the CapabilityStatement.
  - title: Server comparison
    details: Compare two FHIR servers side by side. See exactly which resources, interactions, profiles, and security configurations were added, removed, or changed — with structured diff output for CI assertions.
  - title: Library-first architecture
    details: The browser-safe TypeScript core works in Node.js, Deno, Cloudflare Workers, and browser bundles. Import analyze(), compare(), and detectProfiles() directly in your own tooling.
---

`fhir-capability-analyzer` answers the question every FHIR integration engineer asks eventually:
**"What does this server actually support?"**

CapabilityStatements are the machine-readable metadata every FHIR server exposes at its `/metadata`
endpoint. They describe every resource, interaction, search parameter, and security mechanism the server
supports. These documents are routinely 1,000–3,000 lines of deeply nested JSON that developers currently
read manually.

```bash
# Analyze a live FHIR server
npx fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4

# Analyze a local file
npx fhir-capability-analyzer analyze ./capability.json --format markdown

# Compare two servers for CI assertions
npx fhir-capability-analyzer compare ./baseline.json https://staging.example.com --exit-on-diff
```

Supports FHIR **R4** (4.0.1), **R4B** (4.3.0), and **R5** (5.0.0) — auto-detected from the `fhirVersion` field.

## Part of the FHIR operations toolkit

Three focused CLI tools built for FHIR development workflows. Each does one job well — compose them in shell pipelines, CI steps, or AI agent chains instead of reaching for a single monolithic toolkit.

| Tool | Purpose |
|------|---------|
| [fhir-resource-diff](https://dnlbox.github.io/fhir-resource-diff) | Diff, validate, and inspect FHIR resources |
| **fhir-capability-analyzer** *(this)* | Analyze and compare FHIR server CapabilityStatements |
| [fhir-test-data](https://dnlbox.github.io/fhir-test-data) | Generate valid FHIR test resources across 14 locales |

The tools are independent — use one, two, or all three in any combination that fits your pipeline.
