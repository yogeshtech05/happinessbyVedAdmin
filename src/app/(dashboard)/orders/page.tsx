"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";
import { Search, Eye, Filter, Plus, Calendar, User, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({
      search,
      status: statusFilter,
      page: page.toString(),
      limit: "10",
    });

    const res = await apiRequest(`/api/orders?${query.toString()}`);
    if (res.success && res.data) {
      setOrders(res.data);
      setTotalItems(res.total || res.data.length);
    } else {
      setError(res.error || "Failed to load orders.");
    }
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Order Management"
        description="Track, update, and manage customer surprise delivery bookings"
      />

      {/* Filters Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <Input
            placeholder="Search order #, customer, recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs bg-[#f8fafc]"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "PENDING", label: "Pending" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "PREPARING", label: "Preparing" },
                { value: "READY", label: "Ready" },
                { value: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" description="No customer orders match your search criteria." />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Occasion</TableHead>
                <TableHead>Surprise Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const badge = getOrderStatusBadge(o.status);
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{o.customerName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{o.customerPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{o.recipientName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{o.city}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-xs text-rose-600 font-semibold">
                      {o.occasion}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {formatDate(o.deliveryDate)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {formatCurrency(o.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={badge.bg + " " + badge.text + " " + badge.border}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-rose-600 border border-slate-200 shadow-3d-sm active:translate-y-0.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            pageSize={10}
            totalItems={totalItems}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
