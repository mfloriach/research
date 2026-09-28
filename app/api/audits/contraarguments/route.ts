import { createAuditRoute } from "@/lib/audit-create";
import { AUDIT_KINDS } from "@/lib/audit-kinds";

const kind = AUDIT_KINDS.find((entry) => entry.slug === "contraarguments");
if (!kind) {
  throw new Error("Unknown audit kind: contraarguments");
}

export const POST = createAuditRoute(kind);
