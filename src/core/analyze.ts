import type { ServerCapability, AnalysisReport, AnalysisSummary } from "./types.js";
import { detectProfiles } from "../registry/detect.js";

const KNOWN_FHIR_VERSIONS = new Set(["4.0.1", "4.0.0", "4.3.0", "5.0.0", "3.0.2", "3.0.1"]);

/**
 * Analyze a parsed ServerCapability and produce an AnalysisReport.
 * Pure function — no side effects, no network calls, browser-safe.
 */
export function analyze(capability: ServerCapability): AnalysisReport {
  const summary = buildSummary(capability);
  const detectedProfiles = detectProfiles(collectProfileUrls(capability));
  const warnings = generateWarnings(capability);

  return {
    server: capability,
    summary,
    conformance: { detectedProfiles },
    warnings,
  };
}

function buildSummary(cap: ServerCapability): AnalysisSummary {
  const profileUrls = new Set<string>();
  let searchParamCount = 0;
  let interactionCount = 0;

  for (const resource of cap.resources) {
    if (resource.profile !== undefined) profileUrls.add(resource.profile);
    for (const p of resource.supportedProfiles) profileUrls.add(p);
    searchParamCount += resource.searchParams.length;
    interactionCount += resource.interactions.length;
  }

  for (const ig of cap.implementationGuide) profileUrls.add(ig);
  for (const inst of cap.instantiates) profileUrls.add(inst);

  return {
    resourceCount: cap.resources.length,
    operationCount: cap.operations.length,
    profileCount: profileUrls.size,
    searchParamCount,
    interactionCount,
  };
}

function collectProfileUrls(cap: ServerCapability): string[] {
  const urls: string[] = [...cap.instantiates, ...cap.implementationGuide];
  for (const resource of cap.resources) {
    if (resource.profile !== undefined) urls.push(resource.profile);
    urls.push(...resource.supportedProfiles);
  }
  return urls;
}

function generateWarnings(cap: ServerCapability): string[] {
  const warnings: string[] = [];

  if (cap.resources.length === 0) {
    warnings.push("Server declares no resources in its REST capabilities");
  }

  if (!cap.fhirVersion || !KNOWN_FHIR_VERSIONS.has(cap.fhirVersion)) {
    const version = cap.fhirVersion || "(empty)";
    warnings.push(`FHIR version "${version}" is missing or unrecognized`);
  }

  if (cap.status === "draft") {
    warnings.push("CapabilityStatement status is 'draft' — may not reflect production capabilities");
  }

  const hasNoCors = !cap.security.cors;
  const hasNoServices = cap.security.services.length === 0;
  if (hasNoCors && hasNoServices) {
    warnings.push("No security configuration declared — CORS disabled and no authentication services");
  }

  for (const resource of cap.resources) {
    const hasSearchType = resource.interactions.includes("search-type");
    const hasSearchParams = resource.searchParams.length > 0;

    if (hasSearchType && !hasSearchParams) {
      warnings.push(
        `${resource.type}: declares search-type interaction but has no search parameters`,
      );
    }

    if (hasSearchParams && !hasSearchType) {
      warnings.push(
        `${resource.type}: has ${resource.searchParams.length} search parameter(s) but does not declare search-type interaction`,
      );
    }
  }

  return warnings;
}
