import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("reviews.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM reviews ORDER BY created_at DESC;");

    const reviews = (res.rows || []).map((row: any) => ({
      id: row.id,
      orderId: row.order_id,
      packageId: row.package_id,
      packageName: row.package_name,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      status: row.status,
      isFeatured: row.is_featured,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: reviews });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
