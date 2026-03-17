# Research: Known FHIR profile registry

This document catalogs the URL patterns, canonical URLs, and metadata for known FHIR profiles
and implementation guides. The analyzer uses this registry to detect which standards a server
claims to conform to.

## Registry design

The registry is a data structure mapping URL patterns to profile metadata:

```typescript
interface ProfileRegistryEntry {
  /** Regex pattern matching profile/IG URLs from this standard */
  urlPattern: RegExp;
  /** Human-readable name of the standard */
  name: string;
  /** ISO 3166-1 alpha-2 country code, or "international" */
  country: string;
  /** Standard family name (e.g., "US Core", "IPS") */
  standard: string;
  /** Known CapabilityStatement canonical URL, if applicable */
  capabilityStatementUrl?: string;
}
```

---

## US Core (United States)

- **Publisher**: HL7 US Realm
- **Profile URL pattern**: `http://hl7.org/fhir/us/core/StructureDefinition/*`
- **CapabilityStatement URL**: `http://hl7.org/fhir/us/core/CapabilityStatement/us-core-server`
- **IG base URL**: `http://hl7.org/fhir/us/core`
- **Versions**: 3.1.1, 5.0.1, 6.1.0, 7.0.0
- **Key resources**: Patient, Condition, Observation, AllergyIntolerance, CarePlan, CareTeam,
  DiagnosticReport, DocumentReference, Encounter, Goal, Immunization, Location, Medication,
  MedicationRequest, Organization, Practitioner, Procedure
- **Notes**: The dominant US profile set. Required by ONC and CMS regulations. Most US-based
  EHR systems declare some level of US Core conformance.

## UK Core (United Kingdom)

- **Publisher**: HL7 UK / NHS Digital
- **Profile URL pattern**: `https://fhir.hl7.org.uk/StructureDefinition/*`
- **IG base URL**: `https://fhir.hl7.org.uk`
- **NHS Digital API profiles**: `https://fhir.nhs.uk/StructureDefinition/*`
- **Notes**: UK Core profiles are maintained by HL7 UK. NHS Digital publishes additional
  profiles specific to NHS services. Both URL patterns should be detected.

## AU Core (Australia)

- **Publisher**: HL7 Australia
- **Profile URL pattern**: `http://hl7.org.au/fhir/core/StructureDefinition/*`
- **IG base URL**: `http://hl7.org.au/fhir/core`
- **Notes**: AU Core is the Australian equivalent of US Core — a minimal set of profiles
  for national interoperability.

### AU Base (Australia — base profiles)

- **Profile URL pattern**: `http://hl7.org.au/fhir/StructureDefinition/*`
- **IG base URL**: `http://hl7.org.au/fhir`
- **Notes**: AU Base profiles are the foundation that AU Core builds upon. Servers may
  reference AU Base profiles without claiming AU Core conformance.

## CA Baseline (Canada)

- **Publisher**: HL7 Canada
- **Profile URL pattern**: `http://hl7.org/fhir/ca/baseline/StructureDefinition/*`
- **IG base URL**: `http://hl7.org/fhir/ca/baseline`
- **Notes**: The Canadian baseline profiles. Less mature than US Core but growing in adoption.

## ISiK (Germany)

- **Publisher**: gematik GmbH
- **Profile URL pattern**: `https://gematik.de/fhir/isik/StructureDefinition/*`
  - Also: `https://gematik.de/fhir/isik/v*/StructureDefinition/*` (versioned URLs)
- **IG base URL**: `https://gematik.de/fhir/isik`
- **Conformance levels**:
  - **Stufe 1** (Level 1): Basic interoperability — Patient, Encounter, Condition, Procedure
  - **Stufe 2** (Level 2): Adds medication, diagnostic reports, scheduling
  - **Stufe 3** (Level 3): Adds documents, messaging, extended workflows
- **Notes**: ISiK (Informationstechnische Systeme im Krankenhaus) is Germany's mandatory
  hospital interoperability standard. Enforced by law via the Krankenhauszukunftsgesetz (KHZG).

## IPS (International Patient Summary)

