# Spec 08 — Examples and fixtures

**Status:** open

## Goal

Fetch and store sample CapabilityStatements from public FHIR servers for use as examples
and test fixtures. These serve three purposes: demonstrating the tool, running integration
tests, and providing realistic data for development.

## Dependencies

- Spec 07 (CLI) complete

## Deliverables

| File | Description |
|------|-------------|
| `examples/hapi-r4.json` | CapabilityStatement from HAPI FHIR R4 server |
| `examples/smart-r4.json` | CapabilityStatement from SMART Health IT Sandbox |
| `examples/minimal.json` | Hand-crafted minimal valid CapabilityStatement |
| `examples/us-core.json` | CapabilityStatement declaring US Core profiles (hand-crafted or from a public server) |
| `tests/fixtures/` | Symlinks or copies of examples for test imports |

## Key interfaces / signatures

No new code interfaces. This spec produces data files.

## Implementation notes

### Fetching from public servers

Fetch CapabilityStatements from these publicly available FHIR servers:

1. **HAPI FHIR R4**: `https://hapi.fhir.org/baseR4/metadata`
   - Large, comprehensive CapabilityStatement with many resource types
   - Good for demonstrating the "information overload" problem the tool solves

2. **SMART Health IT Sandbox**: `https://launch.smarthealthit.org/v/r4/fhir/metadata`
   - Declares SMART App Launch security
   - Good for testing security analysis

If either server is unavailable at fetch time, create a realistic hand-crafted equivalent
based on the known structure.

### Hand-crafted fixtures

3. **Minimal**: A valid CapabilityStatement with only the required fields.
   Useful for testing edge cases and as a clear example of the minimum structure.

4. **US Core**: A CapabilityStatement that declares US Core profiles on its resources.
   This may be fetched from a public US Core reference server or hand-crafted.
   Must include `instantiates` and `supportedProfile` entries with US Core URLs.

### File format

- All files are pretty-printed JSON (2-space indent).
- Include a comment at the top of hand-crafted files (as a `_comment` field) noting
  they are example data for testing.
- Fetched files should be stored as-is, with only formatting normalization.

### Test fixture usage

Tests should import fixture data directly:
```typescript
import hapiR4 from '../examples/hapi-r4.json' assert { type: 'json' };
```

Or read from filesystem in tests:
```typescript
const raw = JSON.parse(readFileSync('./examples/hapi-r4.json', 'utf-8'));
```

### Size consideration

Real CapabilityStatements can be large (100KB+). This is expected and acceptable for
example files. They should be committed to the repository.

## Acceptance criteria

```bash
# Each example file is valid JSON
cat examples/hapi-r4.json | node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"

# Each example file has resourceType: CapabilityStatement
node -e "const f=require('fs').readFileSync('examples/minimal.json','utf8'); console.log(JSON.parse(f).resourceType)"
# → CapabilityStatement

# The CLI can analyze each example
node dist/cli/index.js analyze examples/hapi-r4.json
node dist/cli/index.js analyze examples/minimal.json
node dist/cli/index.js analyze examples/us-core.json

# The CLI can compare two examples
node dist/cli/index.js compare examples/hapi-r4.json examples/smart-r4.json
```

## Do not do

- Do not include CapabilityStatements from private or authenticated servers.
- Do not include PHI or real patient data (CapabilityStatements are metadata, not patient data,
  so this is not normally a concern — but verify).
- Do not modify fetched data beyond formatting — preserve the original content.
- Do not create fixtures for every possible edge case — focus on realistic, representative examples.
