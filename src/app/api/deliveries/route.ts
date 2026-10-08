import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("deliveries.view");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const db = await getDb();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(order_number) LIKE $${params.length} OR LOWER(recipient_name) LIKE $${params.length} OR LOWER(customer_name) LIKE $${params.length} OR LOWER(assigned_presenter_name) LIKE $${params.length})`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const res = await db.query(`SELECT * FROM deliveries ${whereClause} ORDER BY delivery_date ASC;`, params);

    const deliveries = (res.rows || []).map((row: any) => ({
      id: row.id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      recipientName: row.recipient_name,
      recipientPhone: row.recipient_phone,
      deliveryAddress: row.delivery_address,
      city: row.city,
      pincode: row.pincode,
      deliveryDate: row.delivery_date,
      deliveryTimeSlot: row.delivery_time_slot,
      assignedPresenterId: row.assigned_presenter_id,
      assignedPresenterName: row.assigned_presenter_name,
      status: row.status,
      notes: row.notes,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, data: deliveries });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
