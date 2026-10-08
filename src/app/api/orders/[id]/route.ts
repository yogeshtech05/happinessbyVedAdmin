import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("orders.view");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();
    const res = await db.query("SELECT * FROM orders WHERE id = $1;", [id]);

    if (!res.rows || res.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const row = res.rows[0];
    const order = {
      id: row.id,
      orderNumber: row.order_number,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      recipientName: row.recipient_name,
      recipientPhone: row.recipient_phone,
      deliveryAddress: row.delivery_address,
      city: row.city,
      pincode: row.pincode,
      landmark: row.landmark,
      deliveryDate: row.delivery_date,
      deliveryTimeSlot: row.delivery_time_slot,
      occasion: row.occasion,
      presenterRequired: row.presenter_required,
      presenterNote: row.presenter_note,
      specialInstructions: row.special_instructions,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items || [],
      subtotal: parseFloat(row.subtotal),
      addonsTotal: parseFloat(row.addons_total),
      deliveryFee: parseFloat(row.delivery_fee),
      discountAmount: parseFloat(row.discount_amount),
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      assignedStaffId: row.assigned_staff_id,
      assignedStaffName: row.assigned_staff_name,
      internalNotes: row.internal_notes,
      timeline: typeof row.timeline === "string" ? JSON.parse(row.timeline) : row.timeline || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("orders.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    // Fetch existing order
    const existingRes = await db.query("SELECT * FROM orders WHERE id = $1;", [id]);
    if (!existingRes.rows || existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const row = existingRes.rows[0];
    let timeline = typeof row.timeline === "string" ? JSON.parse(row.timeline) : row.timeline || [];

    const newStatus = body.status || row.status;
    const note = body.note || `Status updated to ${newStatus}`;
    const assignedStaffId = body.assignedStaffId !== undefined ? body.assignedStaffId : row.assigned_staff_id;
    const assignedStaffName = body.assignedStaffName !== undefined ? body.assignedStaffName : row.assigned_staff_name;
    const internalNotes = body.internalNotes !== undefined ? body.internalNotes : row.internal_notes;

    if (newStatus !== row.status || body.note) {
      timeline.push({
        id: `tl-${Date.now()}`,
        status: newStatus,
        note,
        updatedBy: user.name,
        timestamp: new Date().toISOString(),
      });
    }

    await db.query(
      `UPDATE orders 
       SET status = $1, assigned_staff_id = $2, assigned_staff_name = $3, internal_notes = $4, timeline = $5, updated_at = NOW()
       WHERE id = $6;`,
      [newStatus, assignedStaffId, assignedStaffName, internalNotes, JSON.stringify(timeline), id]
    );

    // Update delivery record if status changed
    let delStatus = "UNASSIGNED";
    if (newStatus === "OUT_FOR_DELIVERY") delStatus = "OUT_FOR_DELIVERY";
    else if (newStatus === "DELIVERED") delStatus = "DELIVERED";
    else if (newStatus === "CANCELLED") delStatus = "CANCELLED";
    else if (assignedStaffId) delStatus = "ASSIGNED";

    await db.query(
      `UPDATE deliveries 
       SET status = $1, assigned_presenter_id = $2, assigned_presenter_name = $3, updated_at = NOW()
       WHERE order_id = $4;`,
      [delStatus, assignedStaffId, assignedStaffName, id]
    );

    await logActivity(
      user,
      "Order Updated",
      "Order",
      id,
      `Order ${row.order_number} status updated to ${newStatus}`
    );

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
