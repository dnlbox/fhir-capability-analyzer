import type { ProfileConformance } from "../core/types.js";
import { PROFILE_REGISTRY } from "./profiles.js";

const VERSION_PATTERN = /\/(?:v|StructureDefinition\/)?(\d+[\d.]*)\//;

function extractVersion(url: string): string | undefined {
  const match = VERSION_PATTERN.exec(url);
  return match?.[1];
}

/**
 * Detect known profile conformance from a list of profile URLs.
 * Pure function — no side effects, browser-safe.
 * Deduplicates by standard family: each standard appears at most once per URL set.
 */
export function detectProfiles(urls: string[]): ProfileConformance[] {
  const seen = new Set<string>();
  const results: ProfileConformance[] = [];

  for (const url of urls) {
    const entry = PROFILE_REGISTRY.find((e) => url.startsWith(e.urlPattern));
    if (!entry) continue;

    // Deduplicate by (standard, url) — same URL appearing twice gives one result
    const key = `${entry.standard}::${url}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const version = extractVersion(url);
    results.push({
      url,
      name: entry.name,
      country: entry.country,
      standard: entry.standard,
      ...(version !== undefined && { version }),
    });
  }

  return results;
}
