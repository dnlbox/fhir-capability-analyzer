# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Corrected AU Core profile detection to use the HL7 Australia canonical prefix `http://hl7.org.au/fhir/core/`
- Removed the retired `fhir-registry.smarthealthit.org` SMART App Launch prefix from advertised profile detection

## [0.1.2] - 2026-04-19

### Added

- OAuth 2.0 bearer token support for secured FHIR servers: `--bearer-token <token>` flag on `analyze` and `compare` commands; falls back to `FHIR_TOKEN` environment variable
- `FetchOptions` type exported from the library for consumer use
- `fetchCapabilityStatement(url, options?)` now accepts an optional `headers` map

### Fixed

- Removed deprecated `tsconfig.json` options (`baseUrl`, `esModuleInterop: false`) that would stop functioning in TypeScript 7.0

## [0.1.1] - 2026-04-19

### Added

- Profile detection for FR Core (Interop'Santé / HL7 France), NL Nictiz (Netherlands), and IHE (Integrating the Healthcare Enterprise)

## [0.1.0] - 2026-04-19

### Added

- `analyze` command: fetch and analyze a FHIR server's CapabilityStatement from a URL or local JSON file
- `compare` command: compare two FHIR servers' capabilities side by side; `--exit-on-diff` flag for CI assertions
- Output formats: `text` (human-readable), `json` (stable machine-consumable schema), `markdown` (tables)
- Profile detection for 9 international/national FHIR profile families: US Core, UK Core, AU Core, AU Base, CA Baseline, IPS, IPA, SMART App Launch, ISiK (Germany)
- Warning rules for common CapabilityStatement issues: missing security, draft status, search-type without search parameters, unrecognized FHIR version, no resources declared
- Browser-safe TypeScript core (`src/core/`, `src/registry/`, `src/formatters/`) — works in Node.js, Deno, Cloudflare Workers, and browser bundles
- Library exports: `fetchCapabilityStatement`, `parseFromJson`, `analyze`, `compare` from main entry; `detectProfiles`, `PROFILE_REGISTRY` from `fhir-capability-analyzer/registry`
- Three example CapabilityStatement fixtures: `examples/hapi-r4.json`, `examples/us-core-server.json`, `examples/ips-server.json`
- VitePress documentation site at [dnlbox.github.io/fhir-capability-analyzer](https://dnlbox.github.io/fhir-capability-analyzer/)
- GitHub Actions: CI (Node 20 + lts/*), docs deploy, npm + GitHub Packages publish on release

[Unreleased]: https://github.com/dnlbox/fhir-capability-analyzer/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/dnlbox/fhir-capability-analyzer/releases/tag/v0.1.2
[0.1.1]: https://github.com/dnlbox/fhir-capability-analyzer/releases/tag/v0.1.1
[0.1.0]: https://github.com/dnlbox/fhir-capability-analyzer/releases/tag/v0.1.0
