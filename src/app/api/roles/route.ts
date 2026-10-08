import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("roles.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM roles ORDER BY created_at ASC;");

    const roles = (res.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isSystem: row.is_system,
      permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, data: roles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("roles.manage");
  if (error) return error;

  try {
    const { roleId, permissions } = await req.json();
    const db = await getDb();

    await db.query(
      `UPDATE roles SET permissions = $1, updated_at = NOW() WHERE id = $2;`,
      [JSON.stringify(permissions), roleId]
    );

    await logActivity(user, "Role Permissions Modified", "Role", roleId, `Updated permissions matrix for role ${roleId}`);

    return NextResponse.json({ success: true, message: "Role permissions updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
