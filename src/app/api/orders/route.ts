import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("orders.view");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const db = await getDb();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(order_number) LIKE $${params.length} OR LOWER(customer_name) LIKE $${params.length} OR LOWER(recipient_name) LIKE $${params.length} OR LOWER(customer_phone) LIKE $${params.length})`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    // Total count
    const countRes = await db.query(`SELECT COUNT(*) as count FROM orders ${whereClause};`, params);
    const total = parseInt(countRes.rows?.[0]?.count || "0", 10);

    // Query rows
    const queryParams = [...params, limit, offset];
    const dataRes = await db.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};`,
      queryParams
    );

    const formattedOrders = (dataRes.rows || []).map((row: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      total,
      page,
      limit,
    });
  } catch (err: any) {
    console.error("GET /api/orders Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("orders.update");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `HD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const timeline = [
      { id: `tl-init`, status: body.status || "CONFIRMED", note: "Order manually created by Admin", updatedBy: user.name, timestamp: now }
    ];

    await db.query(
      `INSERT INTO orders (
        id, order_number, customer_id, customer_name, customer_email, customer_phone,
        recipient_name, recipient_phone, delivery_address, city, pincode, landmark,
        delivery_date, delivery_time_slot, occasion, presenter_required, presenter_note,
        special_instructions, items, subtotal, addons_total, delivery_fee, discount_amount,
        total_amount, status, payment_status, payment_method, assigned_staff_id, assigned_staff_name,
        internal_notes, timeline, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW(), NOW()
      );`,
      [
        orderId, orderNumber, body.customerId || "cust-101", body.customerName, body.customerEmail, body.customerPhone,
        body.recipientName, body.recipientPhone, body.deliveryAddress, body.city || "Mumbai", body.pincode || "400001", body.landmark || "",
        body.deliveryDate, body.deliveryTimeSlot, body.occasion || "birthday", body.presenterRequired ?? true, body.presenterNote || "",
        body.specialInstructions || "", JSON.stringify(body.items || []), body.subtotal || 1499, body.addonsTotal || 0, body.deliveryFee || 0, body.discountAmount || 0,
        body.totalAmount || 1499, body.status || "CONFIRMED", body.paymentStatus || "PAID", body.paymentMethod || "Razorpay", body.assignedStaffId || null, body.assignedStaffName || null,
        body.internalNotes || "", JSON.stringify(timeline)
      ]
    );

    // Create delivery record
    await db.query(
      `INSERT INTO deliveries (id, order_id, order_number, customer_name, customer_phone, recipient_name, recipient_phone, delivery_address, city, pincode, delivery_date, delivery_time_slot, assigned_presenter_id, assigned_presenter_name, status, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW());`,
      [
        `del-${orderId}`, orderId, orderNumber, body.customerName, body.customerPhone, body.recipientName, body.recipientPhone, body.deliveryAddress, body.city || "Mumbai", body.pincode || "400001", body.deliveryDate, body.deliveryTimeSlot, body.assignedStaffId || null, body.assignedStaffName || null, body.assignedStaffId ? "ASSIGNED" : "UNASSIGNED", body.specialInstructions || ""
      ]
    );

    await logActivity(user, "Order Created", "Order", orderId, `Created order ${orderNumber} for ${body.customerName}`);

    return NextResponse.json({ success: true, data: { id: orderId, orderNumber } });
  } catch (err: any) {
    console.error("POST /api/orders Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
