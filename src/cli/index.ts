#!/usr/bin/env node
// Injected at build time by tsup (and in tests by vitest.config.ts define).
// See tsup.config.ts for the define configuration.
declare const __PACKAGE_VERSION__: string;

import { Command } from "commander";
import { runAnalyze } from "./commands/analyze.js";
import { runCompare } from "./commands/compare.js";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  .action(async (source: string, options: { format: string }) => {
    const format = options.format as "text" | "json" | "markdown";
    await runAnalyze(source, { format });
  });

program
  .command("compare <sourceA> <sourceB>")
  .description("Compare two FHIR servers' capabilities (URLs or local JSON files)")
  .option("-f, --format <format>", "Output format: text | json | markdown", "text")
  .option("--exit-on-diff", "Exit with code 1 when differences are found", false)
  .action(
    async (
      sourceA: string,
      sourceB: string,
      options: { format: string; exitOnDiff: boolean },
    ) => {
      const format = options.format as "text" | "json" | "markdown";
      await runCompare(sourceA, sourceB, { format, exitOnDiff: options.exitOnDiff });
    },
  );

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(2);
});
