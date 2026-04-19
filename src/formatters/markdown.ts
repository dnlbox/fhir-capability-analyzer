import type { AnalysisReport, ComparisonReport } from "../core/types.js";

/**
 * Format an AnalysisReport as a Markdown document.
 * Browser-safe — no Node imports.
 */
export function formatAnalysisMarkdown(report: AnalysisReport): string {
  const { server, summary, conformance, warnings } = report;
  const lines: string[] = [];

  lines.push(`# FHIR Capability Analysis`);
  lines.push(``);
  lines.push(`**Server:** ${server.name ?? "(unnamed)"}`);
  if (server.publisher) lines.push(`**Publisher:** ${server.publisher}`);
  lines.push(`**FHIR Version:** ${server.fhirVersion || "(unknown)"}`);
  lines.push(`**Status:** ${server.status}`);
  if (server.format.length > 0) {
    lines.push(`**Formats:** ${server.format.join(", ")}`);
  }
  lines.push(``);

  // Summary table
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Resources | ${summary.resourceCount} |`);
  lines.push(`| Operations | ${summary.operationCount} |`);
  lines.push(`| Distinct profile URLs | ${summary.profileCount} |`);
  lines.push(`| Total search parameters | ${summary.searchParamCount} |`);
  lines.push(`| Total interactions | ${summary.interactionCount} |`);
  lines.push(``);

  // Resources
  lines.push(`## Resources (${summary.resourceCount})`);
  lines.push(``);
  if (server.resources.length === 0) {
    lines.push(`_No resources declared._`);
  } else {
    lines.push(`| Resource | Interactions | Search Params |`);
    lines.push(`|----------|--------------|---------------|`);
    for (const res of server.resources) {
      const interactions = res.interactions.join(", ") || "—";
      lines.push(`| ${res.type} | ${interactions} | ${res.searchParams.length} |`);
    }
  }
  lines.push(``);

  // Profile conformance
  lines.push(`## Profile Conformance`);
  lines.push(``);
  if (conformance.detectedProfiles.length === 0) {
    lines.push(`_No known international profiles detected._`);
  } else {
    lines.push(`| Standard | Country | Profile URL |`);
    lines.push(`|----------|---------|-------------|`);
    for (const p of conformance.detectedProfiles) {
      lines.push(`| ${p.standard} | ${p.country} | \`${p.url}\` |`);
    }
  }
  lines.push(``);

  // Security
  lines.push(`## Security`);
  lines.push(``);
  lines.push(`- **CORS:** ${server.security.cors ? "enabled" : "disabled"}`);
  if (server.security.services.length > 0) {
    lines.push(`- **Auth:** ${server.security.services.join(", ")}`);
  } else {
    lines.push(`- **Auth:** _(none declared)_`);
  }
  lines.push(``);

  // Warnings
  if (warnings.length > 0) {
    lines.push(`## Warnings`);
    lines.push(``);
    for (const w of warnings) {
      lines.push(`- ${w}`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

/**
 * Format a ComparisonReport as a Markdown document.
 * Browser-safe — no Node imports.
 */
export function formatComparisonMarkdown(
  report: ComparisonReport,
  labelA = "A",
  labelB = "B",
): string {
  const lines: string[] = [];
  const total = report.added.length + report.removed.length + report.changed.length;

  lines.push(`# FHIR Capability Comparison: ${labelA} → ${labelB}`);
  lines.push(``);

  if (total === 0) {
    lines.push(`Servers **${labelA}** and **${labelB}** have identical capabilities.`);
    return lines.join("\n");
  }

  lines.push(`${total} difference(s) found.`);
  lines.push(``);

  if (report.added.length > 0) {
    lines.push(`## Added in ${labelB} (${report.added.length})`);
    lines.push(``);
    lines.push(`| Category | Path | Description |`);
    lines.push(`|----------|------|-------------|`);
    for (const d of report.added) {
      lines.push(`| ${d.category} | \`${d.path}\` | ${d.description} |`);
    }
    lines.push(``);
  }

  if (report.removed.length > 0) {
    lines.push(`## Removed in ${labelB} (${report.removed.length})`);
    lines.push(``);
    lines.push(`| Category | Path | Description |`);
    lines.push(`|----------|------|-------------|`);
    for (const d of report.removed) {
      lines.push(`| ${d.category} | \`${d.path}\` | ${d.description} |`);
    }
    lines.push(``);
  }

  if (report.changed.length > 0) {
    lines.push(`## Changed (${report.changed.length})`);
    lines.push(``);
    lines.push(`| Category | Path | Description |`);
    lines.push(`|----------|------|-------------|`);
    for (const d of report.changed) {
      lines.push(`| ${d.category} | \`${d.path}\` | ${d.description} |`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}
