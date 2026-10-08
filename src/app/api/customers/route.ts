import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("customers.view");
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
      whereClause += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length} OR LOWER(city) LIKE $${params.length})`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const res = await db.query(`SELECT * FROM customers ${whereClause} ORDER BY created_at DESC;`, params);

    const customers = (res.rows || []).map((row: any) => ({
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
    }));

    return NextResponse.json({ success: true, data: customers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("customers.create");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    const custId = `cust-${Date.now()}`;
    await db.query(
      `INSERT INTO customers (id, name, email, phone, status, city, address, pincode, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW());`,
      [
        custId, body.name, body.email, body.phone, body.status || "ACTIVE",
        body.city || "", body.address || "", body.pincode || "", body.notes || ""
      ]
    );

    await logActivity(user, "Customer Created", "Customer", custId, `Created customer ${body.name}`);

    return NextResponse.json({ success: true, data: { id: custId } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
