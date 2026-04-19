export interface ServerCapability {
  /** Raw FHIR version string (e.g., "4.0.1") */
  fhirVersion: string;
  name?: string;
  description?: string;
  publisher?: string;
  status: string;
  /** instance | capability | requirements */
  kind: string;
  format: string[];
  patchFormat: string[];
  implementationGuide: string[];
  /** CapabilityStatements this server conforms to */
  instantiates: string[];
  imports: string[];
  resources: ResourceCapability[];
  /** System-level operations */
  operations: OperationCapability[];
  /** System-level search parameters */
  searchParams: SearchParamCapability[];
  /** System-level interactions (transaction, batch, etc.) */
  interactions: string[];
  security: SecurityCapability;
  messaging: MessagingCapability[];
  documents: DocumentCapability[];
}

export interface ResourceCapability {
  type: string;
  profile?: string;
  supportedProfiles: string[];
  interactions: string[];
  searchParams: SearchParamCapability[];
  operations: OperationCapability[];
  versioning?: string;
  conditionalCreate: boolean;
  conditionalUpdate: boolean;
  conditionalDelete?: string;
  conditionalRead?: string;
  searchInclude: string[];
  searchRevInclude: string[];
  referencePolicy: string[];
}

export interface SearchParamCapability {
  name: string;
  type: string;
  definition?: string;
  documentation?: string;
}

export interface OperationCapability {
  name: string;
  definition?: string;
  documentation?: string;
}

export interface SecurityCapability {
  cors: boolean;
  services: string[];
  description?: string;
}

export interface MessagingCapability {
  endpoint?: string;
  reliableCache?: number;
  documentation?: string;
  supportedMessages: Array<{
    mode: string;
    definition: string;
  }>;
}

export interface DocumentCapability {
  mode: string;
  documentation?: string;
  profile: string;
}

export interface AnalysisReport {
  server: ServerCapability;
  summary: AnalysisSummary;
  conformance: {
    detectedProfiles: ProfileConformance[];
  };
  warnings: string[];
}

export interface AnalysisSummary {
  resourceCount: number;
  operationCount: number;
  /** Total distinct profile URLs across all resources */
  profileCount: number;
  /** Total search parameters across all resources */
  searchParamCount: number;
  /** Total interactions across all resources */
  interactionCount: number;
}

export interface ComparisonReport {
  added: ComparisonDifference[];
  removed: ComparisonDifference[];
  changed: ComparisonDifference[];
}

export type ComparisonCategory =
  | "resource"
  | "interaction"
  | "search-param"
  | "operation"
  | "profile"
  | "security"
  | "format"
  | "fhir-version";

export interface ComparisonDifference {
  category: ComparisonCategory;
  /** Dot-notation path describing where the difference is */
  path: string;
  description: string;
  left?: unknown;
  right?: unknown;
}

export type FetchResult =
  | { success: true; capability: ServerCapability; raw: unknown }
  | { success: false; error: string };

export interface FetchOptions {
  /** Extra HTTP headers merged with the default Accept header. */
  headers?: Record<string, string>;
}

/** Detected profile conformance for a specific URL. */
export interface ProfileConformance {
  url: string;
  name: string;
  /** Country code (e.g., "us", "uk") or "international" */
  country: string;
  standard: string;
  version?: string;
}
