import type { AnalysisReport, ComparisonReport } from "../core/types.js";

/**
 * Format an AnalysisReport as a stable JSON string.
 * The structure matches the AnalysisReport type exactly — suitable for
 * machine consumption, CI pipelines, and AI agent tooling.
 * Browser-safe — no Node imports.
 */
export function formatAnalysisJson(report: AnalysisReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Format a ComparisonReport as a stable JSON string.
 * Browser-safe — no Node imports.
 */
export function formatComparisonJson(report: ComparisonReport): string {
  return JSON.stringify(report, null, 2);
}
