#!/usr/bin/env node
// Injected at build time by tsup (and in tests by vitest.config.ts define).
// See tsup.config.ts for the define configuration.
declare const __PACKAGE_VERSION__: string;

import { Command } from "commander";
import { runAnalyze } from "./commands/analyze.js";
import { runCompare } from "./commands/compare.js";

const cliVersion = typeof __PACKAGE_VERSION__ === "string" ? __PACKAGE_VERSION__ : "dev";

const program = new Command();

program
  .name("fhir-capability-analyzer")
  .description("Fetch, analyze, and compare FHIR server CapabilityStatements")
  .version(cliVersion, "-v, --version");

program
  .command("analyze <source>")
  .description("Analyze a FHIR server's capabilities from a URL or local JSON file")
  .option("-f, --format <format>", "Output format: text | json | markdown", "text")
  .option("--bearer-token <token>", "Bearer token for OAuth 2.0 protected servers (overrides FHIR_TOKEN env var)")
  .action(async (source: string, options: { format: string; bearerToken?: string }) => {
    const format = options.format as "text" | "json" | "markdown";
    await runAnalyze(source, { format, ...(options.bearerToken ? { bearerToken: options.bearerToken } : {}) });
  });

program
  .command("compare <sourceA> <sourceB>")
  .description("Compare two FHIR servers' capabilities (URLs or local JSON files)")
  .option("-f, --format <format>", "Output format: text | json | markdown", "text")
  .option("--exit-on-diff", "Exit with code 1 when differences are found", false)
  .option("--bearer-token <token>", "Bearer token for OAuth 2.0 protected servers (overrides FHIR_TOKEN env var)")
  .action(
    async (
      sourceA: string,
      sourceB: string,
      options: { format: string; exitOnDiff: boolean; bearerToken?: string },
    ) => {
      const format = options.format as "text" | "json" | "markdown";
      await runCompare(sourceA, sourceB, { format, exitOnDiff: options.exitOnDiff, ...(options.bearerToken ? { bearerToken: options.bearerToken } : {}) });
    },
  );

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(2);
});
