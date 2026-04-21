import { describe, it, expect } from "vitest";
import { detectProfiles, PROFILE_REGISTRY } from "../src/registry/index.js";

describe("detectProfiles", () => {
  it("returns empty array for no URLs", () => {
    expect(detectProfiles([])).toEqual([]);
  });

  it("returns empty array for unrecognized URLs", () => {
    const result = detectProfiles(["https://example.com/unknown/Profile"]);
    expect(result).toEqual([]);
  });

  it("detects US Core from a profile URL", () => {
    const url = "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("US Core");
    expect(result[0]?.country).toBe("us");
    expect(result[0]?.url).toBe(url);
  });

  it("detects UK Core from an NHS URL", () => {
    const url = "https://fhir.hl7.org.uk/StructureDefinition/UKCore-Patient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("UK Core");
    expect(result[0]?.country).toBe("uk");
  });

  it("detects AU Core", () => {
    const url = "http://hl7.org.au/fhir/core/StructureDefinition/au-core-patient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("AU Core");
    expect(result[0]?.country).toBe("au");
  });

  it("does not detect the invalid historical AU Core URL", () => {
    const url = "http://hl7.org/fhir/au/core/StructureDefinition/au-core-patient";
    const result = detectProfiles([url]);
    expect(result).toEqual([]);
  });

  it("detects IPS", () => {
    const url = "http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("IPS");
    expect(result[0]?.country).toBe("international");
  });

  it("detects SMART App Launch", () => {
    const url =
      "http://hl7.org/fhir/smart-app-launch/ImplementationGuide/hl7.fhir.uv.smart-app-launch";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("SMART App Launch");
  });

  it("detects the SMART OAuth extension canonical even though it is not browsable", () => {
    const url = "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("SMART App Launch");
  });

  it("detects ISiK (gematik)", () => {
    const url = "https://gematik.de/fhir/isik/StructureDefinition/ISiKPatient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("ISiK");
    expect(result[0]?.country).toBe("de");
  });

  it("detects FR Core (HL7 France)", () => {
    const url = "http://hl7.org/fhir/fr/core/StructureDefinition/fr-core-patient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("FR Core");
    expect(result[0]?.country).toBe("fr");
  });

  it("detects NL Nictiz", () => {
    const url = "http://nictiz.nl/fhir/StructureDefinition/nl-core-Patient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("NL Nictiz");
    expect(result[0]?.country).toBe("nl");
  });

  it("detects IHE", () => {
    const url = "https://profiles.ihe.net/ITI/PDQm/StructureDefinition/IHE.PDQm.Patient";
    const result = detectProfiles([url]);
    expect(result).toHaveLength(1);
    expect(result[0]?.standard).toBe("IHE");
    expect(result[0]?.country).toBe("international");
  });

  it("deduplicates the same URL appearing twice", () => {
    const url = "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient";
    const result = detectProfiles([url, url]);
    expect(result).toHaveLength(1);
  });

  it("returns multiple distinct standards from mixed URLs", () => {
    const urls = [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
      "http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips",
      "https://gematik.de/fhir/isik/StructureDefinition/ISiKPatient",
    ];
    const result = detectProfiles(urls);
    expect(result).toHaveLength(3);
    const standards = result.map((r) => r.standard);
    expect(standards).toContain("US Core");
    expect(standards).toContain("IPS");
    expect(standards).toContain("ISiK");
  });

  it("PROFILE_REGISTRY entries all have non-empty required fields", () => {
    for (const entry of PROFILE_REGISTRY) {
      expect(entry.urlPattern.length).toBeGreaterThan(0);
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.country.length).toBeGreaterThan(0);
      expect(entry.standard.length).toBeGreaterThan(0);
    }
  });
});
