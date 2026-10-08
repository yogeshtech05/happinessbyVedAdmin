"use client";

import React, { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, User, Phone, Mail, MapPin, ShoppingBag, ShieldAlert, CheckCircle, Ban } from "lucide-react";
import Link from "next/link";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const fetchCustomerDetail = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest(`/api/customers/${id}`);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Customer profile not found.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const toggleCustomerBlock = async () => {
    if (!data?.customer) return;
    setUpdating(true);
    const newStatus = data.customer.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const res = await apiRequest(`/api/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...data.customer,
        status: newStatus,
      }),
    });
    setUpdating(false);

    if (res.success) {
      showToast(`Customer account ${newStatus.toLowerCase()}`, "info");
      fetchCustomerDetail();
    } else {
      showToast(res.error || "Failed to update customer status", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link href="/customers" className="text-xs font-semibold text-rose-400 hover:underline">
          ← Back to Customers
        </Link>
        <ErrorState message={error} />
      </div>
    );
  }

  const { customer, orders } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
      </Link>

      <PageHeader
        title={customer.name}
        description={`Customer Account #${customer.id}`}
        action={
          <Button
            variant={customer.status === "ACTIVE" ? "danger" : "primary"}
            onClick={toggleCustomerBlock}
            isLoading={updating}
            leftIcon={customer.status === "ACTIVE" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          >
            {customer.status === "ACTIVE" ? "Block Customer" : "Activate Customer"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Details</CardTitle>
              <Badge variant={customer.status === "ACTIVE" ? "success" : "danger"}>
                {customer.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="text-slate-500 font-bold">Email Address</p>
              <p className="text-slate-700 font-medium flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-bold">Phone Number</p>
              <p className="text-slate-700 font-medium flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-bold">Address & City</p>
              <p className="text-slate-700 font-medium flex items-start gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{customer.address || "N/A"}, {customer.city}</span>
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
                <p className="text-[10px] text-slate-500 font-bold">Total Orders</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">{customer.totalOrders}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
                <p className="text-[10px] text-slate-500 font-bold">Total Spent</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              Surprise Order History ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <EmptyState title="No orders placed yet" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o: any) => {
                    const badge = getOrderStatusBadge(o.status);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-900">
                          <Link href={`/orders/${o.id}`} className="hover:text-rose-600">
                            {o.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-slate-800 font-bold">{o.recipientName}</TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">{formatDate(o.deliveryDate)}</TableCell>
                        <TableCell className="font-bold text-slate-900">{formatCurrency(o.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge className={badge.bg + " " + badge.text}>{badge.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
