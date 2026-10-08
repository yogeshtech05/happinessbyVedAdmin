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
import { apiRequest } from "@/services/apiService";
import { formatDate, getDeliveryStatusBadge } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Truck, Search, Calendar, UserCheck, MapPin, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedDel, setSelectedDel] = useState<any | null>(null);
  const [presenterName, setPresenterName] = useState("");
  const [delStatus, setDelStatus] = useState("ASSIGNED");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ search, status: statusFilter });
    const res = await apiRequest(`/api/deliveries?${query.toString()}`);
    if (res.success && res.data) {
      setDeliveries(res.data);
    } else {
      setError(res.error || "Failed to load deliveries.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveries();
  }, [search, statusFilter]);

  const handleOpenAssignModal = (del: any) => {
    setSelectedDel(del);
    setPresenterName(del.assignedPresenterName || "Ananya Roy (Presenter Lead)");
    setDelStatus(del.status === "UNASSIGNED" ? "ASSIGNED" : del.status);
    setNotes(del.notes || "");
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDel) return;

    setUpdating(true);
    const res = await apiRequest(`/api/deliveries/${selectedDel.id}`, {
      method: "PUT",
      body: JSON.stringify({
        assignedPresenterName: presenterName,
        status: delStatus,
        notes,
      }),
    });
    setUpdating(false);

    if (res.success) {
      showToast("Delivery status updated successfully!", "success");
      setSelectedDel(null);
      fetchDeliveries();
    } else {
      showToast(res.error || "Failed to update delivery", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Surprise Delivery Management"
        description="Assign female surprise presenters, schedule delivery slots, and track completion"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search order #, recipient, presenter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs bg-[#f8fafc]"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Deliveries" },
              { value: "UNASSIGNED", label: "Unassigned" },
              { value: "ASSIGNED", label: "Presenter Assigned" },
              { value: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
              { value: "DELIVERED", label: "Completed" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDeliveries} />
      ) : deliveries.length === 0 ? (
        <EmptyState title="No deliveries found" description="No scheduled surprise deliveries match your filter." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Date & Time Slot</TableHead>
              <TableHead>Surprise Presenter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((del) => {
              const badge = getDeliveryStatusBadge(del.status);
              return (
                <TableRow key={del.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">
                    <Link href={`/orders/${del.orderId}`} className="hover:text-rose-600">
                      {del.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{del.recipientName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{del.recipientPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-600 font-medium max-w-xs truncate">
                      {del.deliveryAddress}, {del.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-rose-600">{formatDate(del.deliveryDate)}</span>
                      <span className="text-[10px] text-amber-600 font-semibold">{del.deliveryTimeSlot}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-800">
                      {del.assignedPresenterName || "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={badge.bg + " " + badge.text}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAssignModal(del)}
                      leftIcon={<UserCheck className="w-3.5 h-3.5 text-slate-500" />}
                    >
                      Assign / Update
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Assign Presenter Modal */}
      <Modal
        isOpen={!!selectedDel}
        onClose={() => setSelectedDel(null)}
        title="Assign Surprise Presenter"
        description={`Order #${selectedDel?.orderNumber} - Recipient: ${selectedDel?.recipientName}`}
      >
        <form onSubmit={handleSaveDelivery} className="space-y-4">
          <Input
            label="Assigned Female Presenter / Staff"
            placeholder="e.g. Ananya Roy (Presenter Lead)"
            value={presenterName}
            onChange={(e) => setPresenterName(e.target.value)}
            required
          />

          <Select
            label="Delivery Status"
            value={delStatus}
            onChange={(e) => setDelStatus(e.target.value)}
            options={[
              { value: "UNASSIGNED", label: "Unassigned" },
              { value: "ASSIGNED", label: "Presenter Assigned" },
              { value: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
              { value: "DELIVERED", label: "Completed & Delivered" },
              { value: "FAILED", label: "Delivery Failed" },
            ]}
          />

          <Input
            label="Presenter Instructions / Delivery Notes"
            placeholder="Notes regarding location, song request, entry..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSelectedDel(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updating}>
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
