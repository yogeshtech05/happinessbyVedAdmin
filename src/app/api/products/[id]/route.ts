import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("products.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.query(
      `UPDATE products SET name = $1, category = $2, price = $3, cost_price = $4, stock_quantity = $5, is_available = $6, description = $7, image_url = $8, updated_at = NOW()
       WHERE id = $9;`,
      [body.name, body.category, body.price, body.costPrice, body.stockQuantity, body.isAvailable, body.description, body.imageUrl, id]
    );

    await logActivity(user, "Product Updated", "Product", id, `Updated product ${body.name}`);

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("products.delete");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();

    await db.query("DELETE FROM products WHERE id = $1;", [id]);
    await logActivity(user, "Product Deleted", "Product", id, `Deleted product ${id}`);

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
