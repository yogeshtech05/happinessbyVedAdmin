import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("products.view");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const db = await getDb();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "ALL") {
      params.push(category);
      whereClause += ` AND LOWER(category) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(sku) LIKE $${params.length})`;
    }

    const res = await db.query(`SELECT * FROM products ${whereClause} ORDER BY created_at DESC;`, params);

    const products = (res.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: parseFloat(row.price),
      costPrice: row.cost_price ? parseFloat(row.cost_price) : undefined,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      isAvailable: row.is_available,
      description: row.description,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("products.create");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    const prodId = `prod-${Date.now()}`;
    const sku = body.sku || `PROD-${Math.floor(100 + Math.random() * 900)}`;

    await db.query(
      `INSERT INTO products (id, name, category, price, cost_price, sku, stock_quantity, is_available, description, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW());`,
      [
        prodId, body.name, body.category || "Gifts", body.price || 499, body.costPrice || 200,
        sku, body.stockQuantity ?? 50, body.isAvailable ?? true, body.description || "", body.imageUrl || null
      ]
    );

    await logActivity(user, "Product Created", "Product", prodId, `Created product ${body.name}`);

    return NextResponse.json({ success: true, data: { id: prodId, sku } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
