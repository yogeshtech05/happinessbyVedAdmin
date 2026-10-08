import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("customers.view");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();
    const custRes = await db.query("SELECT * FROM customers WHERE id = $1;", [id]);

    if (!custRes.rows || custRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const row = custRes.rows[0];
    const customer = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      totalOrders: parseInt(row.total_orders || "0", 10),
      totalSpent: parseFloat(row.total_spent || "0"),
      city: row.city,
      address: row.address,
      pincode: row.pincode,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Fetch order history for customer
    const ordersRes = await db.query("SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC;", [id]);
    const orders = (ordersRes.rows || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      recipientName: o.recipient_name,
      deliveryDate: o.delivery_date,
      totalAmount: parseFloat(o.total_amount),
      status: o.status,
      createdAt: o.created_at,
    }));

    return NextResponse.json({ success: true, data: { customer, orders } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("customers.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.query(
      `UPDATE customers SET name = $1, email = $2, phone = $3, status = $4, city = $5, address = $6, pincode = $7, notes = $8, updated_at = NOW()
       WHERE id = $9;`,
      [body.name, body.email, body.phone, body.status, body.city, body.address, body.pincode, body.notes, id]
    );

    await logActivity(user, "Customer Updated", "Customer", id, `Updated customer ${body.name} (${body.status})`);

    return NextResponse.json({ success: true, message: "Customer updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("customers.delete");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();

    await db.query("DELETE FROM customers WHERE id = $1;", [id]);
    await logActivity(user, "Customer Deleted", "Customer", id, `Deleted customer ID ${id}`);

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
