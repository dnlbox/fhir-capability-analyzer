# Spec 00 — Project setup

**Status:** open

## Goal

Bootstrap the repository with all tooling configuration so subsequent specs can immediately write
TypeScript, run tests, and build without additional setup.

## Dependencies

None. This is the first spec.

## Deliverables

| File | Description |
|------|-------------|
| `package.json` | pnpm workspace, scripts, dependencies |
| `tsconfig.json` | Strict TypeScript config |
| `tsconfig.build.json` | Build-only config (excludes tests) |
| `.eslintrc.cjs` | ESLint config (TypeScript-aware) |
| `.prettierrc` | Prettier config |
| `vitest.config.ts` | Vitest config |
| `.nvmrc` | Node version pin |

## Key configuration details

### package.json

```json
{
  "name": "fhir-capability-analyzer",
  "version": "0.1.0",
  "description": "CLI and library for fetching, analyzing, and reporting on FHIR server CapabilityStatements",
  "type": "module",
  "bin": { "fhir-capability-analyzer": "./dist/cli/index.js" },
  "main": "./dist/core/index.js",
  "exports": {
    ".": "./dist/core/index.js",
    "./registry": "./dist/registry/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "prepublishOnly": "pnpm build && pnpm typecheck && pnpm test"
  }
}
```

Key dependencies to install (use latest compatible versions):
- **runtime:** `zod`, `commander`, `picocolors`
- **devDependencies:** `typescript`, `tsup`, `vitest`, `@vitest/coverage-v8`, `eslint`,
  `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `prettier`,
  `eslint-config-prettier`

### tsconfig.json

- `target`: `ES2022`
- `module`: `NodeNext`
- `moduleResolution`: `NodeNext`
- `strict`: `true`
- `noUncheckedIndexedAccess`: `true`
- `exactOptionalPropertyTypes`: `true`
- `include`: `["src", "tests"]`

### tsup config (in package.json or `tsup.config.ts`)

- Entry points: `src/core/index.ts`, `src/cli/index.ts`, `src/registry/index.ts`
- Format: `esm`
- `dts`: true (generate `.d.ts` for library consumers)
- `clean`: true

### vitest.config.ts

- Use `globals: false` — explicit imports preferred
- Coverage provider: `v8`
- Test file pattern: `tests/**/*.test.ts`

## Implementation notes

- Use `"type": "module"` — the whole project is ESM.
- `.eslintrc.cjs` must use CommonJS (`module.exports`) since ESLint config pre-v9 doesn't support
  ESM config well with Node moduleResolution.
- Set `noUncheckedIndexedAccess: true` — this forces explicit handling of array access, which
  matters when parsing deeply nested CapabilityStatement JSON.
- The `exports` field includes both the core library and the registry as separate entry points.
  Library consumers who only need profile detection can import from `fhir-capability-analyzer/registry`.

## Acceptance criteria

```bash
pnpm install          # no errors
pnpm typecheck        # passes with zero errors (src/ is empty stubs at this point)
pnpm lint             # passes
pnpm build            # produces dist/ directory
pnpm test             # passes (0 tests is fine at this stage)
```

## Do not do

- Do not install React, Vite, or any UI framework — that is a future phase.
- Do not install `ink`, `blessed`, or any terminal UI library.
- Do not install `node-fetch` — use the standard `fetch()` API (Node 18+).
- Do not create any `src/` implementation files in this spec — only tooling config.
