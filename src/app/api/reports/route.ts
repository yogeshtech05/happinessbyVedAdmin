import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("reports.view");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30days";
    const db = await getDb();

    // 1. Sales & Revenue metrics
    const revRes = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COALESCE(SUM(discount_amount), 0) as total_discounts
      FROM orders
      WHERE status != 'CANCELLED';
    `);

    const summary = revRes.rows?.[0] || {};

    // 2. Orders by occasion
    const occasionRes = await db.query(`
      SELECT occasion, COUNT(*) as count, SUM(total_amount) as total_revenue
      FROM orders
      WHERE status != 'CANCELLED'
      GROUP BY occasion;
    `);

    // 3. Top packages sold
    const topPackagesRes = await db.query(`
      SELECT title, occasion, price, rating, review_count
      FROM packages
      ORDER BY review_count DESC, rating DESC
      LIMIT 5;
    `);

    // 4. Delivery performance
    const delRes = await db.query(`
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COUNT(CASE WHEN status IN ('UNASSIGNED', 'ASSIGNED', 'OUT_FOR_DELIVERY') THEN 1 END) as active
      FROM deliveries;
    `);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders: parseInt(summary.total_orders || "0", 10),
          totalSales: parseFloat(summary.total_sales || "0"),
          avgOrderValue: parseFloat(summary.avg_order_value || "0"),
          totalDiscounts: parseFloat(summary.total_discounts || "0"),
        },
        occasions: occasionRes.rows || [],
        topPackages: topPackagesRes.rows || [],
        deliveries: delRes.rows?.[0] || {},
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
