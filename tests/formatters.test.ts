import { describe, it, expect } from "vitest";
import { formatAnalysisText, formatComparisonText } from "../src/formatters/text.js";
import { formatAnalysisJson, formatComparisonJson } from "../src/formatters/json.js";
import { formatAnalysisMarkdown, formatComparisonMarkdown } from "../src/formatters/markdown.js";
import type { AnalysisReport, ComparisonReport, ServerCapability } from "../src/core/types.js";

function makeReport(overrides: Partial<ServerCapability> = {}): AnalysisReport {
  const server: ServerCapability = {
    fhirVersion: "4.0.1",
    name: "Test FHIR Server",
    status: "active",
    kind: "instance",
    format: ["json", "xml"],
    patchFormat: [],
    implementationGuide: [],
    instantiates: [],
    imports: [],
    resources: [
      {
        type: "Patient",
        supportedProfiles: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
        interactions: ["read", "search-type"],
        searchParams: [{ name: "_id", type: "token" }],
        operations: [],
        conditionalCreate: false,
        conditionalUpdate: false,
        searchInclude: [],
        searchRevInclude: [],
        referencePolicy: [],
      },
    ],
    operations: [{ name: "$everything" }],
    searchParams: [],
    interactions: [],
    security: { cors: true, services: ["SMART-on-FHIR"] },
    messaging: [],
    documents: [],
    ...overrides,
  };
  return {
    server,
    summary: {
      resourceCount: 1,
      operationCount: 1,
      profileCount: 1,
      searchParamCount: 1,
      interactionCount: 2,
    },
    conformance: {
      detectedProfiles: [
        {
          url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
          name: "US Core",
          country: "us",
          standard: "US Core",
        },
      ],
    },
    warnings: [],
  };
}

function makeComparisonReport(): ComparisonReport {
  return {
    added: [{ category: "resource", path: "resources.Observation", description: "Observation added" }],
    removed: [],
    changed: [{ category: "fhir-version", path: "fhirVersion", description: "FHIR version changed", left: "4.0.1", right: "5.0.0" }],
  };
}

describe("formatAnalysisText", () => {
  it("includes server name and FHIR version", () => {
    const out = formatAnalysisText(makeReport());
    expect(out).toContain("Test FHIR Server");
    expect(out).toContain("4.0.1");
  });

  it("includes resource list with interactions", () => {
    const out = formatAnalysisText(makeReport());
    expect(out).toContain("Patient");
    expect(out).toContain("read");
    expect(out).toContain("search-type");
  });

  it("includes profile conformance section", () => {
    const out = formatAnalysisText(makeReport());
    expect(out).toContain("US Core");
  });

  it("includes security section", () => {
    const out = formatAnalysisText(makeReport());
    expect(out).toContain("CORS: enabled");
    expect(out).toContain("SMART-on-FHIR");
  });

  it("includes warnings when present", () => {
    const report = makeReport();
    report.warnings = ["Patient: declares search-type but has no search parameters"];
    const out = formatAnalysisText(report);
    expect(out).toContain("Warnings");
    expect(out).toContain("Patient");
  });
});

describe("formatComparisonText", () => {
  it("reports identical servers when no differences", () => {
    const out = formatComparisonText({ added: [], removed: [], changed: [] }, "A", "B");
    expect(out).toContain("identical");
  });

  it("includes added and changed sections", () => {
    const out = formatComparisonText(makeComparisonReport(), "Server A", "Server B");
    expect(out).toContain("Added");
    expect(out).toContain("Changed");
    expect(out).toContain("Observation");
  });
});

describe("formatAnalysisJson", () => {
  it("produces valid JSON matching the AnalysisReport structure", () => {
    const out = formatAnalysisJson(makeReport());
    const parsed = JSON.parse(out) as AnalysisReport;
    expect(parsed.server.fhirVersion).toBe("4.0.1");
    expect(parsed.summary.resourceCount).toBe(1);
    expect(parsed.conformance.detectedProfiles).toHaveLength(1);
  });
});

describe("formatComparisonJson", () => {
  it("produces valid JSON matching the ComparisonReport structure", () => {
    const out = formatComparisonJson(makeComparisonReport());
    const parsed = JSON.parse(out) as ComparisonReport;
    expect(parsed.added).toHaveLength(1);
    expect(parsed.changed).toHaveLength(1);
  });
});

describe("formatAnalysisMarkdown", () => {
  it("includes markdown headings", () => {
    const out = formatAnalysisMarkdown(makeReport());
    expect(out).toContain("# FHIR Capability Analysis");
    expect(out).toContain("## Resources");
    expect(out).toContain("## Profile Conformance");
    expect(out).toContain("## Security");
  });

  it("includes resource table row for Patient", () => {
    const out = formatAnalysisMarkdown(makeReport());
    expect(out).toContain("| Patient |");
  });

  it("includes profile table row for US Core", () => {
    const out = formatAnalysisMarkdown(makeReport());
    expect(out).toContain("US Core");
  });
});

describe("formatComparisonMarkdown", () => {
  it("reports identical for empty diff", () => {
    const out = formatComparisonMarkdown({ added: [], removed: [], changed: [] });
    expect(out).toContain("identical");
  });

  it("includes added section when differences exist", () => {
    const out = formatComparisonMarkdown(makeComparisonReport(), "A", "B");
    expect(out).toContain("## Added in B");
    expect(out).toContain("Observation");
  });
});
