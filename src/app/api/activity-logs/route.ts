import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("activity_logs.view");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const db = await getDb();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(admin_name) LIKE $${params.length} OR LOWER(action) LIKE $${params.length} OR LOWER(details) LIKE $${params.length})`;
    }

    const res = await db.query(
      `SELECT * FROM activity_logs ${whereClause} ORDER BY created_at DESC LIMIT 100;`,
      params
    );

    const logs = (res.rows || []).map((row: any) => ({
      id: row.id,
      adminId: row.admin_id,
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
