import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("deliveries.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    const existingRes = await db.query("SELECT * FROM deliveries WHERE id = $1;", [id]);
    if (!existingRes.rows || existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Delivery record not found" }, { status: 404 });
    }

    const row = existingRes.rows[0];
    const presenterId = body.assignedPresenterId !== undefined ? body.assignedPresenterId : row.assigned_presenter_id;
    const presenterName = body.assignedPresenterName !== undefined ? body.assignedPresenterName : row.assigned_presenter_name;
    const status = body.status || row.status;
    const notes = body.notes !== undefined ? body.notes : row.notes;
    const completedAt = status === "DELIVERED" ? new Date().toISOString() : row.completed_at;

    await db.query(
      `UPDATE deliveries SET 
        assigned_presenter_id = $1, assigned_presenter_name = $2, status = $3, notes = $4, completed_at = $5, updated_at = NOW()
       WHERE id = $6;`,
      [presenterId, presenterName, status, notes, completedAt, id]
    );

    // Sync order status if delivery marked completed or out for delivery
    let orderStatus = null;
    if (status === "OUT_FOR_DELIVERY") orderStatus = "OUT_FOR_DELIVERY";
    else if (status === "DELIVERED") orderStatus = "DELIVERED";
    else if (status === "FAILED") orderStatus = "CANCELLED";

    if (orderStatus) {
      await db.query(
        "UPDATE orders SET status = $1, assigned_staff_id = $2, assigned_staff_name = $3, updated_at = NOW() WHERE id = $4;",
        [orderStatus, presenterId, presenterName, row.order_id]
      );
    }

    await logActivity(user, "Delivery Updated", "Delivery", id, `Delivery ${row.order_number} status updated to ${status}`);

    return NextResponse.json({ success: true, message: "Delivery updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
