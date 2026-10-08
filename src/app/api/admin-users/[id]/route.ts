import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("admin_users.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    // Get role name if roleId updated
    let roleName = body.roleName;
    if (body.roleId) {
      const roleRes = await db.query("SELECT name FROM roles WHERE id = $1;", [body.roleId]);
      if (roleRes.rows?.[0]) roleName = roleRes.rows[0].name;
    }

    if (body.password && body.password.trim().length > 0) {
      const pwdHash = hashPassword(body.password);
      await db.query(
        `UPDATE admin_users SET name = $1, email = $2, role_id = $3, role_name = $4, status = $5, password_hash = $6, updated_at = NOW()
         WHERE id = $7;`,
        [body.name, body.email, body.roleId, roleName, body.status, pwdHash, id]
      );
    } else {
      await db.query(
        `UPDATE admin_users SET name = $1, email = $2, role_id = $3, role_name = $4, status = $5, updated_at = NOW()
         WHERE id = $6;`,
        [body.name, body.email, body.roleId, roleName, body.status, id]
      );
    }

    await logActivity(user, "Admin User Updated", "AdminUser", id, `Updated admin user ${body.name}`);

    return NextResponse.json({ success: true, message: "Admin user updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("admin_users.delete");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();

    if (id === user.id) {
      return NextResponse.json({ success: false, error: "Cannot delete your own active session." }, { status: 400 });
    }

    await db.query("DELETE FROM admin_users WHERE id = $1;", [id]);
    await logActivity(user, "Admin User Deleted", "AdminUser", id, `Deleted admin user ID ${id}`);

    return NextResponse.json({ success: true, message: "Admin user deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
