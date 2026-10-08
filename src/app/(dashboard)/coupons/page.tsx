"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiRequest } from "@/services/apiService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Ticket, Plus, Trash2, Edit2 } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderValue, setMinOrderValue] = useState("999");
  const [usageLimit, setUsageLimit] = useState("100");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/coupons");
    if (res.success && res.data) {
      setCoupons(res.data);
    } else {
      setError(res.error || "Failed to load coupons.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("SURPRISE" + Math.floor(100 + Math.random() * 900));
    setDescription("Special promotional discount");
    setDiscountType("FIXED");
    setDiscountValue("150");
    setMinOrderValue("1000");
    setUsageLimit("100");
    setExpiryDate("2026-12-31");
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const endpoint = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
    const method = editingCoupon ? "PUT" : "POST";

    const res = await apiRequest(endpoint, {
      method,
      body: JSON.stringify({
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue),
        usageLimit: parseInt(usageLimit, 10),
        startDate: new Date().toISOString().split("T")[0],
        expiryDate,
        isActive: true,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast(editingCoupon ? "Coupon updated" : "Coupon created successfully!", "success");
      setIsModalOpen(false);
      fetchCoupons();
    } else {
      showToast(res.error || "Failed to save coupon", "error");
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await apiRequest(`/api/coupons/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);

    if (res.success) {
      showToast("Coupon deleted", "success");
      fetchCoupons();
    } else {
      showToast(res.error || "Failed to delete coupon", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Promotional Coupons & Discounts"
        description="Create discount codes, set order value limits, and track redemption statistics"
        action={
          <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Create New Coupon
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCoupons} />
      ) : coupons.length === 0 ? (
        <EmptyState title="No active coupons" description="Create promotional coupons to boost bookings." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order Value</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-bold text-rose-600">
                  {c.code}
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-medium">{c.description}</TableCell>
                <TableCell className="font-bold text-slate-900">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">{formatCurrency(c.minOrderValue)}</TableCell>
                <TableCell className="text-xs text-slate-700 font-semibold">
                  {c.usageCount} / {c.usageLimit}
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">{formatDate(c.expiryDate)}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "danger"}>
                    {c.isActive ? "Active" : "Expired"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleSaveCoupon} className="space-y-4">
          <Input
            label="Coupon Code *"
            placeholder="e.g. FESTIVE200"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />

          <Input
            label="Description"
            placeholder="Flat discount details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type *"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              options={[
                { value: "FIXED", label: "Fixed Amount (₹)" },
                { value: "PERCENTAGE", label: "Percentage (%)" },
              ]}
            />
            <Input
              label="Discount Value *"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Order Value (₹)"
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
            />
            <Input
              label="Usage Limit"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </div>

          <Input
            label="Expiry Date *"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon?"
        message="Are you sure you want to delete this coupon code?"
        isLoading={deleting}
      />
    </div>
  );
}
