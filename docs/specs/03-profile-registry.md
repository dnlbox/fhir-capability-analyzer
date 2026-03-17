# Spec 03 — Profile registry

**Status:** open

## Goal

Implement a machine-readable registry of known FHIR profiles and implementation guides, and a
function to detect which profiles a server conforms to based on URLs found in its CapabilityStatement.

## Dependencies

- Spec 01 (core types) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/registry/profiles.ts` | Profile registry data and detection function |
| `src/registry/types.ts` | Registry-specific types (ProfileRegistryEntry) |
| `src/registry/index.ts` | Re-exports from registry module |
| `tests/profile-registry.test.ts` | Tests for profile detection |

## Key interfaces / signatures

```typescript
/** A single entry in the profile registry. */
export interface ProfileRegistryEntry {
  /** Regex pattern matching profile/IG URLs from this standard */
  urlPattern: RegExp;
  /** Human-readable name of the standard */
  name: string;
  /** ISO 3166-1 alpha-2 country code, or "international" */
  country: string;
  /** Standard family name (e.g., "US Core", "ISiK") */
  standard: string;
  /** Known CapabilityStatement canonical URL, if applicable */
  capabilityStatementUrl?: string;
}

/**
 * Detect which known profiles the given URLs conform to.
 * Checks all URLs against all registry entries and returns matches.
 */
export function detectProfiles(profileUrls: string[]): ProfileConformance[];

/**
 * The full registry. Exported for consumers who want to extend or inspect it.
 */
export const PROFILE_REGISTRY: readonly ProfileRegistryEntry[];
```

## Implementation notes

### Registry entries

The registry must include entries for all profiles documented in `docs/research/02-profile-registry.md`:

| Standard | Country | URL pattern |
|----------|---------|-------------|
| US Core | US | `http://hl7.org/fhir/us/core/` |
| UK Core | GB | `https://fhir.hl7.org.uk/` |
| NHS Digital | GB | `https://fhir.nhs.uk/` |
| AU Core | AU | `http://hl7.org.au/fhir/core/` |
| AU Base | AU | `http://hl7.org.au/fhir/` (but not `/core/`) |
| CA Baseline | CA | `http://hl7.org/fhir/ca/baseline/` |
| ISiK | DE | `https://gematik.de/fhir/isik/` |
| FR Core | FR | `https://hl7.fr/ig/fhir/core/` and `http://interopsante.org/fhir/` |
| nictiz | NL | `http://nictiz.nl/fhir/` and `http://fhir.nl/fhir/` |
| ABDM | IN | `https://nrces.in/ndhm/fhir/` |
| IPS | international | `http://hl7.org/fhir/uv/ips/` |
| IPA | international | `http://hl7.org/fhir/uv/ipa/` |
| SMART App Launch | international | `http://hl7.org/fhir/smart-app-launch/` |

### Detection logic

The `detectProfiles` function:
1. Takes an array of all profile URLs found in the CapabilityStatement (from `profile`,
   `supportedProfile`, `instantiates`, `implementationGuide` fields).
2. Tests each URL against each registry entry's `urlPattern`.
3. Returns a deduplicated list of `ProfileConformance` objects.
4. Each match produces a `ProfileConformance` with the URL, standard name, country, and
   optionally a version if it can be extracted from the URL.

### Version extraction

Some profile URLs contain version information:
- `http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient|6.1.0` — version after `|`
- Version extraction is best-effort. If the URL does not contain version info, `version` is undefined.

### Browser safety

- The registry is a plain data array. No Node imports, no side effects.
- `detectProfiles` is a pure function.

### Extensibility

The registry should be structured so that adding a new country or standard is:
1. Add a new object to the `PROFILE_REGISTRY` array.
2. No other code changes needed.

## Acceptance criteria

```bash
pnpm typecheck    # passes
pnpm test         # registry tests pass
```

Tests should cover:
- US Core profile URL is correctly detected as US Core / US.
- UK Core profile URL is correctly detected as UK Core / GB.
- ISiK profile URL is correctly detected as ISiK / DE.
- IPS profile URL is correctly detected as IPS / international.
- Unknown URL returns no match.
- Mixed list of URLs from multiple countries returns all correct matches.
- Deduplication: same standard detected from multiple URLs is listed once per standard.
- AU Base vs AU Core distinction: AU Core URLs match AU Core, AU Base URLs (not containing `/core/`)
  match AU Base.
- Version extraction from URLs containing `|version`.

## Do not do

- Do not download or resolve profile content from URLs — detection is URL-pattern-based only.
- Do not validate that the server actually implements the profile correctly.
- Do not hard-code specific profile resource names (e.g., "us-core-patient") — use URL prefix matching.
- Do not import from `src/core/` — the registry is independent. Types shared with core should
  live in `src/registry/types.ts` and be re-exported from both modules.
