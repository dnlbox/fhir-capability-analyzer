import type {
  ServerCapability,
  ResourceCapability,
  SearchParamCapability,
  OperationCapability,
  SecurityCapability,
  MessagingCapability,
  DocumentCapability,
} from "./types.js";

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asBoolean(v: unknown): boolean {
  return v === true;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is string => typeof item === "string");
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function optStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function parseSearchParams(raw: unknown): SearchParamCapability[] {
  return asArray(raw).map((item) => {
    const i = item as Record<string, unknown>;
    const sp: SearchParamCapability = {
      name: asString(i["name"]),
      type: asString(i["type"]),
    };
    const def = optStr(i["definition"]);
    const doc = optStr(i["documentation"]);
    if (def !== undefined) sp.definition = def;
    if (doc !== undefined) sp.documentation = doc;
    return sp;
  });
}

function parseOperations(raw: unknown): OperationCapability[] {
  return asArray(raw).map((item) => {
    const i = item as Record<string, unknown>;
    const op: OperationCapability = { name: asString(i["name"]) };
    const def = optStr(i["definition"]);
    const doc = optStr(i["documentation"]);
    if (def !== undefined) op.definition = def;
    if (doc !== undefined) op.documentation = doc;
    return op;
  });
}

function parseSecurity(raw: unknown): SecurityCapability {
  if (!raw || typeof raw !== "object") {
    return { cors: false, services: [] };
  }
  const s = raw as Record<string, unknown>;
  const services: string[] = asArray(s["service"]).flatMap((svc) => {
    const sv = svc as Record<string, unknown>;
    return asArray(sv["coding"]).map((c) => {
      const cd = c as Record<string, unknown>;
      return asString(cd["code"]);
    });
  });
  const sec: SecurityCapability = {
    cors: asBoolean(s["cors"]),
    services: services.filter((sv) => sv.length > 0),
  };
  const desc = optStr(s["description"]);
  if (desc !== undefined) sec.description = desc;
  return sec;
}

function parseResource(raw: unknown): ResourceCapability {
  const r = (raw ?? {}) as Record<string, unknown>;
  const interactions: string[] = asArray(r["interaction"]).map((i) =>
    asString((i as Record<string, unknown>)["code"]),
  );
  const res: ResourceCapability = {
    type: asString(r["type"]),
    supportedProfiles: asStringArray(r["supportedProfile"]),
    interactions,
    searchParams: parseSearchParams(r["searchParam"]),
    operations: parseOperations(r["operation"]),
    conditionalCreate: asBoolean(r["conditionalCreate"]),
    conditionalUpdate: asBoolean(r["conditionalUpdate"]),
    searchInclude: asStringArray(r["searchInclude"]),
    searchRevInclude: asStringArray(r["searchRevInclude"]),
    referencePolicy: asStringArray(r["referencePolicy"]),
  };
  const profile = optStr(r["profile"]);
  const versioning = optStr(r["versioning"]);
  const condDelete = optStr(r["conditionalDelete"]);
  const condRead = optStr(r["conditionalRead"]);
  if (profile !== undefined) res.profile = profile;
  if (versioning !== undefined) res.versioning = versioning;
  if (condDelete !== undefined) res.conditionalDelete = condDelete;
  if (condRead !== undefined) res.conditionalRead = condRead;
  return res;
}

function parseMessaging(raw: unknown): MessagingCapability[] {
  return asArray(raw).map((item) => {
    const m = item as Record<string, unknown>;
    const firstEndpoint = asArray(m["endpoint"])[0];
    const endpointAddress =
      firstEndpoint !== undefined
        ? optStr((firstEndpoint as Record<string, unknown>)["address"])
        : undefined;
    const supportedMessages = asArray(m["supportedMessage"]).map((sm) => {
      const s = sm as Record<string, unknown>;
      return { mode: asString(s["mode"]), definition: asString(s["definition"]) };
    });
    const msg: MessagingCapability = { supportedMessages };
    if (endpointAddress !== undefined) msg.endpoint = endpointAddress;
    if (typeof m["reliableCache"] === "number") msg.reliableCache = m["reliableCache"] as number;
    const doc = optStr(m["documentation"]);
    if (doc !== undefined) msg.documentation = doc;
    return msg;
  });
}

function parseDocuments(raw: unknown): DocumentCapability[] {
  return asArray(raw).map((item) => {
    const d = item as Record<string, unknown>;
    const doc: DocumentCapability = {
      mode: asString(d["mode"]),
      profile: asString(d["profile"]),
    };
    const documentation = optStr(d["documentation"]);
    if (documentation !== undefined) doc.documentation = documentation;
    return doc;
  });
}

/**
 * Parse a raw CapabilityStatement JSON object into an ergonomic ServerCapability.
 * Defensive by design — every field access handles undefined/null gracefully.
 */
export function parseCapabilityStatement(raw: unknown): ServerCapability {
  const cs = (raw ?? {}) as Record<string, unknown>;

  // REST capabilities live under rest[0] for server-mode statements
  const rest = asArray(cs["rest"]);
  const serverRest =
    rest.find((r) => {
      const mode = asString((r as Record<string, unknown>)["mode"]);
      return mode === "server" || mode === "";
    }) ?? rest[0];
  const restObj = (serverRest ?? {}) as Record<string, unknown>;

  const sysInteractions: string[] = asArray(restObj["interaction"]).map((i) =>
    asString((i as Record<string, unknown>)["code"]),
  );

  const server: ServerCapability = {
    fhirVersion: asString(cs["fhirVersion"]),
    status: asString(cs["status"]) || "unknown",
    kind: asString(cs["kind"]) || "instance",
    format: asStringArray(cs["format"]),
    patchFormat: asStringArray(cs["patchFormat"]),
    implementationGuide: asStringArray(cs["implementationGuide"]),
    instantiates: asStringArray(cs["instantiates"]),
    imports: asStringArray(cs["imports"]),
    resources: asArray(restObj["resource"]).map(parseResource),
    operations: parseOperations(restObj["operation"]),
    searchParams: parseSearchParams(restObj["searchParam"]),
    interactions: sysInteractions,
    security: parseSecurity(restObj["security"]),
    messaging: parseMessaging(cs["messaging"]),
    documents: parseDocuments(cs["document"]),
  };

  const name = optStr(cs["name"]);
  const desc = optStr(cs["description"]);
  const publisher = optStr(cs["publisher"]);
  if (name !== undefined) server.name = name;
  if (desc !== undefined) server.description = desc;
  if (publisher !== undefined) server.publisher = publisher;

  return server;
}
