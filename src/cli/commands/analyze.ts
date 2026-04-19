import { readFileSync } from "node:fs";
import pc from "picocolors";
import { fetchCapabilityStatement, parseFromJson, analyze } from "../../core/index.js";
import {
  formatAnalysisText,
  formatAnalysisJson,
  formatAnalysisMarkdown,
} from "../../formatters/index.js";

type OutputFormat = "text" | "json" | "markdown";

interface AnalyzeOptions {
  format: OutputFormat;
}

function isUrl(input: string): boolean {
  return input.startsWith("http://") || input.startsWith("https://");
}

function loadFromFile(filePath: string): unknown {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as unknown;
}

export async function runAnalyze(source: string, options: AnalyzeOptions): Promise<void> {
  let fetchResult;

  if (isUrl(source)) {
    process.stderr.write(pc.dim(`Fetching ${source}...\n`));
    fetchResult = await fetchCapabilityStatement(source);
  } else {
    let raw: unknown;
    try {
      raw = loadFromFile(source);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(pc.red(`Error reading file: ${msg}\n`));
      process.exit(2);
    }
    fetchResult = parseFromJson(raw);
  }

  if (!fetchResult.success) {
    process.stderr.write(pc.red(`Error: ${fetchResult.error}\n`));
    process.exit(2);
  }

  const report = analyze(fetchResult.capability);

  let output: string;
  switch (options.format) {
    case "json":
      output = formatAnalysisJson(report);
      break;
    case "markdown":
      output = formatAnalysisMarkdown(report);
      break;
    default:
      output = formatAnalysisText(report);
  }

  process.stdout.write(output + "\n");

  if (report.warnings.length > 0 && options.format !== "json") {
    process.exit(1);
  }
}
