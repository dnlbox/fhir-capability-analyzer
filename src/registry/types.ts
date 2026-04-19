export interface ProfileEntry {
  /** Canonical URL pattern to match against (prefix or exact) */
  urlPattern: string;
  /** Human-readable profile name (e.g., "US Core Patient") */
  name: string;
  /** Country code (e.g., "us", "uk", "au") or "international" */
  country: string;
  /** Standard family name (e.g., "US Core", "UK Core") */
  standard: string;
}