- **Publisher**: HL7 International
- **Profile URL pattern**: `http://hl7.org/fhir/uv/ips/StructureDefinition/*`
- **IG base URL**: `http://hl7.org/fhir/uv/ips`
- **Key operation**: `$summary` — generates an IPS Bundle for a patient
- **Key resources**: Patient, AllergyIntolerance, Condition, Medication, MedicationStatement,
  Immunization, Procedure, DiagnosticReport, Observation (various types)
- **Notes**: Cross-border patient summary standard. Based on European Patient Summary (EN 17269).
  Used for cross-border healthcare in the EU (MyHealth@EU).

## IPA (International Patient Access)

- **Publisher**: HL7 International
- **Profile URL pattern**: `http://hl7.org/fhir/uv/ipa/StructureDefinition/*`
- **IG base URL**: `http://hl7.org/fhir/uv/ipa`
- **CapabilityStatement URL**: `http://hl7.org/fhir/uv/ipa/CapabilityStatement/ipa-server`
- **Notes**: Defines a minimal set of access capabilities for international patient-facing apps.
  Builds on SMART App Launch.

## SMART App Launch

- **Publisher**: HL7 International
- **Profile URL pattern**: `http://hl7.org/fhir/smart-app-launch/StructureDefinition/*`
- **IG base URL**: `http://hl7.org/fhir/smart-app-launch`
- **CapabilityStatement URL**: `http://hl7.org/fhir/smart-app-launch/CapabilityStatement/smart-app-launch`
- **Notes**: Not a clinical profile but an authorization framework. Detected via security
  service codes and well-known configuration endpoints. Widely adopted globally.

## FR Core (France)

- **Publisher**: Interop-Sante (HL7 France)
- **Profile URL pattern**: `http://interopsante.org/fhir/StructureDefinition/*`
  - Also: `https://hl7.fr/ig/fhir/core/StructureDefinition/*`
- **IG base URL**: `https://hl7.fr/ig/fhir/core`
- **Notes**: French national profiles for interoperability. Maintained by Interop-Sante,
  the French HL7 affiliate.

## nictiz (Netherlands)

- **Publisher**: Nictiz (Dutch national competence center for e-health)
- **Profile URL pattern**: `http://nictiz.nl/fhir/StructureDefinition/*`
- **IG base URL**: `http://nictiz.nl/fhir`
- **Also known patterns**: `http://fhir.nl/fhir/StructureDefinition/*`
- **Notes**: Dutch national profiles. Nictiz manages the information standards for
  healthcare in the Netherlands.

## ABDM (India)

- **Publisher**: National Resource Centre for EHR Standards (NRCeS) / ABDM
- **Profile URL pattern**: `https://nrces.in/ndhm/fhir/r4/StructureDefinition/*`
- **IG base URL**: `https://nrces.in/ndhm/fhir/r4`
- **Notes**: India's Ayushman Bharat Digital Mission (ABDM) FHIR profiles. Part of the
  National Digital Health Mission.

---

## Detection strategy

The analyzer detects profile conformance by checking these CapabilityStatement fields
against the registry:

1. **`instantiates[]`** — Canonical URLs of CapabilityStatements this server claims to conform to.
   Direct match against known CapabilityStatement URLs.

2. **`implementationGuide[]`** — Canonical URLs of IGs this server implements. Match against
   known IG base URLs.

3. **`rest[].resource[].profile`** — Base profile per resource type. Match URL prefix against
   known profile URL patterns.

4. **`rest[].resource[].supportedProfile[]`** — Additional profiles per resource type. Same
   prefix matching.

5. **`rest[].security.service[]`** — Security service codes. Used for detecting SMART App Launch.

The detection is URL-pattern-based. It does not download or validate the actual profile content.
This is intentional for v1 — the goal is to report what the server *declares*, not to verify
those declarations are accurate.

## Extensibility

Adding a new country or standard to the registry requires:
1. Adding a new entry to the registry data array
2. Specifying the URL pattern, name, country code, and standard name
3. No code changes required — just data

The registry should be structured as a plain TypeScript data file that is easy for contributors
to extend by adding entries.
