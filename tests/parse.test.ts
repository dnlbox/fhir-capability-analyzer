import { describe, it, expect } from "vitest";
import { parseCapabilityStatement } from "../src/core/parse.js";

const MINIMAL_CS = {
  resourceType: "CapabilityStatement",
  fhirVersion: "4.0.1",
  status: "active",
  kind: "instance",
  format: ["json"],
  rest: [
    {
      mode: "server",
      resource: [],
    },
  ],
};

describe("parseCapabilityStatement", () => {
  it("parses a minimal CapabilityStatement", () => {
    const result = parseCapabilityStatement(MINIMAL_CS);
    expect(result.fhirVersion).toBe("4.0.1");
    expect(result.status).toBe("active");
    expect(result.kind).toBe("instance");
    expect(result.format).toEqual(["json"]);
    expect(result.resources).toEqual([]);
  });

  it("handles missing optional fields gracefully", () => {
    const result = parseCapabilityStatement({ resourceType: "CapabilityStatement" });
    expect(result.fhirVersion).toBe("");
    expect(result.status).toBe("unknown");
    expect(result.kind).toBe("instance");
    expect(result.resources).toEqual([]);
    expect(result.security.cors).toBe(false);
    expect(result.security.services).toEqual([]);
  });

  it("parses resources with interactions and search params", () => {
    const cs = {
      ...MINIMAL_CS,
      rest: [
        {
          mode: "server",
          resource: [
            {
              type: "Patient",
              interaction: [{ code: "read" }, { code: "search-type" }],
              searchParam: [{ name: "_id", type: "token" }],
            },
          ],
        },
      ],
    };
    const result = parseCapabilityStatement(cs);
    expect(result.resources).toHaveLength(1);
    const patient = result.resources[0];
    expect(patient?.type).toBe("Patient");
    expect(patient?.interactions).toEqual(["read", "search-type"]);
    expect(patient?.searchParams).toHaveLength(1);
    expect(patient?.searchParams[0]?.name).toBe("_id");
  });

  it("parses security with CORS and SMART service code", () => {
    const cs = {
      ...MINIMAL_CS,
      rest: [
        {
          mode: "server",
          resource: [],
          security: {
            cors: true,
            service: [
              {
                coding: [{ code: "SMART-on-FHIR" }],
              },
            ],
          },
        },
      ],
    };
    const result = parseCapabilityStatement(cs);
    expect(result.security.cors).toBe(true);
    expect(result.security.services).toContain("SMART-on-FHIR");
  });

  it("parses supported profiles and implementation guides", () => {
    const cs = {
      ...MINIMAL_CS,
      implementationGuide: ["http://hl7.org/fhir/us/core/ImplementationGuide/hl7.fhir.us.core"],
      rest: [
        {
          mode: "server",
          resource: [
            {
              type: "Patient",
              profile: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
              supportedProfile: [
                "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
              ],
              interaction: [],
              searchParam: [],
            },
          ],
        },
      ],
    };
    const result = parseCapabilityStatement(cs);
    expect(result.implementationGuide).toHaveLength(1);
    const patient = result.resources[0];
    expect(patient?.profile).toBe("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient");
    expect(patient?.supportedProfiles).toHaveLength(1);
  });

  it("picks server-mode rest block when multiple blocks exist", () => {
    const cs = {
      ...MINIMAL_CS,
      rest: [
        { mode: "client", resource: [{ type: "Patient", interaction: [] }] },
        { mode: "server", resource: [{ type: "Observation", interaction: [] }] },
      ],
    };
    const result = parseCapabilityStatement(cs);
    expect(result.resources[0]?.type).toBe("Observation");
  });

  it("parses conditional operation flags", () => {
    const cs = {
      ...MINIMAL_CS,
      rest: [
        {
          mode: "server",
          resource: [
            {
              type: "Patient",
              conditionalCreate: true,
              conditionalUpdate: false,
              conditionalDelete: "single",
              interaction: [],
            },
          ],
        },
      ],
    };
    const result = parseCapabilityStatement(cs);
    const patient = result.resources[0];
    expect(patient?.conditionalCreate).toBe(true);
    expect(patient?.conditionalUpdate).toBe(false);
    expect(patient?.conditionalDelete).toBe("single");
  });
});
