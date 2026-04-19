import { readFileSync } from "node:fs";
import pc from "picocolors";
import { fetchCapabilityStatement, parseFromJson, compare } from "../../core/index.js";
import {
  formatComparisonText,
  formatComparisonJson,
  formatComparisonMarkdown,
} from "../../formatters/index.js";
import type { FetchResult } from "../../core/types.js";

type OutputFormat = "text" | "json" | "markdown";

interface CompareOptions {
  format: OutputFormat;
  exitOnDiff: boolean;
}

function isUrl(input: string): boolean {
  return input.startsWith("http://") || input.startsWith("https://");
}

function loadFromFile(filePath: string): unknown {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as unknown;
}

async function resolve(source: string): Promise<FetchResult> {
  if (isUrl(source)) {
    process.stderr.write(pc.dim(`Fetching ${source}...\n`));
    return fetchCapabilityStatement(source);
  }
  let raw: unknown;
  try {
    raw = loadFromFile(source);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Error reading file: ${msg}` };
  }
  return parseFromJson(raw);
}

export async function runCompare(
  sourceA: string,
  sourceB: string,
  options: CompareOptions,
): Promise<void> {
  const [resultA, resultB] = await Promise.all([resolve(sourceA), resolve(sourceB)]);

  if (!resultA.success) {
    process.stderr.write(pc.red(`Error loading A: ${resultA.error}\n`));
    process.exit(2);
  }
  if (!resultB.success) {
    process.stderr.write(pc.red(`Error loading B: ${resultB.error}\n`));
    process.exit(2);
  }

  const report = compare(resultA.capability, resultB.capability);
  const hasDiff = report.added.length > 0 || report.removed.length > 0 || report.changed.length > 0;

  let output: string;
  switch (options.format) {
    case "json":
      output = formatComparisonJson(report);
      break;
    case "markdown":
      output = formatComparisonMarkdown(report, sourceA, sourceB);
      break;
    default:
      output = formatComparisonText(report, sourceA, sourceB);
  }

  process.stdout.write(output + "\n");

  if (options.exitOnDiff && hasDiff) {
    process.exit(1);
  }
}
