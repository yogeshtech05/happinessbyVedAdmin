import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { AdminUser } from "@/types";
import { getDb } from "@/db";

const JWT_SECRET = process.env.JWT_SECRET || "happiness_deliver_admin_super_secret_jwt_key_2026_prod";
const TOKEN_COOKIE_NAME = "hd_admin_session";

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  iat?: number;
  exp?: number;
}

export function signToken(user: AdminUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.roleName,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60, // 12 hours
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return null;

    const db = await getDb();
    const res = await db.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.role_name, u.status, u.avatar_url, u.last_login_at, u.created_at, u.updated_at, r.permissions
       FROM admin_users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.status = 'ACTIVE';`,
      [payload.sub]
    );

    if (!res.rows || res.rows.length === 0) return null;

    const row = res.rows[0];
    let permissions: string[] = [];
    try {
      permissions = typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions || [];
    } catch {
      permissions = [];
    }

    return {
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
      permissions,
    };
  } catch (err) {
    console.error("getCurrentAdmin error:", err);
    return null;
  }
}

export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText, 10);
}

export function comparePassword(plainText: string, hash: string): boolean {
  return bcrypt.compareSync(plainText, hash);
}
