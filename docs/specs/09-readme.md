# Spec 09 — README

**Status:** open

## Goal

Write a comprehensive README.md that makes the repository look like a serious, well-maintained
open-source project. The README is the primary marketing and documentation surface.

## Dependencies

- Spec 07 (CLI) complete
- Spec 08 (examples-fixtures) complete

## Deliverables

| File | Description |
|------|-------------|
| `README.md` | Root README |

## Key interfaces / signatures

No code interfaces. This spec produces documentation.

## Implementation notes

### Structure

The README should include these sections in order:

1. **Title and tagline**: `fhir-capability-analyzer` — Fetch, analyze, and compare FHIR server capabilities.

2. **Problem statement**: 2-3 sentences on why this exists. CapabilityStatements are 1000+ lines of
   nested JSON. No tooling exists to summarize or compare them.

3. **Quick start**: One-command usage with `npx`:
   ```bash
   npx fhir-capability-analyzer analyze https://hapi.fhir.org/baseR4
   ```

4. **Sample output**: Show the actual text output from analyzing a real server. Truncated but
   representative.

5. **Installation**: `pnpm add fhir-capability-analyzer` for library use, or `pnpm add -g` for CLI.

6. **CLI Reference**: All commands with flags and examples.

7. **Library API Reference**: The three core functions with TypeScript signatures and usage examples.

8. **Profile Detection**: Table of supported international profiles with country flags and URL patterns.

   | Standard | Country | Detected From |
   |----------|---------|---------------|
   | US Core | US | `http://hl7.org/fhir/us/core/*` |
   | UK Core | GB | `https://fhir.hl7.org.uk/*` |
   | AU Core | AU | `http://hl7.org.au/fhir/core/*` |
   | ISiK | DE | `https://gematik.de/fhir/isik/*` |
   | IPS | International | `http://hl7.org/fhir/uv/ips/*` |
   | ... | ... | ... |

9. **Architecture**: Brief description of the three-layer design (core, formatters, CLI) and
   browser-safety.

10. **Related tools**: Links to `fhir-resource-diff` and `fhir-fixtures` as complementary tools.

11. **Roadmap**: What is planned next (profile validation, IG package resolution, web UI).

12. **Contributing**: Brief guide pointing to CONTRIBUTING.md (if it exists) or inline guidance.

13. **License**: MIT.

### Tone

Professional, concise, practical. Written for engineers who want to evaluate the tool quickly.
No marketing fluff. Show, don't tell — sample output is more convincing than descriptions.

### Accuracy

All code examples in the README must work against the actual CLI and library API. Do not show
hypothetical features that are not implemented.

## Acceptance criteria

- README exists at the repository root.
- All code examples are syntactically correct.
- Quick start command works with npx (after npm publish).
- Sample output matches actual tool output for the given input.
- Profile detection table matches the actual registry entries.
- No broken links.

## Do not do

- Do not include badges that are not yet set up (CI, npm version, etc.) — add them when the
  corresponding infrastructure exists.
- Do not include screenshots of a web UI that does not exist.
- Do not exaggerate capabilities — describe exactly what v1 does.
- Do not include a detailed changelog in the README — that goes in CHANGELOG.md.
