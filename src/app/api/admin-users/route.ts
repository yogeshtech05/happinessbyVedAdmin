import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("admin_users.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.role_name, u.status, u.avatar_url, u.last_login_at, u.created_at, u.updated_at, r.permissions
       FROM admin_users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC;`
    );

    const adminUsers = (res.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleName: row.role_name,
      status: row.status,
      avatarUrl: row.avatar_url,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions || [],
    }));

    return NextResponse.json({ success: true, data: adminUsers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("admin_users.create");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    if (!body.email || !body.name || !body.password || !body.roleId) {
      return NextResponse.json({ success: false, error: "Missing required admin fields." }, { status: 400 });
    }

    const checkRes = await db.query("SELECT id FROM admin_users WHERE LOWER(email) = LOWER($1);", [body.email]);
    if (checkRes.rows && checkRes.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Admin user with this email already exists." }, { status: 409 });
    }

    // Get role name
    const roleRes = await db.query("SELECT name FROM roles WHERE id = $1;", [body.roleId]);
    const roleName = roleRes.rows?.[0]?.name || "Staff";

    const adminId = `admin-${Date.now()}`;
    const passwordHash = hashPassword(body.password);

    await db.query(
      `INSERT INTO admin_users (id, name, email, password_hash, role_id, role_name, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW());`,
      [adminId, body.name, body.email, passwordHash, body.roleId, roleName, body.status || "ACTIVE"]
    );

    await logActivity(user, "Admin User Created", "AdminUser", adminId, `Created admin account for ${body.email} (${roleName})`);

    return NextResponse.json({ success: true, data: { id: adminId } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
