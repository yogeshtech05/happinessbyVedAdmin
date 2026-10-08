"use client";

import React, { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency, formatDateTime, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  DollarSign,
  History,
  FileText,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  Heart,
  Music,
} from "lucide-react";
import Link from "next/link";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("CONFIRMED");
  const [statusNote, setStatusNote] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest(`/api/orders/${id}`);
    if (res.success && res.data) {
      setOrder(res.data);
      setNewStatus(res.data.status);
      setAssignedStaff(res.data.assignedStaffName || "");
    } else {
      setError(res.error || "Order not found");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const res = await apiRequest(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus}`,
        assignedStaffName: assignedStaff,
      }),
    });
    setUpdating(false);

    if (res.success) {
      showToast("Order status updated successfully!", "success");
      setIsUpdateModalOpen(false);
      setStatusNote("");
      fetchOrderDetail();
    } else {
      showToast(res.error || "Failed to update order status", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <ErrorState message={error} onRetry={fetchOrderDetail} />
      </div>
    );
  }

  const statusBadge = getOrderStatusBadge(order.status);
  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {order.orderNumber}
            </h1>
            <Badge className={statusBadge.bg + " " + statusBadge.text + " " + statusBadge.border}>
              {statusBadge.label}
            </Badge>
            <Badge className={paymentBadge.bg + " " + paymentBadge.text}>
              {paymentBadge.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Booked on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsUpdateModalOpen(true)}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            Update Order Status
          </Button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient & Surprise Details Card */}
          <Card className="border-rose-200/80 shadow-3d">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                Surprise Delivery Information
              </CardTitle>
              <Badge variant="outline" className="capitalize text-rose-600 bg-rose-50 border-rose-200 font-bold shadow-3d-sm">
                Occasion: {order.occasion}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
                <div>
                  <p className="text-xs font-bold text-slate-500">Recipient Name</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{order.recipientName}</p>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-rose-500" /> {order.recipientPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Surprise Date & Time Slot</p>
                  <p className="text-sm font-bold text-rose-600 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {formatDate(order.deliveryDate)}
                  </p>
                  <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {order.deliveryTimeSlot}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Delivery Address
                </p>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-xs text-slate-700 space-y-1 shadow-3d-inset">
                  <p className="font-bold text-slate-900">{order.deliveryAddress}</p>
                  <p className="text-slate-500 font-medium">
                    City: <span className="text-slate-800 font-semibold">{order.city}</span> | Pincode:{" "}
                    <span className="text-slate-800 font-semibold">{order.pincode}</span>
                  </p>
                  {order.landmark && (
                    <p className="text-amber-700 font-semibold">Landmark: {order.landmark}</p>
                  )}
                </div>
              </div>

              {/* Presenter Instructions */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2 shadow-3d-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-rose-700 font-bold flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-rose-600" /> Female Presenter Requirement
                  </span>
                  <Badge variant={order.presenterRequired ? "success" : "outline"}>
                    {order.presenterRequired ? "Presenter Requested" : "Standard Delivery"}
                  </Badge>
                </div>
                {order.presenterNote && (
                  <p className="text-xs text-slate-700 font-medium italic">
                    &ldquo;{order.presenterNote}&rdquo;
                  </p>
                )}
                {order.specialInstructions && (
                  <p className="text-xs text-amber-800 font-semibold">
                    Special Instructions: {order.specialInstructions}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items & Customizations */}
          <Card>
            <CardHeader>
              <CardTitle>Booked Packages & Add-ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-mono font-medium">Slug: {item.slug}</p>
                    </div>
                    <span className="text-base font-bold text-rose-600">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  {item.customMessage && (
                    <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs text-slate-700 shadow-3d-inset">
                      <span className="font-bold text-rose-600 block mb-0.5">
                        Scroll Greeting Card Message:
                      </span>
                      &ldquo;{item.customMessage}&rdquo;
                    </div>
                  )}

                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-500">Selected Addons:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.selectedAddons.map((add: any) => (
                          <span
                            key={add.id}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold shadow-3d-sm flex items-center gap-1.5"
                          >
                            <span>{add.name}</span>
                            <span className="text-rose-600 font-extrabold">
                              +{formatCurrency(add.price)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timeline Audit History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Order Timeline Audit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {order.timeline.map((event: any, i: number) => (
                  <div key={event.id || i} className="relative flex items-start gap-4 pl-8">
                    <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-3d-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{event.status}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{event.note}</p>
                      <p className="text-[10px] text-rose-600 font-semibold">By: {event.updatedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Info & Financials */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                Customer Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500 font-bold">Customer Name</p>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold">Email Address</p>
                <p className="text-slate-700 font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {order.customerEmail}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-bold">Phone Number</p>
                <p className="text-slate-700 font-medium flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customerPhone}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/customers/${order.customerId}`}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center justify-between"
                >
                  <span>View Customer Profile & History</span>
                  <span>→</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Staff Presenter */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Presenter / Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-xs shadow-3d-sm">
                <p className="text-slate-500 font-bold">Assigned Staff Name:</p>
                <p className="text-sm font-extrabold text-rose-600 mt-0.5">
                  {order.assignedStaffName || "Unassigned"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Addons Total</span>
                <span className="text-slate-900 font-bold">
                  +{formatCurrency(order.addonsTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-rose-600 font-extrabold">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-500 text-right font-medium">
                Method: <span className="text-slate-700 font-bold">{order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Order Status"
        description={`Modify current status for order #${order.orderNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="Order Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: "PENDING", label: "PENDING - Awaiting Verification" },
              { value: "CONFIRMED", label: "CONFIRMED - Payment Verified" },
              { value: "PREPARING", label: "PREPARING - Cake & Florals Packing" },
              { value: "READY", label: "READY - Ready for Host Pickup" },
              { value: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY - Presenter En Route" },
              { value: "DELIVERED", label: "DELIVERED - Completed" },
              { value: "CANCELLED", label: "CANCELLED - Order Cancelled" },
            ]}
          />

          <Input
            label="Assigned Presenter / Staff Name"
            placeholder="e.g. Sneha Patel (Presenter)"
            value={assignedStaff}
            onChange={(e) => setAssignedStaff(e.target.value)}
          />

          <Input
            label="Audit Note / Log Details"
            placeholder="Reason or update note for customer/audit history..."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updating}>
              Save Status Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
