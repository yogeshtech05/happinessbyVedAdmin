"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency, formatDate, getOrderStatusBadge, getDeliveryStatusBadge } from "@/lib/utils";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Gift,
  Truck,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/dashboard");
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to load dashboard data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard Overview" description="Loading real-time store metrics..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard Overview" />
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time performance analytics for Happiness Deliver platform"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Metrics
          </Button>
        }
      />

      {/* Primary Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue || 0)}
          subtitle={`Today: ${formatCurrency(metrics.todayRevenue || 0)}`}
          icon={<DollarSign className="w-6 h-6" />}
          accentColor="emerald"
        />
        <StatCard
          title="Total Orders"
          value={metrics.totalOrders || 0}
          subtitle={`Today's New: ${metrics.todayOrders || 0}`}
          icon={<ShoppingBag className="w-6 h-6" />}
          accentColor="rose"
        />
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers || 0}
          subtitle="Registered customer base"
          icon={<Users className="w-6 h-6" />}
          accentColor="blue"
        />
        <StatCard
          title="Pending Deliveries"
          value={metrics.pendingDeliveries || 0}
          subtitle={`${metrics.upcomingSurprises || 0} upcoming surprises`}
          icon={<Truck className="w-6 h-6" />}
          accentColor="amber"
        />
      </div>

      {/* Secondary Status Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm text-center hover:shadow-3d transition-all duration-200">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">Pending</p>
          <p className="text-xl font-black text-amber-600 mt-1">{metrics.pendingOrders || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm text-center hover:shadow-3d transition-all duration-200">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">Confirmed</p>
          <p className="text-xl font-black text-blue-600 mt-1">{metrics.confirmedOrders || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm text-center hover:shadow-3d transition-all duration-200">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">Preparing</p>
          <p className="text-xl font-black text-indigo-600 mt-1">{metrics.preparingOrders || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm text-center hover:shadow-3d transition-all duration-200">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">Out for Delivery</p>
          <p className="text-xl font-black text-pink-600 mt-1">{metrics.outForDeliveryOrders || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm text-center hover:shadow-3d transition-all duration-200">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">Delivered</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{metrics.deliveredOrders || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm text-center hover:shadow-3d transition-all duration-200">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">Cancelled</p>
          <p className="text-xl font-black text-rose-600 mt-1">{metrics.cancelledOrders || 0}</p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link
              href="/orders"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Surprise Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.recentOrders || []).map((order: any) => {
                  const badge = getOrderStatusBadge(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{order.recipient_name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">By {order.customer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        {formatDate(order.delivery_date)}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {formatCurrency(parseFloat(order.total_amount))}
                      </TableCell>
                      <TableCell>
                        <Badge className={badge.bg + " " + badge.text + " " + badge.border}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-1 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition inline-flex shadow-3d-sm"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <StatusPieChart data={data?.statusDistribution || []} />
      </div>

      {/* Secondary Grid: Upcoming Deliveries & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Surprise Deliveries</CardTitle>
            <Link
              href="/deliveries"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.upcomingDeliveries || []).map((del: any) => {
              const badge = getDeliveryStatusBadge(del.status);
              return (
                <div
                  key={del.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm hover:shadow-3d transition-all duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600">
                        {del.order_number}
                      </span>
                      <Badge className={badge.bg + " " + badge.text}>{badge.label}</Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Recipient: {del.recipient_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                      {del.delivery_address}, {del.city}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(del.delivery_date)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Presenter: {del.assigned_presenter_name || "Unassigned"}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Customers</CardTitle>
            <Link
              href="/customers"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              All Customers <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentCustomers || []).map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm hover:shadow-3d transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs shadow-3d-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{c.name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">{c.email} • {c.city || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-600">
                    {formatCurrency(parseFloat(c.total_spent))}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">{c.total_orders} Orders</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
