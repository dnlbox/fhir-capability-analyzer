# Exit codes

## analyze

| Code | Meaning |
|------|---------|
| `0` | Success — analysis complete, no warnings found |
| `1` | Success — analysis complete, but warnings were found (text and markdown modes only) |
| `2` | Error — failed to fetch or parse the CapabilityStatement |

In JSON mode (`--format json`), warnings are included in the output but the exit code is always `0`
on a successful parse. This lets downstream tooling inspect warnings programmatically without
treating them as a build failure.

## compare

| Code | Meaning |
|------|---------|
| `0` | Success — comparison complete (differences may or may not exist) |
| `1` | Differences found AND `--exit-on-diff` flag was set |
| `2` | Error — failed to fetch or parse one or both CapabilityStatements |

By default, `compare` always exits `0` on success regardless of whether differences exist.
Use `--exit-on-diff` to make CI fail when capabilities diverge from the baseline.
