import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCapabilityStatement } from "../src/core/fetch.js";

const MINIMAL_CS = {
  resourceType: "CapabilityStatement",
  fhirVersion: "4.0.1",
  status: "active",
  kind: "instance",
  format: ["json"],
};

function mockFetch(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCapabilityStatement", () => {
  it("sends default Accept header", async () => {
    mockFetch(MINIMAL_CS);
    await fetchCapabilityStatement("https://example.com/fhir");
    const call = vi.mocked(fetch).mock.calls[0];
    expect(call?.[1]?.headers).toMatchObject({ Accept: "application/fhir+json" });
  });

  it("appends /metadata when not present", async () => {
    mockFetch(MINIMAL_CS);
    await fetchCapabilityStatement("https://example.com/fhir");
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe("https://example.com/fhir/metadata");
  });

  it("does not double-append /metadata", async () => {
    mockFetch(MINIMAL_CS);
    await fetchCapabilityStatement("https://example.com/fhir/metadata");
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe("https://example.com/fhir/metadata");
  });

  it("merges bearer token header when provided", async () => {
    mockFetch(MINIMAL_CS);
    await fetchCapabilityStatement("https://example.com/fhir", {
      headers: { Authorization: "Bearer test-token" },
    });
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-token");
    expect(headers["Accept"]).toBe("application/fhir+json");
  });

  it("returns success with parsed capability", async () => {
    mockFetch(MINIMAL_CS);
    const result = await fetchCapabilityStatement("https://example.com/fhir");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.capability.fhirVersion).toBe("4.0.1");
    }
  });

  it("returns error on non-2xx response", async () => {
    mockFetch({}, 401);
    const result = await fetchCapabilityStatement("https://example.com/fhir");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("401");
    }
  });

  it("returns error for wrong resourceType", async () => {
    mockFetch({ resourceType: "Patient" });
    const result = await fetchCapabilityStatement("https://example.com/fhir");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Patient");
    }
  });
});
