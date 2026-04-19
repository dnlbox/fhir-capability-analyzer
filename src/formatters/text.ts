import type { AnalysisReport, ComparisonReport } from "../core/types.js";

const INDENT = "  ";

function line(text: string = ""): string {
  return text + "\n";
}

function section(title: string): string {
  return line(title) + line("-".repeat(title.length));
}

/**
 * Format an AnalysisReport as human-readable text.
 * Browser-safe — no Node imports.
 */
export function formatAnalysisText(report: AnalysisReport): string {
  const { server, summary, conformance, warnings } = report;
  let out = "";

  // Header
  out += line(server.name ? `Server: ${server.name}` : "Server: (unnamed)");
  if (server.publisher) out += line(`Publisher: ${server.publisher}`);
  out += line(`FHIR Version: ${server.fhirVersion || "(unknown)"}`);
  out += line(`Status: ${server.status}`);
  if (server.format.length > 0) out += line(`Formats: ${server.format.join(", ")}`);
  out += line();

  // Summary
  out += section(`Resources (${summary.resourceCount})`);
  if (server.resources.length === 0) {
    out += line(`${INDENT}(none declared)`);
  } else {
    for (const res of server.resources) {
      const interactions = res.interactions.join(", ") || "(none)";
      const params = res.searchParams.length > 0 ? ` [${res.searchParams.length} search params]` : "";
      out += line(`${INDENT}${res.type.padEnd(30)} ${interactions}${params}`);
    }
  }
  out += line();

  // Operations
  if (server.operations.length > 0) {
    out += section(`Operations (${server.operations.length})`);
    for (const op of server.operations) {
      out += line(`${INDENT}${op.name}`);
    }
    out += line();
  }

  // Profile conformance
  out += section("Profile Conformance");
  if (conformance.detectedProfiles.length === 0) {
    out += line(`${INDENT}No known profiles detected`);
  } else {
    const byStandard = new Map<string, string[]>();
    for (const p of conformance.detectedProfiles) {
      const existing = byStandard.get(p.standard) ?? [];
      existing.push(p.url);
      byStandard.set(p.standard, existing);
    }
    for (const [standard, urls] of byStandard) {
      out += line(`${INDENT}${standard} (${urls.length} profile URL(s))`);
    }
  }
  out += line();

  // Security
  out += section("Security");
  out += line(`${INDENT}CORS: ${server.security.cors ? "enabled" : "disabled"}`);
  if (server.security.services.length > 0) {
    out += line(`${INDENT}Auth: ${server.security.services.join(", ")}`);
  } else {
    out += line(`${INDENT}Auth: (none declared)`);
  }
  out += line();

  // Warnings
  if (warnings.length > 0) {
    out += section(`Warnings (${warnings.length})`);
    for (const w of warnings) {
      out += line(`${INDENT}- ${w}`);
    }
    out += line();
  }

  return out.trimEnd();
}

/**
 * Format a ComparisonReport as human-readable text.
 * Browser-safe — no Node imports.
 */
export function formatComparisonText(report: ComparisonReport, labelA = "A", labelB = "B"): string {
  let out = "";
  const total = report.added.length + report.removed.length + report.changed.length;

  if (total === 0) {
    return `Servers ${labelA} and ${labelB} have identical capabilities.\n`;
  }

  out += line(`Comparison: ${labelA} → ${labelB}`);
  out += line(`${total} difference(s) found`);
  out += line();

  if (report.added.length > 0) {
    out += section(`Added in ${labelB} (${report.added.length})`);
    for (const d of report.added) {
      out += line(`${INDENT}+ [${d.category}] ${d.path}`);
      out += line(`${INDENT}  ${d.description}`);
    }
    out += line();
  }

  if (report.removed.length > 0) {
    out += section(`Removed in ${labelB} (${report.removed.length})`);
    for (const d of report.removed) {
      out += line(`${INDENT}- [${d.category}] ${d.path}`);
      out += line(`${INDENT}  ${d.description}`);
    }
    out += line();
  }

  if (report.changed.length > 0) {
    out += section(`Changed (${report.changed.length})`);
    for (const d of report.changed) {
      out += line(`${INDENT}~ [${d.category}] ${d.path}`);
      out += line(`${INDENT}  ${d.description}`);
    }
    out += line();
  }

  return out.trimEnd();
}
