# Profile detection

`fhir-capability-analyzer` detects conformance to known international and national FHIR profiles
by matching profile URLs declared in the CapabilityStatement.

## How it works

The analyzer collects profile URLs from three locations:

1. `CapabilityStatement.instantiates[]` — CapabilityStatements this server conforms to
2. `CapabilityStatement.implementationGuide[]` — IGs this server implements
3. Per-resource `profile` and `supportedProfile[]` fields

Each collected URL is matched against the profile registry using prefix matching.
A URL matches an entry if it starts with that entry's `urlPattern`.

## Supported profiles

| Standard | Country | Canonical URL prefix |
|----------|---------|------------|
| US Core | 🇺🇸 us | `http://hl7.org/fhir/us/core/` |
| UK Core | 🇬🇧 uk | `https://fhir.hl7.org.uk/` |
| UK Core (NHS) | 🇬🇧 uk | `https://fhir.nhs.uk/` |
| AU Core | 🇦🇺 au | `http://hl7.org.au/fhir/core/` |
| AU Base | 🇦🇺 au | `http://hl7.org.au/fhir/` |
| CA Baseline | 🇨🇦 ca | `http://hl7.org/fhir/ca/baseline/` |
| IPS | 🌍 international | `http://hl7.org/fhir/uv/ips/` |
| IPA | 🌍 international | `http://hl7.org/fhir/uv/ipa/` |
| SMART App Launch | 🌍 international | `http://hl7.org/fhir/smart-app-launch/` |
| ISiK | 🇩🇪 de | `https://gematik.de/fhir/isik/` |
| ISiK | 🇩🇪 de | `https://gematik.de/fhir/ISiK/` |

## Using the registry in library code

```typescript
import { detectProfiles } from "fhir-capability-analyzer/registry";

const profiles = detectProfiles([
  "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
  "http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips",
]);

// [
//   { url: "...", name: "US Core", country: "us", standard: "US Core" },
//   { url: "...", name: "IPS", country: "international", standard: "IPS" },
// ]
```

## Extending the registry

The profile registry (`src/registry/profiles.ts`) is a plain data array.
Adding a new profile family = adding a new entry:

```typescript
{
  urlPattern: "http://hl7.org/fhir/fr/core/",
  name: "FR Core",
  country: "fr",
  standard: "FR Core",
}
```

See [CONTRIBUTING](https://github.com/dnlbox/fhir-capability-analyzer/blob/main/CONTRIBUTING.md)
for how to open a PR to add a new profile family.

## Limitations

Profile detection is URL-based — it matches URLs that the server *declares*, not validates.
A server that declares a US Core profile URL is not guaranteed to fully conform to US Core.
For full profile conformance validation, use the
[HL7 FHIR Validator](https://confluence.hl7.org/display/FHIR/Using+the+FHIR+Validator).
