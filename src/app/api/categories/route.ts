import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("packages.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM categories ORDER BY created_at ASC;");

    const categories = (res.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline,
      icon: row.icon,
      packageCount: row.package_count,
      gradient: row.gradient,
      accentColor: row.accent_color,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
