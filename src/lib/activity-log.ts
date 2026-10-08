import { getDb } from "@/db";
import { AdminUser } from "@/types";

export async function logActivity(
  admin: AdminUser | { id: string; name: string; email: string },
  action: string,
  entityType: string,
  entityId: string | undefined,
  details: string,
  ipAddress?: string
) {
  try {
    const db = await getDb();
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await db.query(
      `INSERT INTO activity_logs (id, admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());`,
      [
        id,
        admin.id,
        admin.name,
        admin.email,
        action,
        entityType,
        entityId || null,
        details,
        ipAddress || "127.0.0.1",
      ]
    );
  } catch (err) {
    console.error("Failed to insert activity log:", err);
  }
}
