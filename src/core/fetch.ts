import type { FetchOptions, FetchResult } from "./types.js";
import { parseCapabilityStatement } from "./parse.js";

const METADATA_PATH = "/metadata";
const FHIR_JSON_MIME = "application/fhir+json";

function normalizeUrl(input: string): string {
  const trimmed = input.trim().replace(/\/$/, "");
  if (trimmed.endsWith(METADATA_PATH)) return trimmed;
  return `${trimmed}${METADATA_PATH}`;
}

/**
 * Fetch a CapabilityStatement from a FHIR server URL.
 * Appends /metadata if not already present.
 * Browser-safe — uses the standard fetch() API.
 */
export async function fetchCapabilityStatement(
  url: string,
  options?: FetchOptions,
): Promise<FetchResult> {
  const endpoint = normalizeUrl(url);
  const headers: Record<string, string> = { Accept: FHIR_JSON_MIME, ...options?.headers };
  let response: Response;
  try {
    response = await fetch(endpoint, { headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Network error fetching ${endpoint}: ${message}` };
  }

  if (!response.ok) {
    return {
      success: false,
      error: `HTTP ${response.status} from ${endpoint}`,
    };
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    return { success: false, error: `Invalid JSON response from ${endpoint}` };
  }

  if (!isCapabilityStatement(raw)) {
    const rt =
      raw !== null && typeof raw === "object"
        ? String((raw as Record<string, unknown>)["resourceType"] ?? "unknown")
        : "non-object";
    return {
      success: false,
      error: `Expected CapabilityStatement, got resourceType "${rt}" from ${endpoint}`,
    };
  }

  return {
    success: true,
    capability: parseCapabilityStatement(raw),
    raw,
  };
}

/**
 * Parse a CapabilityStatement from an already-loaded JSON value.
 * Use this when reading from a local file.
 */
export function parseFromJson(raw: unknown): FetchResult {
  if (!isCapabilityStatement(raw)) {
    const rt =
      raw !== null && typeof raw === "object"
        ? String((raw as Record<string, unknown>)["resourceType"] ?? "unknown")
        : "non-object";
    return { success: false, error: `Expected CapabilityStatement, got resourceType "${rt}"` };
  }
  return {
    success: true,
    capability: parseCapabilityStatement(raw),
    raw,
  };
}

function isCapabilityStatement(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  return (v as Record<string, unknown>)["resourceType"] === "CapabilityStatement";
}
