import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("coupons.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM coupons ORDER BY created_at DESC;");

    const coupons = (res.rows || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      description: row.description,
      discountType: row.discount_type,
      discountValue: parseFloat(row.discount_value),
      minOrderValue: parseFloat(row.min_order_value || "0"),
      maxDiscountAmount: row.max_discount_amount ? parseFloat(row.max_discount_amount) : undefined,
      usageLimit: row.usage_limit,
      usageCount: row.usage_count,
      startDate: row.start_date,
      expiryDate: row.expiry_date,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, data: coupons });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("coupons.create");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    const couponId = `cup-${Date.now()}`;
    const code = (body.code || "SURPRISE10").toUpperCase();

    await db.query(
      `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, usage_count, start_date, expiry_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11, NOW(), NOW());`,
      [
        couponId, code, body.description || "", body.discountType || "PERCENTAGE",
        body.discountValue || 10, body.minOrderValue || 0, body.maxDiscountAmount || null,
        body.usageLimit || 100, body.startDate || new Date().toISOString().split("T")[0],
        body.expiryDate || "2026-12-31", body.isActive ?? true
      ]
    );

    await logActivity(user, "Coupon Created", "Coupon", couponId, `Created coupon ${code}`);

    return NextResponse.json({ success: true, data: { id: couponId, code } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
