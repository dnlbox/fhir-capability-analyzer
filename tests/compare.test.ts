import { describe, it, expect } from "vitest";
import { compare } from "../src/core/compare.js";
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
    security: { cors: true, services: [] },
    messaging: [],
    documents: [],
    ...overrides,
  };
}

function makeResource(
  type: string,
  interactions: string[] = [],
  searchParamNames: string[] = [],
  profiles: string[] = [],
): ServerCapability["resources"][number] {
  return {
    type,
    supportedProfiles: profiles,
    interactions,
    searchParams: searchParamNames.map((name) => ({ name, type: "token" })),
    operations: [],
    conditionalCreate: false,
    conditionalUpdate: false,
    searchInclude: [],
    searchRevInclude: [],
    referencePolicy: [],
  };
}

describe("compare", () => {
  it("reports no differences for identical capabilities", () => {
    const cap = makeCapability({ resources: [makeResource("Patient", ["read"])] });
    const result = compare(cap, cap);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
  });

  it("detects added resource", () => {
    const a = makeCapability({ resources: [makeResource("Patient", ["read"])] });
    const b = makeCapability({
      resources: [makeResource("Patient", ["read"]), makeResource("Observation", ["read"])],
    });
    const result = compare(a, b);
    expect(result.added.some((d) => d.path.includes("Observation"))).toBe(true);
  });

  it("detects removed resource", () => {
    const a = makeCapability({
      resources: [makeResource("Patient", ["read"]), makeResource("Observation", ["read"])],
    });
    const b = makeCapability({ resources: [makeResource("Patient", ["read"])] });
    const result = compare(a, b);
    expect(result.removed.some((d) => d.path.includes("Observation"))).toBe(true);
  });

  it("detects added interaction on existing resource", () => {
    const a = makeCapability({ resources: [makeResource("Patient", ["read"])] });
    const b = makeCapability({ resources: [makeResource("Patient", ["read", "create"])] });
    const result = compare(a, b);
    expect(result.added.some((d) => d.path.includes("create"))).toBe(true);
  });

  it("detects removed search parameter", () => {
    const a = makeCapability({ resources: [makeResource("Patient", ["read", "search-type"], ["_id", "name"])] });
    const b = makeCapability({ resources: [makeResource("Patient", ["read", "search-type"], ["_id"])] });
    const result = compare(a, b);
    expect(result.removed.some((d) => d.path.includes("name"))).toBe(true);
  });

  it("detects FHIR version change", () => {
    const a = makeCapability({ fhirVersion: "4.0.1" });
    const b = makeCapability({ fhirVersion: "5.0.0" });
    const result = compare(a, b);
    expect(result.changed.some((d) => d.category === "fhir-version")).toBe(true);
  });

  it("detects CORS change", () => {
    const a = makeCapability({ security: { cors: true, services: [] } });
    const b = makeCapability({ security: { cors: false, services: [] } });
    const result = compare(a, b);
    expect(result.changed.some((d) => d.path.includes("cors"))).toBe(true);
  });

  it("detects added format", () => {
    const a = makeCapability({ format: ["json"] });
    const b = makeCapability({ format: ["json", "xml"] });
    const result = compare(a, b);
    expect(result.added.some((d) => d.category === "format" && d.path.includes("xml"))).toBe(true);
  });

  it("detects added profile on resource", () => {
    const profileUrl = "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient";
    const a = makeCapability({ resources: [makeResource("Patient", ["read"])] });
    const b = makeCapability({ resources: [makeResource("Patient", ["read"], [], [profileUrl])] });
    const result = compare(a, b);
    expect(result.added.some((d) => d.category === "profile")).toBe(true);
  });
});
