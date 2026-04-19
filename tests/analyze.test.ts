import { describe, it, expect } from "vitest";
import { analyze } from "../src/core/analyze.js";
import type { ServerCapability } from "../src/core/types.js";

function makeCapability(overrides: Partial<ServerCapability> = {}): ServerCapability {
  return {
    fhirVersion: "4.0.1",
    status: "active",
    kind: "instance",
    format: ["json"],
    patchFormat: [],
    implementationGuide: [],
    instantiates: [],
    imports: [],
    resources: [],
    operations: [],
    searchParams: [],
    interactions: [],
    security: { cors: true, services: ["SMART-on-FHIR"] },
    messaging: [],
    documents: [],
    ...overrides,
  };
}

function makeResource(
  type: string,
  interactions: string[] = [],
  searchParamCount = 0,
): ServerCapability["resources"][number] {
  return {
    type,
    supportedProfiles: [],
    interactions,
    searchParams: Array.from({ length: searchParamCount }, (_, i) => ({
      name: `param${i}`,
      type: "token",
    })),
    operations: [],
    conditionalCreate: false,
    conditionalUpdate: false,
    searchInclude: [],
    searchRevInclude: [],
    referencePolicy: [],
  };
}

describe("analyze", () => {
  it("produces a valid report for a minimal capability", () => {
    const cap = makeCapability({ resources: [makeResource("Patient", ["read"])] });
    const report = analyze(cap);
    expect(report.server).toBe(cap);
    expect(report.summary.resourceCount).toBe(1);
    expect(report.conformance.detectedProfiles).toEqual([]);
  });

  it("counts resources, operations, search params, and interactions correctly", () => {
    const cap = makeCapability({
      resources: [
        makeResource("Patient", ["read", "search-type"], 3),
        makeResource("Observation", ["read"], 0),
      ],
      operations: [{ name: "$everything" }, { name: "$validate" }],
    });
    const report = analyze(cap);
    expect(report.summary.resourceCount).toBe(2);
    expect(report.summary.operationCount).toBe(2);
    expect(report.summary.searchParamCount).toBe(3);
    expect(report.summary.interactionCount).toBe(3);
  });

  it("counts distinct profiles across resources and IGs", () => {
    const profileUrl = "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient";
    const igUrl = "http://hl7.org/fhir/us/core/ImplementationGuide/hl7.fhir.us.core";
    const cap = makeCapability({
      implementationGuide: [igUrl],
      resources: [
        {
          ...makeResource("Patient", ["read"]),
          profile: profileUrl,
          supportedProfiles: [profileUrl],
        },
      ],
    });
    const report = analyze(cap);
    // profileUrl + igUrl = 2 distinct URLs (profileUrl appears twice but counted once)
    expect(report.summary.profileCount).toBe(2);
  });

  it("detects US Core profile conformance end-to-end", () => {
    const cap = makeCapability({
      instantiates: ["http://hl7.org/fhir/us/core/CapabilityStatement/us-core-server"],
      resources: [
        {
          ...makeResource("Patient", ["read", "search-type"], 2),
          supportedProfiles: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
          ],
        },
      ],
    });
    const report = analyze(cap);
    const standards = report.conformance.detectedProfiles.map((p) => p.standard);
    expect(standards).toContain("US Core");
  });

  it("generates no warnings for a well-configured server", () => {
    const cap = makeCapability({
      resources: [makeResource("Patient", ["read", "search-type"], 3)],
    });
    const report = analyze(cap);
    expect(report.warnings).toEqual([]);
  });

  it("warns when server declares no resources", () => {
    const report = analyze(makeCapability({ resources: [] }));
    expect(report.warnings.some((w) => w.includes("no resources"))).toBe(true);
  });

  it("warns for draft status", () => {
    const report = analyze(makeCapability({ status: "draft" }));
    expect(report.warnings.some((w) => w.includes("draft"))).toBe(true);
  });

  it("warns when no security configuration is declared", () => {
    const cap = makeCapability({
      resources: [makeResource("Patient", ["read", "search-type"], 1)],
      security: { cors: false, services: [] },
    });
    const report = analyze(cap);
    expect(report.warnings.some((w) => w.includes("No security"))).toBe(true);
  });

  it("warns when resource has search-type but no search params", () => {
    const cap = makeCapability({
      resources: [makeResource("Patient", ["read", "search-type"], 0)],
    });
    const report = analyze(cap);
    expect(
      report.warnings.some((w) => w.includes("Patient") && w.includes("no search parameters")),
    ).toBe(true);
  });

  it("warns when resource has search params but no search-type interaction", () => {
    const cap = makeCapability({
      resources: [makeResource("Patient", ["read"], 5)],
    });
    const report = analyze(cap);
    expect(
      report.warnings.some(
        (w) => w.includes("Patient") && w.includes("does not declare search-type"),
      ),
    ).toBe(true);
  });

  it("warns for unrecognized FHIR version", () => {
    const cap = makeCapability({ fhirVersion: "3.5.0" });
    const report = analyze(cap);
    expect(report.warnings.some((w) => w.includes("unrecognized"))).toBe(true);
  });

  it("does not warn for known FHIR versions", () => {
    for (const version of ["4.0.1", "4.3.0", "5.0.0"]) {
      const cap = makeCapability({
        fhirVersion: version,
        resources: [makeResource("Patient", ["read", "search-type"], 1)],
      });
      const report = analyze(cap);
      expect(report.warnings.some((w) => w.includes("unrecognized"))).toBe(false);
    }
  });
});
