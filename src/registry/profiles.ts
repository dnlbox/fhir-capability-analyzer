import type { ProfileEntry } from "./types.js";

/**
 * Known international and national FHIR profile URL prefixes.
 * Each entry matches any URL that starts with its urlPattern.
 * Adding a new profile family = adding a new entry here.
 */
export const PROFILE_REGISTRY: readonly ProfileEntry[] = [
  // US Core (HL7 US)
  {
    urlPattern: "http://hl7.org/fhir/us/core/",
    name: "US Core",
    country: "us",
    standard: "US Core",
  },
  // UK Core (NHS England / HL7 UK)
  {
    urlPattern: "https://fhir.hl7.org.uk/",
    name: "UK Core",
    country: "uk",
    standard: "UK Core",
  },
  {
    urlPattern: "https://fhir.nhs.uk/",
    name: "UK Core (NHS)",
    country: "uk",
    standard: "UK Core",
  },
  // AU Core / AU Base (HL7 Australia)
  {
    urlPattern: "http://hl7.org.au/fhir/core/",
    name: "AU Core",
    country: "au",
    standard: "AU Core",
  },
  {
    urlPattern: "http://hl7.org.au/fhir/",
    name: "AU Base",
    country: "au",
    standard: "AU Base",
  },
  // CA Baseline (HL7 Canada)
  {
    urlPattern: "http://hl7.org/fhir/ca/baseline/",
    name: "CA Baseline",
    country: "ca",
    standard: "CA Baseline",
  },
  // IPS — International Patient Summary
  {
    urlPattern: "http://hl7.org/fhir/uv/ips/",
    name: "IPS",
    country: "international",
    standard: "IPS",
  },
  // IPA — International Patient Access
  {
    urlPattern: "http://hl7.org/fhir/uv/ipa/",
    name: "IPA",
    country: "international",
    standard: "IPA",
  },
  // SMART App Launch
  {
    urlPattern: "http://hl7.org/fhir/smart-app-launch/",
    name: "SMART App Launch",
    country: "international",
    standard: "SMART App Launch",
  },
  // ISiK (Germany, gematik)
  {
    urlPattern: "https://gematik.de/fhir/isik/",
    name: "ISiK",
    country: "de",
    standard: "ISiK",
  },
  {
    urlPattern: "https://gematik.de/fhir/ISiK/",
    name: "ISiK",
    country: "de",
    standard: "ISiK",
  },
  // FR Core (Interop'Santé / HL7 France)
  {
    urlPattern: "http://hl7.org/fhir/fr/core/",
    name: "FR Core",
    country: "fr",
    standard: "FR Core",
  },
  {
    urlPattern: "https://hl7.fr/ig/fhir/",
    name: "FR Core",
    country: "fr",
    standard: "FR Core",
  },
  // NL Nictiz (Netherlands)
  {
    urlPattern: "http://nictiz.nl/fhir/",
    name: "NL Nictiz",
    country: "nl",
    standard: "NL Nictiz",
  },
  // IHE (Integrating the Healthcare Enterprise)
  {
    urlPattern: "https://profiles.ihe.net/",
    name: "IHE",
    country: "international",
    standard: "IHE",
  },
];
