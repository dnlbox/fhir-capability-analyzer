# Research: CapabilityStatement resource structure

Reference: [HL7 FHIR R4 CapabilityStatement](https://hl7.org/fhir/R4/capabilitystatement.html)

This document maps the full structure of a FHIR CapabilityStatement resource, focusing on the
fields relevant to capability analysis and comparison.

## Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `resourceType` | string | Always "CapabilityStatement" |
| `id` | string | Logical ID |
| `url` | uri | Canonical URL for this CapabilityStatement |
| `version` | string | Business version |
| `name` | string | Computer-friendly name |
| `title` | string | Human-friendly name |
| `status` | code | draft \| active \| retired \| unknown |
| `experimental` | boolean | For testing purposes, not real usage |
| `date` | dateTime | Date last changed |
| `publisher` | string | Name of the publisher |
| `description` | markdown | Natural language description |
| `kind` | code | instance \| capability \| requirements |
| `fhirVersion` | code | FHIR version (e.g., "4.0.1") |
| `format` | code[] | Formats supported (json, xml, etc.) |
| `patchFormat` | code[] | Patch formats supported |
| `implementationGuide` | canonical[] | IGs this server implements |
| `instantiates` | canonical[] | CapabilityStatements this server conforms to |
| `imports` | canonical[] | CapabilityStatements imported |

## rest[] — RESTful capabilities

The `rest` array describes RESTful server or client capabilities. Most servers have exactly one
entry with `mode: "server"`.

### rest[].mode
`client` or `server`. For analysis, we care about `server` entries.

### rest[].security

| Field | Type | Description |
|-------|------|-------------|
| `cors` | boolean | Whether CORS is enabled |
| `service` | CodeableConcept[] | Auth services (SMART-on-FHIR, OAuth, Basic, etc.) |
| `description` | markdown | General security description |

Security service codes (from `http://terminology.hl7.org/CodeSystem/restful-security-service`):
- `OAuth` — OAuth
- `SMART-on-FHIR` — SMART App Launch
- `NTLM` — NTLM
- `Basic` — Basic auth
- `Kerberos` — Kerberos
- `Certificates` — Certificates

### rest[].resource[] — per-resource capabilities

This is the most detailed and voluminous section.

| Field | Type | Description |
|-------|------|-------------|
| `type` | code | Resource type (e.g., "Patient") |
| `profile` | canonical | Base profile for this resource |
| `supportedProfile` | canonical[] | Additional profiles supported |
| `interaction` | array | Interactions supported |
| `versioning` | code | no-version \| versioned \| versioned-update |
| `readHistory` | boolean | Whether vRead is supported |
| `updateCreate` | boolean | Whether update can create new resources |
| `conditionalCreate` | boolean | Conditional create supported |
| `conditionalRead` | code | not-supported \| modified-since \| not-match \| full-support |
| `conditionalUpdate` | boolean | Conditional update supported |
| `conditionalDelete` | code | not-supported \| single \| multiple |
| `referencePolicy` | code[] | literal \| logical \| resolves \| enforced \| local |
| `searchInclude` | string[] | _include values supported |
| `searchRevInclude` | string[] | _revinclude values supported |
| `searchParam` | array | Search parameters supported |
| `operation` | array | Operations supported on this resource |

### rest[].resource[].interaction[]

Each interaction has:
- `code`: read \| vread \| update \| patch \| delete \| history-instance \| history-type \| create \| search-type

### rest[].resource[].searchParam[]

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Name of search parameter |
| `definition` | canonical | URL of the SearchParameter definition |
| `type` | code | number \| date \| string \| token \| reference \| composite \| quantity \| uri \| special |
| `documentation` | markdown | Description of the parameter |

### rest[].resource[].operation[]

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Operation name (e.g., "validate") |
| `definition` | canonical | URL of the OperationDefinition |
| `documentation` | markdown | Description |

### rest[].interaction[] — system-level interactions

Same structure as resource-level interactions but applies to the server as a whole:
- `transaction`
- `batch`
- `search-system`
- `history-system`

### rest[].searchParam[] — system-level search parameters

Search parameters that apply across all resources (e.g., `_id`, `_lastUpdated`).

### rest[].operation[] — system-level operations

Operations available at the system level (e.g., `$everything`, `$validate`).

## messaging[] — messaging capabilities

| Field | Type | Description |
|-------|------|-------------|
| `endpoint` | array | Where messages should be sent |
| `reliableCache` | unsignedInt | Cache length in minutes |
| `documentation` | markdown | Description |
| `supportedMessage` | array | Messages supported |

### messaging[].supportedMessage[]

| Field | Type | Description |
|-------|------|-------------|
| `mode` | code | sender \| receiver |
| `definition` | canonical | MessageDefinition reference |

## document[] — document capabilities

| Field | Type | Description |
|-------|------|-------------|
| `mode` | code | producer \| consumer |
| `documentation` | markdown | Description |
| `profile` | canonical | Profile for documents produced/consumed |

## Structural observations for the analyzer

1. **rest[] is the core**: For server analysis, `rest[0]` (where `mode === "server"`) contains
   95%+ of the useful information. The analyzer should focus here.

2. **Profile URLs are the conformance signal**: `rest[].resource[].profile`,
   `rest[].resource[].supportedProfile[]`, `instantiates[]`, and `implementationGuide[]` are
   the fields that declare profile conformance.

3. **Search parameters are the integration surface**: For integration planning, search parameters
   determine what queries are possible. A resource that supports `read` but has no search
   parameters is limited in practical utility.

4. **Security is often incomplete**: Many servers declare minimal or no security information in
   their CapabilityStatement, even when they enforce authentication. The analyzer should warn
   about this.

5. **messaging[] and document[] are rare**: Most servers are purely RESTful. These sections are
   present in the spec but uncommon in practice. The analyzer should handle them if present but
   not emphasize them.
