import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const res = await db.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role_id, u.role_name, u.status, u.avatar_url, r.permissions
       FROM admin_users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = LOWER($1);`,
      [email]
    );

    if (!res.rows || res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const userRow = res.rows[0];

    if (userRow.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Account is suspended or inactive." },
        { status: 403 }
      );
    }

    const isMatch = comparePassword(password, userRow.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    let permissions: string[] = [];
    try {
      permissions = typeof userRow.permissions === "string" ? JSON.parse(userRow.permissions) : userRow.permissions || [];
    } catch {
      permissions = [];
    }

    const adminUser = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      roleId: userRow.role_id,
      roleName: userRow.role_name,
      status: userRow.status,
      avatarUrl: userRow.avatar_url,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = signToken(adminUser);
    await setAuthCookie(token);

    // Update last login
    await db.query("UPDATE admin_users SET last_login_at = NOW() WHERE id = $1;", [adminUser.id]);

    // Audit log
    await logActivity(
      adminUser,
      "Admin Login",
      "AdminUser",
      adminUser.id,
      `Admin logged in successfully (${adminUser.email})`
    );

    return NextResponse.json({
      success: true,
      data: adminUser,
    });
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server authentication error." },
      { status: 500 }
    );
  }
}
