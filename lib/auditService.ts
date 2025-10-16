// lib/auditService.ts
import clientPromise from "./mongodb";

/**
 * Audit log entry shape
 * - action: short machine-friendly action name
 * - by: admin user id (string) who performed the action
 * - targetId: id of the affected resource (string) - e.g. userId or authorId
 * - targetType: resource type, e.g. "user", "author", "post"
 * - meta: optional object with extra info
 * - createdAt: timestamp
 */
export type AuditEntry = {
  action: string;
  by: string | null;
  targetId?: string | null;
  targetType?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt?: Date;
};

export async function logAudit(entry: AuditEntry) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const insert = {
      action: entry.action,
      by: entry.by ?? null,
      targetId: entry.targetId ?? null,
      targetType: entry.targetType ?? null,
      meta: entry.meta ?? null,
      createdAt: entry.createdAt ?? new Date(),
    };

    await db.collection("audit_logs").insertOne(insert);
  } catch (err) {
    // Do not fail the main request if logging fails. Just print.
    console.error("[Audit] failed to write audit log:", err);
  }
}
