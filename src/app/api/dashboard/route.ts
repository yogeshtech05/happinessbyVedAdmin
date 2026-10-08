import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("dashboard.view");
  if (error) return error;

  try {
    const db = await getDb();

    // 1. Total Customers
    const custRes = await db.query("SELECT COUNT(*) as count FROM customers;");
    const totalCustomers = parseInt(custRes.rows?.[0]?.count || "0", 10);

    // 2. Orders summary by status & revenue
    const ordersRes = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'PREPARING' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'OUT_FOR_DELIVERY' THEN 1 END) as out_for_delivery,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END), 0) as today_revenue
      FROM orders;
    `);

    const row = ordersRes.rows?.[0] || {};
    const totalOrders = parseInt(row.total_orders || "0", 10);
    const totalRevenue = parseFloat(row.total_revenue || "0");
    const pendingOrders = parseInt(row.pending_orders || "0", 10);
    const confirmedOrders = parseInt(row.confirmed_orders || "0", 10);
    const preparingOrders = parseInt(row.preparing_orders || "0", 10);
    const outForDeliveryOrders = parseInt(row.out_for_delivery || "0", 10);
    const deliveredOrders = parseInt(row.delivered_orders || "0", 10);
    const cancelledOrders = parseInt(row.cancelled_orders || "0", 10);
    const todayOrders = parseInt(row.today_orders || "0", 10);
    const todayRevenue = parseFloat(row.today_revenue || "0");

    // 3. Active Packages count
    const pkgRes = await db.query("SELECT COUNT(*) as count FROM packages WHERE is_active = TRUE;");
    const activePackages = parseInt(pkgRes.rows?.[0]?.count || "0", 10);

    // 4. Pending deliveries count
    const delRes = await db.query("SELECT COUNT(*) as count FROM deliveries WHERE status IN ('UNASSIGNED', 'ASSIGNED', 'PREPARING', 'OUT_FOR_DELIVERY');");
    const pendingDeliveries = parseInt(delRes.rows?.[0]?.count || "0", 10);

    // 5. Recent Orders
    const recentOrdersRes = await db.query(`
      SELECT id, order_number, customer_name, recipient_name, total_amount, status, delivery_date, delivery_time_slot, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    // 6. Upcoming Deliveries
    const upcomingDelRes = await db.query(`
      SELECT id, order_number, customer_name, recipient_name, delivery_address, delivery_date, delivery_time_slot, status, assigned_presenter_name
      FROM deliveries
      WHERE status != 'DELIVERED' AND status != 'CANCELLED'
      ORDER BY delivery_date ASC
      LIMIT 5;
    `);

    // 7. Recent Customers
    const recentCustRes = await db.query(`
      SELECT id, name, email, phone, city, total_orders, total_spent, created_at
      FROM customers
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    // 8. Order Status Distribution Chart Data
    const statusDistribution = [
      { name: "Pending", value: pendingOrders, color: "#f59e0b" },
      { name: "Confirmed", value: confirmedOrders, color: "#3b82f6" },
      { name: "Preparing", value: preparingOrders, color: "#6366f1" },
      { name: "Out for Delivery", value: outForDeliveryOrders, color: "#ec4899" },
      { name: "Delivered", value: deliveredOrders, color: "#10b981" },
      { name: "Cancelled", value: cancelledOrders, color: "#ef4444" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          totalOrders,
          todayOrders,
          pendingOrders,
          confirmedOrders,
          preparingOrders,
          outForDeliveryOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          todayRevenue,
          upcomingSurprises: pendingOrders + confirmedOrders + preparingOrders,
          pendingDeliveries,
          activePackages,
        },
        recentOrders: recentOrdersRes.rows || [],
        upcomingDeliveries: upcomingDelRes.rows || [],
        recentCustomers: recentCustRes.rows || [],
        statusDistribution,
      },
    });
  } catch (err: any) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard analytics." },
      { status: 500 }
    );
  }
}
