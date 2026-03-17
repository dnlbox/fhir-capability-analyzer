# Spec 07 — CLI

**Status:** open

## Goal

Implement the CLI adapter that exposes the core library's capabilities as terminal commands.
This is the Node.js-specific layer — file I/O, flags, exit codes, and colored output.

## Dependencies

- Spec 02 (fetch-parse) complete
- Spec 04 (analyze) complete
- Spec 05 (formatters) complete
- Spec 06 (compare) complete

## Deliverables

| File | Description |
|------|-------------|
| `src/cli/index.ts` | CLI entry point and commander setup |
| `src/cli/commands/analyze.ts` | Analyze command implementation |
| `src/cli/commands/compare.ts` | Compare command implementation |
| `tests/cli.test.ts` | CLI integration tests |

## Key interfaces / signatures

### CLI commands

```
fhir-capability-analyzer analyze <source>
fhir-capability-analyzer compare <source-a> <source-b>
```

### Analyze command

```
fhir-capability-analyzer analyze <source>

Arguments:
  source          URL of a FHIR server or path to a local CapabilityStatement JSON file

Options:
  --format, -f    Output format: text, json, markdown (default: text)
  --output, -o    Write output to file instead of stdout
  --no-color      Disable colored output (also respects NO_COLOR env var)
```

### Compare command

```
fhir-capability-analyzer compare <source-a> <source-b>

Arguments:
  source-a        URL or file path for the baseline server
  source-b        URL or file path for the target server

Options:
  --format, -f    Output format: text, json, markdown (default: text)
  --output, -o    Write output to file instead of stdout
  --no-color      Disable colored output
```

## Implementation notes

### Source resolution

The CLI must determine whether a source argument is a URL or a file path:
- If it starts with `http://` or `https://` → treat as URL, use `fetchCapabilityStatement()`.
- Otherwise → treat as file path, read with `node:fs`, parse JSON, use `parseCapabilityStatement()`.

### Exit codes

- `0` — success
- `1` — error (network failure, invalid file, parse error)

### Colored output

- Use `picocolors` for terminal colors, but only in the CLI layer.
- Respect `NO_COLOR` environment variable (https://no-color.org/).
- The `--no-color` flag forces plain output.
- Color enhancement is applied after formatting — the formatters themselves produce plain text.

### Error handling

- Display errors to stderr, not stdout.
- Include actionable context: "Failed to fetch CapabilityStatement from https://...: connection refused"
- For file errors: "File not found: ./capability.json"
- For parse errors: "Invalid CapabilityStatement: missing resourceType field"

### File output

When `--output` is specified, write the formatted output to the given file path instead of stdout.
Still print a confirmation message to stderr: "Report written to output.md"

### Shebang and bin

The CLI entry point must include `#!/usr/bin/env node` at the top.
The `bin` field in `package.json` maps `fhir-capability-analyzer` to `./dist/cli/index.js`.

## Acceptance criteria

```bash
pnpm build        # produces dist/cli/index.js with shebang

# Analyze a remote server (requires network — manual test)
node dist/cli/index.js analyze https://hapi.fhir.org/baseR4

# Analyze a local file
node dist/cli/index.js analyze ./examples/hapi-r4.json

# JSON output
node dist/cli/index.js analyze ./examples/hapi-r4.json --format json

# Markdown output
node dist/cli/index.js analyze ./examples/hapi-r4.json --format markdown

# Compare two files
node dist/cli/index.js compare ./examples/hapi-r4.json ./examples/smart-r4.json

# File output
node dist/cli/index.js analyze ./examples/hapi-r4.json --format markdown --output report.md

# Error case: invalid URL
node dist/cli/index.js analyze https://not-a-real-server.example.com
# → exits 1 with error message to stderr

# Error case: file not found
node dist/cli/index.js analyze ./nonexistent.json
# → exits 1 with error message to stderr
```

Tests should cover:
- Source detection: URL vs file path logic.
- Successful analyze command with local file input (mock file read).
- Successful compare command with two local files.
- Error handling: file not found, network error, parse error.
- Format flag is passed through correctly.

## Do not do

- Do not add interactive prompts or menus.
- Do not add a `--watch` mode.
- Do not add authentication flags (--token, --auth) — secured server access is out of scope for v1.
- Do not add a `diff` subcommand — `compare` is the verb for this tool.
- Do not read from stdin in v1 — that can be added later.
