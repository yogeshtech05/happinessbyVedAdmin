import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("coupons.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.query(
      `UPDATE coupons SET code = $1, description = $2, discount_type = $3, discount_value = $4, min_order_value = $5, max_discount_amount = $6, usage_limit = $7, start_date = $8, expiry_date = $9, is_active = $10, updated_at = NOW()
       WHERE id = $11;`,
      [
        body.code.toUpperCase(), body.description, body.discountType, body.discountValue,
        body.minOrderValue, body.maxDiscountAmount, body.usageLimit, body.startDate, body.expiryDate, body.isActive, id
      ]
    );

    await logActivity(user, "Coupon Updated", "Coupon", id, `Updated coupon ${body.code}`);

    return NextResponse.json({ success: true, message: "Coupon updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("coupons.delete");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();

    await db.query("DELETE FROM coupons WHERE id = $1;", [id]);
    await logActivity(user, "Coupon Deleted", "Coupon", id, `Deleted coupon ID ${id}`);

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
