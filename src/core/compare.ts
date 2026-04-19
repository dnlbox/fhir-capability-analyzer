import type {
  ServerCapability,
  ComparisonReport,
  ComparisonDifference,
  ComparisonCategory,
} from "./types.js";

function diff(
  category: ComparisonCategory,
  path: string,
  description: string,
  left?: unknown,
  right?: unknown,
): ComparisonDifference {
  const d: ComparisonDifference = { category, path, description };
  if (left !== undefined) d.left = left;
  if (right !== undefined) d.right = right;
  return d;
}

/**
 * Compare two parsed ServerCapabilities and produce a ComparisonReport.
 * A = left/baseline, B = right/target.
 * Pure function — no side effects, browser-safe.
 */
export function compare(a: ServerCapability, b: ServerCapability): ComparisonReport {
  const added: ComparisonDifference[] = [];
  const removed: ComparisonDifference[] = [];
  const changed: ComparisonDifference[] = [];

  // FHIR version
  if (a.fhirVersion !== b.fhirVersion) {
    changed.push(
      diff("fhir-version", "fhirVersion", `FHIR version changed`, a.fhirVersion, b.fhirVersion),
    );
  }

  // Formats
  compareSets(a.format, b.format, "format", "format", added, removed);

  // Security
  if (a.security.cors !== b.security.cors) {
    changed.push(
      diff("security", "security.cors", `CORS changed`, a.security.cors, b.security.cors),
    );
  }
  compareSets(a.security.services, b.security.services, "security", "security.services", added, removed);

  // Resources
  const aResources = new Map(a.resources.map((r) => [r.type, r]));
  const bResources = new Map(b.resources.map((r) => [r.type, r]));

  for (const [type, bRes] of bResources) {
    if (!aResources.has(type)) {
      added.push(diff("resource", `resources.${type}`, `Resource ${type} added in B`));
      continue;
    }
    const aRes = aResources.get(type)!;

    // Interactions
    compareSets(
      aRes.interactions,
      bRes.interactions,
      "interaction",
      `resources.${type}.interactions`,
      added,
      removed,
    );

    // Search params
    const aParams = new Set(aRes.searchParams.map((p) => p.name));
    const bParams = new Set(bRes.searchParams.map((p) => p.name));
    compareSets(
      [...aParams],
      [...bParams],
      "search-param",
      `resources.${type}.searchParams`,
      added,
      removed,
    );

    // Operations
    const aOps = new Set(aRes.operations.map((o) => o.name));
    const bOps = new Set(bRes.operations.map((o) => o.name));
    compareSets(
      [...aOps],
      [...bOps],
      "operation",
      `resources.${type}.operations`,
      added,
      removed,
    );

    // Profiles
    const aProfiles = new Set([
      ...(aRes.profile ? [aRes.profile] : []),
      ...aRes.supportedProfiles,
    ]);
    const bProfiles = new Set([
      ...(bRes.profile ? [bRes.profile] : []),
      ...bRes.supportedProfiles,
    ]);
    compareSets(
      [...aProfiles],
      [...bProfiles],
      "profile",
      `resources.${type}.profiles`,
      added,
      removed,
    );
  }

  for (const [type] of aResources) {
    if (!bResources.has(type)) {
      removed.push(diff("resource", `resources.${type}`, `Resource ${type} removed in B`));
    }
  }

  // System-level operations
  const aOps = new Set(a.operations.map((o) => o.name));
  const bOps = new Set(b.operations.map((o) => o.name));
  compareSets([...aOps], [...bOps], "operation", "operations", added, removed);

  return { added, removed, changed };
}

function compareSets(
  aItems: string[],
  bItems: string[],
  category: ComparisonCategory,
  path: string,
  added: ComparisonDifference[],
  removed: ComparisonDifference[],
): void {
  const aSet = new Set(aItems);
  const bSet = new Set(bItems);

  for (const item of bSet) {
    if (!aSet.has(item)) {
      added.push(diff(category, `${path}.${item}`, `${item} added`));
    }
  }
  for (const item of aSet) {
    if (!bSet.has(item)) {
      removed.push(diff(category, `${path}.${item}`, `${item} removed`));
    }
  }
}
